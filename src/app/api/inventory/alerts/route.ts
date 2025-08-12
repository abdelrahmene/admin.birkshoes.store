import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer tous les produits avec leurs variantes
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
      where: {
        trackStock: true, // Seulement les produits dont on suit le stock
        isActive: true
      },
      orderBy: { name: 'asc' }
    })

    // Filtrer les produits ayant des alertes et les transformer
    const alertProducts = products
      .map(product => {
        const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0)
        const totalStock = product.stock + totalVariantStock
        
        // Déterminer si le produit a une alerte
        let status: 'out_of_stock' | 'low_stock' | null = null
        let alertLevel: 'critical' | 'warning' = 'warning'
        
        if (totalStock === 0) {
          status = 'out_of_stock'
          alertLevel = 'critical'
        } else if (totalStock <= product.lowStock) {
          status = 'low_stock'
          alertLevel = totalStock <= Math.ceil(product.lowStock / 2) ? 'critical' : 'warning'
        }

        // Retourner seulement les produits avec des alertes
        if (!status) return null

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          lowStock: product.lowStock,
          price: product.price,
          cost: product.cost,
          category: product.category?.name || null,
          collection: product.collection?.name || null,
          variants: product.variants,
          totalVariantStock,
          totalStock,
          status,
          alertLevel
        }
      })
      .filter(Boolean) // Supprimer les produits sans alerte
      .sort((a, b) => {
        // Trier par priorité: ruptures d'abord, puis stock critique, puis warnings
        if (a!.status !== b!.status) {
          return a!.status === 'out_of_stock' ? -1 : 1
        }
        if (a!.alertLevel !== b!.alertLevel) {
          return a!.alertLevel === 'critical' ? -1 : 1
        }
        return a!.totalStock - b!.totalStock
      })

    // Calculer les statistiques
    const stats = {
      outOfStock: alertProducts.filter(p => p!.status === 'out_of_stock').length,
      lowStock: alertProducts.filter(p => p!.status === 'low_stock').length,
      total: alertProducts.length,
      estimatedLoss: alertProducts
        .filter(p => p!.status === 'out_of_stock')
        .reduce((sum, product) => {
          // Estimation de la perte basée sur le prix de vente et le seuil de stock faible
          const estimatedMissedSales = product!.lowStock * product!.price
          return sum + estimatedMissedSales
        }, 0)
    }

    return NextResponse.json({
      products: alertProducts,
      stats
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    )
  }
}