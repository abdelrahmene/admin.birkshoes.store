import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const type = searchParams.get('type')
    const productId = searchParams.get('productId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construire les conditions de filtrage
    const where: any = {}
    
    if (type && type !== 'all') {
      where.type = type
    }
    
    if (productId) {
      where.productId = productId
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Récupérer les mouvements avec les informations des produits et variantes
    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        productVariant: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Enrichir les mouvements avec les informations des produits et variantes
    const enrichedMovements = movements.map(movement => ({
      id: movement.id,
      productId: movement.productId,
      productName: movement.product?.name || 'Produit supprimé',
      productSku: movement.product?.sku || null,
      productVariantId: movement.productVariantId,
      productVariantName: movement.productVariant?.name || null,
      productVariantSku: movement.productVariant?.sku || null,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      reference: movement.reference,
      createdAt: movement.createdAt.toISOString()
    }))

    // Compter le total pour la pagination
    const totalCount = await prisma.stockMovement.count({ where })

    return NextResponse.json({
      movements: enrichedMovements,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des mouvements:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des mouvements',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { productId, productVariantId, type, quantity, reason, reference } = await request.json()

    // Validation des données
    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { error: 'Données manquantes: productId, type et quantity sont requis' },
        { status: 400 }
      )
    }

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return NextResponse.json(
        { error: 'Type de mouvement invalide' },
        { status: 400 }
      )
    }

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

    // Si c'est un mouvement pour une variante, vérifier qu'elle existe
    let variant = null
    if (productVariantId) {
      variant = await prisma.productVariant.findUnique({
        where: { id: productVariantId }
      })
      
      if (!variant || variant.productId !== productId) {
        return NextResponse.json(
          { error: 'Variante non trouvée ou ne correspond pas au produit' },
          { status: 404 }
        )
      }
    }

    // Créer le mouvement de stock
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        productVariantId: productVariantId || null,
        type,
        quantity: Math.abs(quantity), // S'assurer que la quantité est positive
        reason,
        reference
      }
    })

    let newStock = 0
    
    // Mettre à jour le stock selon s'il s'agit d'un produit ou d'une variante
    if (productVariantId && variant) {
      // Mouvement pour une variante
      newStock = variant.stock
      
      if (type === 'IN') {
        newStock += Math.abs(quantity)
      } else if (type === 'OUT') {
        newStock -= Math.abs(quantity)
        if (newStock < 0) newStock = 0
      } else if (type === 'ADJUSTMENT') {
        newStock = Math.max(0, variant.stock + quantity)
      }
      
      await prisma.productVariant.update({
        where: { id: productVariantId },
        data: { stock: newStock }
      })
    } else {
      // Mouvement pour le produit principal
      newStock = product.stock
      
      if (type === 'IN') {
        newStock += Math.abs(quantity)
      } else if (type === 'OUT') {
        newStock -= Math.abs(quantity)
        if (newStock < 0) newStock = 0
      } else if (type === 'ADJUSTMENT') {
        newStock = Math.max(0, product.stock + quantity)
      }
      
      await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock }
      })
    }

    return NextResponse.json({
      success: true,
      movement,
      newStock,
      message: 'Mouvement de stock créé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création du mouvement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du mouvement' },
      { status: 500 }
    )
  }
}