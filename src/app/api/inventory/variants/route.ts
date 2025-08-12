import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalculateProductStock, getStockStatus } from '@/lib/stock-utils'

export async function POST(request: Request) {
  try {
    const { variantId, newStock, reason } = await request.json()

    // Vérifier que la variante existe
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { 
        product: {
          select: { id: true, name: true }
        }
      }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Variante non trouvée' },
        { status: 404 }
      )
    }

    const oldStock = variant.stock
    const difference = newStock - oldStock

    // Transaction pour mettre à jour la variante et recalculer le produit
    await prisma.$transaction(async (tx) => {
      // Mettre à jour le stock de la variante
      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock }
      })

      // Créer un mouvement de stock pour la variante
      if (difference !== 0) {
        await tx.stockMovement.create({
          data: {
            productId: variant.productId,
            productVariantId: variantId,
            type: difference > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(difference),
            reason: reason || `Ajustement variante: ${oldStock} → ${newStock}`
          }
        })
      }
    })

    // Recalculer le stock du produit principal après la transaction
    await recalculateProductStock(variant.productId)

    return NextResponse.json({ 
      success: true,
      message: 'Stock de la variante mis à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock de variante:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

// Récupérer les variantes d'un produit avec leur stock
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      )
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    // Calculer les statistiques pour chaque variante
    const variantsWithStats = variants.map(variant => {
      const stockValue = variant.stock * (variant.price || 0)
      const status = getStockStatus(variant.stock, 5) // Seuil de 5 pour les variantes

      return {
        ...variant,
        stockValue,
        status,
        options: JSON.parse(variant.options || '{}')
      }
    })

    return NextResponse.json({ variants: variantsWithStats })
  } catch (error) {
    console.error('Erreur lors de la récupération des variantes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}