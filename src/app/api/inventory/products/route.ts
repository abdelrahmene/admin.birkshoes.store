import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateProductStock, calculateInventoryStats } from '@/lib/inventory/stock-utils'

export async function GET() {
  try {
    console.log('🔍 API INVENTORY: Récupération des produits avec logique stock unifiée...')
    
    // Récupérer tous les produits avec leurs variantes et relations
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true }
        },
        collection: {
          select: { name: true }
        },
        variants: {
          select: {
            id: true,
            name: true,
            stock: true,
            sku: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    console.log(`📦 API INVENTORY: ${products.length} produits récupérés`)

    // Transformer les données en utilisant la logique unifiée
    const inventoryProducts = products.map(product => {
      // 🎯 UTILISER LA LOGIQUE UNIFIÉE
      const stockCalc = calculateProductStock({
        id: product.id,
        name: product.name,
        stock: product.stock,
        lowStock: product.lowStock,
        price: product.price,
        cost: product.cost,
        trackStock: product.trackStock,
        variants: product.variants
      })

      // Log pour debug
      if (product.variants.length > 0) {
        console.log(`🎆 PRODUIT "${product.name}": ${product.variants.length} variantes, Stock DB=${product.stock}, Stock calculé=${stockCalc.totalStock}, Status=${stockCalc.status}`)
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock, // Stock DB (pour info)
        lowStock: product.lowStock,
        trackStock: product.trackStock,
        price: product.price,
        cost: product.cost,
        category: product.category?.name || null,
        collection: product.collection?.name || null,
        variants: product.variants,
        
        // 🔥 DONNÉES CALCULÉES AVEC LOGIQUE UNIFIÉE
        totalStock: stockCalc.totalStock,
        totalVariantStock: stockCalc.variantStockSum,
        stockValue: stockCalc.stockValue,
        status: stockCalc.status,
        hasVariants: stockCalc.hasVariants
      }
    })

    // 📊 Calculer les statistiques avec la logique unifiée
    const baseStats = calculateInventoryStats(
      products.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        lowStock: p.lowStock,
        price: p.price,
        cost: p.cost,
        trackStock: p.trackStock,
        variants: p.variants
      }))
    )

    // Compter les mouvements récents (7 derniers jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentMovementsCount = await prisma.stockMovement.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    const stats = {
      ...baseStats,
      recentMovements: recentMovementsCount
    }

    console.log(`📈 API INVENTORY: Stats calculées - Total: ${stats.totalStock} unités, Valeur: ${stats.totalValue.toLocaleString()} DZD`)

    return NextResponse.json({
      products: inventoryProducts,
      stats
    })
  } catch (error) {
    console.error('❌ Erreur API INVENTORY:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { productId, newStock, reason } = await request.json()

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    const oldStock = product.stock
    const difference = newStock - oldStock

    // Mettre à jour le stock du produit
    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    })

    // Créer un mouvement de stock
    if (difference !== 0) {
      await prisma.stockMovement.create({
        data: {
          productId,
          type: difference > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(difference),
          reason: reason || `Ajustement manuel: ${oldStock} → ${newStock}`
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Stock mis à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}