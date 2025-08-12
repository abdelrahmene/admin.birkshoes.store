import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    // Récupérer les ajustements récents (mouvements de type ADJUSTMENT)
    const adjustmentMovements = await prisma.stockMovement.findMany({
      where: {
        type: 'ADJUSTMENT'
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Transformer les données pour l'interface
    const adjustments = adjustmentMovements.map(movement => {
      // Extraire les informations de stock à partir de la raison
      const reasonMatch = movement.reason?.match(/(\d+)\s*→\s*(\d+)/)
      let oldStock = 0
      let newStock = 0
      
      if (reasonMatch) {
        oldStock = parseInt(reasonMatch[1])
        newStock = parseInt(reasonMatch[2])
      }

      return {
        id: movement.id,
        productName: movement.product?.name || 'Produit supprimé',
        productSku: movement.product?.sku || null,
        oldStock,
        newStock,
        difference: movement.quantity * (movement.type === 'IN' ? 1 : -1),
        reason: movement.reason || 'Ajustement',
        reference: movement.reference,
        createdAt: movement.createdAt.toISOString()
      }
    })

    return NextResponse.json({
      adjustments
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des ajustements:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ajustements' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { adjustments } = await request.json()

    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return NextResponse.json(
        { error: 'Liste d\'ajustements requise' },
        { status: 400 }
      )
    }

    const results = []

    // Traiter chaque ajustement
    for (const adjustment of adjustments) {
      const { productId, newStock, reason } = adjustment

      // Vérifier que le produit existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          variants: {
            select: { stock: true }
          }
        }
      })

      if (!product) {
        results.push({
          productId,
          success: false,
          error: 'Produit non trouvé'
        })
        continue
      }

      const currentTotalStock = product.stock + product.variants.reduce((sum, v) => sum + v.stock, 0)
      const difference = newStock - currentTotalStock

      if (difference === 0) {
        results.push({
          productId,
          success: true,
          message: 'Aucun changement nécessaire'
        })
        continue
      }

      try {
        // Créer le mouvement de stock
        const movement = await prisma.stockMovement.create({
          data: {
            productId,
            type: 'ADJUSTMENT',
            quantity: Math.abs(difference),
            reason: reason || `Ajustement: ${currentTotalStock} → ${newStock}`,
            reference: `ADJ-${Date.now()}`
          }
        })

        // Mettre à jour le stock principal du produit
        // Note: Cette logique simplifie en mettant tout le stock sur le produit principal
        // Dans un système plus complexe, il faudrait gérer les variantes séparément
        await prisma.product.update({
          where: { id: productId },
          data: {
            stock: Math.max(0, newStock) // S'assurer que le stock n'est pas négatif
          }
        })

        results.push({
          productId,
          success: true,
          movementId: movement.id,
          message: `Stock ajusté de ${currentTotalStock} à ${newStock}`
        })
      } catch (error) {
        results.push({
          productId,
          success: false,
          error: 'Erreur lors de l\'ajustement'
        })
      }
    }

    const successfulCount = results.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: adjustments.length,
        successful: successfulCount,
        failed: adjustments.length - successfulCount
      }
    })
  } catch (error) {
    console.error('Erreur lors du traitement des ajustements:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement des ajustements' },
      { status: 500 }
    )
  }
}