// ================================================
// 🔄 SYNCHRONISATION AUTOMATIQUE DES STOCKS
// ================================================
// Script pour corriger automatiquement les incohérences de stock

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface StockSyncResult {
  total: number
  updated: number
  skipped: number
  errors: number
  details: Array<{
    productId: string
    productName: string
    action: 'updated' | 'skipped' | 'error'
    oldStock: number
    newStock: number
    variantCount: number
    reason: string
  }>
}

/**
 * 🎯 SYNCHRONISER TOUS LES STOCKS SELON LA RÈGLE UNIFIÉE
 * 
 * Cette fonction corrige automatiquement:
 * - Produits avec variantes → stock principal = 0
 * - Produits sans variantes → garder le stock existant
 */
export async function syncAllProductStocks(): Promise<StockSyncResult> {
  const result: StockSyncResult = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: []
  }

  try {
    console.log('🔄 Début de la synchronisation des stocks...')

    // Récupérer tous les produits avec leurs variantes
    const products = await prisma.product.findMany({
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            stock: true
          }
        }
      }
    })

    result.total = products.length
    console.log(`📦 ${products.length} produits à analyser`)

    for (const product of products) {
      const hasVariants = product.variants.length > 0
      const variantStockSum = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)

      let action: 'updated' | 'skipped' | 'error' = 'skipped'
      let reason = ''
      let newStock = product.stock

      try {
        if (hasVariants && product.stock !== 0) {
          // 🔥 PRODUIT AVEC VARIANTES: Stock principal doit être 0
          newStock = 0
          action = 'updated'
          reason = `Produit avec ${product.variants.length} variantes - stock principal mis à 0 (stock réel: ${variantStockSum})`
          
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: 0 }
          })

          // Créer un mouvement de stock pour traçabilité
          await prisma.stockMovement.create({
            data: {
              productId: product.id,
              type: 'ADJUSTMENT',
              quantity: product.stock,
              reason: `Synchronisation automatique: ${product.stock} → 0 (stock géré par variantes)`
            }
          })

          result.updated++
          console.log(`✅ ${product.name}: ${product.stock} → 0 (${product.variants.length} variantes)`)

        } else if (!hasVariants && product.stock >= 0) {
          // 📦 PRODUIT SIMPLE: Garder le stock existant
          action = 'skipped'
          reason = `Produit simple - stock OK (${product.stock})`
          result.skipped++
          
        } else if (hasVariants && product.stock === 0) {
          // ✅ PRODUIT AVEC VARIANTES DÉJÀ CORRECT
          action = 'skipped'
          reason = `Produit avec variantes - stock déjà correct (0)`
          result.skipped++
        }

      } catch (error) {
        action = 'error'
        reason = `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`
        result.errors++
        console.error(`❌ Erreur pour ${product.name}:`, error)
      }

      result.details.push({
        productId: product.id,
        productName: product.name,
        action,
        oldStock: product.stock,
        newStock,
        variantCount: product.variants.length,
        reason
      })
    }

    console.log('🎉 Synchronisation terminée!')
    console.log(`✅ Mis à jour: ${result.updated}`)
    console.log(`⏭️  Ignorés: ${result.skipped}`)
    console.log(`❌ Erreurs: ${result.errors}`)

    return result

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error)
    throw error
  }
}

/**
 * 📊 ANALYSER LES INCOHÉRENCES SANS LES CORRIGER
 */
export async function analyzeStockInconsistencies(): Promise<{
  inconsistentProducts: Array<{
    id: string
    name: string
    stock: number
    variantCount: number
    variantStockSum: number
    issue: string
  }>
  summary: {
    total: number
    withVariants: number
    withInconsistencies: number
    needsSync: number
  }
}> {
  const products = await prisma.product.findMany({
    include: {
      variants: {
        select: {
          stock: true
        }
      }
    }
  })

  const inconsistentProducts = []
  let withVariants = 0
  let withInconsistencies = 0

  for (const product of products) {
    const hasVariants = product.variants.length > 0
    const variantStockSum = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)

    if (hasVariants) {
      withVariants++
      
      if (product.stock !== 0) {
        withInconsistencies++
        inconsistentProducts.push({
          id: product.id,
          name: product.name,
          stock: product.stock,
          variantCount: product.variants.length,
          variantStockSum,
          issue: `Stock principal (${product.stock}) devrait être 0 car le produit a ${product.variants.length} variantes`
        })
      }
    }
  }

  return {
    inconsistentProducts,
    summary: {
      total: products.length,
      withVariants,
      withInconsistencies,
      needsSync: withInconsistencies
    }
  }
}

/**
 * 🚀 SYNCHRONISER UN PRODUIT SPÉCIFIQUE
 */
export async function syncSingleProduct(productId: string): Promise<{
  success: boolean
  message: string
  oldStock: number
  newStock: number
}> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          select: {
            stock: true
          }
        }
      }
    })

    if (!product) {
      return {
        success: false,
        message: 'Produit non trouvé',
        oldStock: 0,
        newStock: 0
      }
    }

    const hasVariants = product.variants.length > 0
    const oldStock = product.stock

    if (hasVariants && product.stock !== 0) {
      // Corriger le stock principal
      await prisma.product.update({
        where: { id: productId },
        data: { stock: 0 }
      })

      // Créer un mouvement de stock
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'ADJUSTMENT',
          quantity: oldStock,
          reason: `Synchronisation: ${oldStock} → 0 (stock géré par ${product.variants.length} variantes)`
        }
      })

      return {
        success: true,
        message: `Stock synchronisé: ${oldStock} → 0 (produit avec ${product.variants.length} variantes)`,
        oldStock,
        newStock: 0
      }
    }

    return {
      success: true,
      message: 'Produit déjà synchronisé',
      oldStock,
      newStock: oldStock
    }

  } catch (error) {
    return {
      success: false,
      message: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`,
      oldStock: 0,
      newStock: 0
    }
  }
}
