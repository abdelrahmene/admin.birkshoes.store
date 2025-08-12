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

    // Transformer les données pour l'interface
    const inventoryProducts = products.map(product => {
      const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0)
      // LOGIQUE CORRIGÉE: Si le produit a des variantes, stock total = somme des variantes
      // Sinon, utiliser le stock du produit principal
      const totalStock = product.variants.length > 0 ? totalVariantStock : product.stock
      
      // Calculer la valeur du stock
      const stockValue = totalStock * (product.cost || product.price)
      
      // Déterminer le statut du stock
      let status: 'in_stock' | 'low_stock' | 'out_of_stock'
      if (totalStock === 0) {
        status = 'out_of_stock'
      } else if (totalStock <= product.lowStock) {
        status = 'low_stock'
      } else {
        status = 'in_stock'
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        lowStock: product.lowStock,
        trackStock: product.trackStock,
        price: product.price,
        cost: product.cost,
        category: product.category?.name || null,
        collection: product.collection?.name || null,
        variants: product.variants,
        totalVariantStock,
        stockValue,
        status
      }
    })

    // Calculer les statistiques
    const stats = {
      totalProducts: inventoryProducts.length,
      // CORRIGÉ: Utiliser le stock total calculé (pas d'addition)
      totalStock: inventoryProducts.reduce((sum, product) => {
        const productTotalStock = product.variants.length > 0 ? product.totalVariantStock : product.stock
        return sum + productTotalStock
      }, 0),
      totalValue: inventoryProducts.reduce((sum, product) => sum + product.stockValue, 0),
      lowStockProducts: inventoryProducts.filter(p => p.status === 'low_stock').length,
      outOfStockProducts: inventoryProducts.filter(p => p.status === 'out_of_stock').length,
      recentMovements: 0 // Sera calculé séparément
    }

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

    return NextResponse.json({
      products: inventoryProducts,
      stats
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des produits d\'inventaire:', error)
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