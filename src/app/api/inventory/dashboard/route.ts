import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer tous les produits avec leurs variantes et relations
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true }
        },
        variants: {
          select: {
            stock: true
          }
        }
      },
      where: {
        isActive: true
      }
    })

    // Calculer les statistiques générales
    const stats = {
      totalProducts: products.length,
      totalStock: 0,
      totalValue: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      recentMovements: 0
    }

    // Préparer les données pour les produits top et alertes
    const topProducts = []
    const alerts = []

    products.forEach(product => {
      const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0)
      // LOGIQUE CORRIGÉE: Si le produit a des variantes, stock total = somme des variantes
      // Sinon, utiliser le stock du produit principal
      const totalStock = product.variants.length > 0 ? totalVariantStock : product.stock
      const stockValue = totalStock * (product.cost || product.price)

      // Mettre à jour les stats
      stats.totalStock += totalStock
      stats.totalValue += stockValue

      // Déterminer le statut du stock
      let status: 'in_stock' | 'low_stock' | 'out_of_stock'
      if (totalStock === 0) {
        status = 'out_of_stock'
        stats.outOfStockProducts++
        alerts.push({
          id: product.id,
          name: product.name,
          stock: totalStock,
          lowStock: product.lowStock,
          status: 'out_of_stock' as const
        })
      } else if (totalStock <= product.lowStock) {
        status = 'low_stock'
        stats.lowStockProducts++
        alerts.push({
          id: product.id,
          name: product.name,
          stock: totalStock,
          lowStock: product.lowStock,
          status: 'low_stock' as const
        })
      } else {
        status = 'in_stock'
      }

      // Ajouter aux produits top (on triera après)
      topProducts.push({
        id: product.id,
        name: product.name,
        stock: totalStock,
        value: stockValue,
        category: product.category?.name || null
      })
    })

    // Trier les produits par stock décroissant et prendre les 10 premiers
    topProducts.sort((a, b) => b.stock - a.stock)
    const limitedTopProducts = topProducts.slice(0, 10)

    // Trier les alertes par urgence (rupture d'abord, puis stock faible)
    alerts.sort((a, b) => {
      if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return -1
      if (a.status !== 'out_of_stock' && b.status === 'out_of_stock') return 1
      return a.stock - b.stock
    })
    const limitedAlerts = alerts.slice(0, 10)

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

    stats.recentMovements = recentMovementsCount

    // Récupérer les 10 derniers mouvements avec les noms des produits
    const recentMovements = await prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const formattedRecentMovements = recentMovements.map(movement => ({
      id: movement.id,
      productName: movement.product.name,
      type: movement.type,
      quantity: movement.quantity,
      createdAt: movement.createdAt.toISOString()
    }))

    return NextResponse.json({
      stats,
      topProducts: limitedTopProducts,
      recentMovements: formattedRecentMovements,
      alerts: limitedAlerts
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des données du dashboard inventaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}