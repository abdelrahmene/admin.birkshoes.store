import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const productId = searchParams.get('productId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'csv'

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

    // Récupérer tous les mouvements correspondants
    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Récupérer les informations des produits
    const productIds = [...new Set(movements.map(m => m.productId))]
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    if (format === 'csv') {
      // Convertir en format CSV
      const csvHeaders = [
        'Date',
        'Heure',
        'Produit',
        'SKU',
        'Catégorie',
        'Type de mouvement',
        'Quantité',
        'Raison',
        'Référence'
      ].join(',')

      const csvRows = movements.map(movement => {
        const date = new Date(movement.createdAt)
        const product = productMap.get(movement.productId)
        
        const typeLabel = movement.type === 'IN' ? 'Entrée' : 
                         movement.type === 'OUT' ? 'Sortie' : 'Ajustement'
        
        return [
          date.toLocaleDateString('fr-FR'),
          date.toLocaleTimeString('fr-FR'),
          `"${product?.name || 'Produit supprimé'}"`,
          product?.sku || '',
          product?.category?.name || '',
          typeLabel,
          movement.quantity,
          `"${movement.reason || ''}"`,
          `"${movement.reference || ''}"`
        ].join(',')
      }).join('\n')

      const csvContent = csvHeaders + '\n' + csvRows

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="mouvements_stock_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Format JSON
      const enrichedMovements = movements.map(movement => {
        const product = productMap.get(movement.productId)
        return {
          id: movement.id,
          date: movement.createdAt.toISOString(),
          product: {
            id: movement.productId,
            name: product?.name || 'Produit supprimé',
            sku: product?.sku || null,
            category: product?.category?.name || null
          },
          type: movement.type,
          quantity: movement.quantity,
          reason: movement.reason,
          reference: movement.reference
        }
      })

      return NextResponse.json({
        movements: enrichedMovements,
        exportDate: new Date().toISOString(),
        totalRecords: movements.length
      })
    }
  } catch (error) {
    console.error('Erreur lors de l\'export des mouvements:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    )
  }
}