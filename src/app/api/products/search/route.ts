import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            sku: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ],
        isActive: true
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStock: true,
        price: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: limit
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Erreur lors de la recherche de produits:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}