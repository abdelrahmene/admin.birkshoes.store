import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await prisma.collection.findUnique({
      where: {
        id: params.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            isActive: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!collection) {
      return NextResponse.json(
        { message: 'Collection non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(collection)
  } catch (error: any) {
    console.error('Error fetching collection:', {
      error: error.message,
      stack: error.stack,
      id: params.id
    })
    
    // Si c'est une erreur Prisma de connection
    if (error.code === 'P1001') {
      return NextResponse.json(
        { message: 'Erreur de connexion à la base de données' },
        { status: 503 }
      )
    }
    
    // Si c'est une erreur de champ non trouvé
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Collection non trouvée' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Erreur lors de la récupération de la collection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, image, categoryId, isActive } = body

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

    const collection = await prisma.collection.update({
      where: {
        id: params.id
      },
      data: {
        name,
        slug,
        description,
        image,
        categoryId: categoryId || null,
        isActive
      }
    })

    return NextResponse.json(collection)
  } catch (error: any) {
    console.error('Error updating collection:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Collection non trouvée' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Une collection avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if collection has products
    const collectionWithProducts = await prisma.collection.findUnique({
      where: {
        id: params.id
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!collectionWithProducts) {
      return NextResponse.json(
        { message: 'Collection non trouvée' },
        { status: 404 }
      )
    }

    // Check if collection has products
    if (collectionWithProducts._count.products > 0) {
      return NextResponse.json(
        { 
          message: `Impossible de supprimer cette collection car elle contient ${collectionWithProducts._count.products} produits. Veuillez d'abord retirer ces produits de la collection.` 
        },
        { status: 400 }
      )
    }

    await prisma.collection.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ 
      message: 'Collection supprimée avec succès' 
    })
  } catch (error: any) {
    console.error('Error deleting collection:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Collection non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la collection' },
      { status: 500 }
    )
  }
}