import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: params.id
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            _count: {
              select: {
                products: true
              }
            }
          }
        },
        collections: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                products: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            products: true,
            collections: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la catégorie' },
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
    const { name, description, image, parentId } = body

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom de la catégorie est requis' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const category = await prisma.category.update({
      where: {
        id: params.id
      },
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null
      }
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating category:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has products
    const categoryWithProducts = await prisma.category.findUnique({
      where: {
        id: params.id
      },
      include: {
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    })

    if (!categoryWithProducts) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    // Check if category has products
    if (categoryWithProducts._count.products > 0) {
      return NextResponse.json(
        { 
          message: `Impossible de supprimer cette catégorie car elle contient ${categoryWithProducts._count.products} produits. Veuillez d'abord déplacer ou supprimer ces produits.` 
        },
        { status: 400 }
      )
    }

    // Check if category has subcategories
    if (categoryWithProducts._count.children > 0) {
      return NextResponse.json(
        { 
          message: `Impossible de supprimer cette catégorie car elle contient ${categoryWithProducts._count.children} sous-catégories. Veuillez d'abord déplacer ou supprimer ces sous-catégories.` 
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ 
      message: 'Catégorie supprimée avec succès' 
    })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    )
  }
}