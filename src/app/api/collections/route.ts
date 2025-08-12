import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json(collections)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, image, categoryId, isActive = true } = body

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom de la collection est requis' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        image,
        categoryId: categoryId || null,
        isActive
      }
    })

    return NextResponse.json(collection, { status: 201 })
  } catch (error: any) {
    console.error('Error creating collection:', error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Une collection avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la création de la collection' },
      { status: 500 }
    )
  }
}