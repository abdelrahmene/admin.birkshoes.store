import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer une page catégorie spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryPage = await prisma.categoryPage.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            description: true
          }
        }
      }
    })

    if (!categoryPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page catégorie non trouvée'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: categoryPage
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la page catégorie:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la page catégorie'
      },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une page catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const { 
      heroImage, 
      heroTitle, 
      heroSubtitle, 
      description, 
      seoTitle, 
      seoDescription,
      customCss,
      isActive 
    } = data

    const categoryPage = await prisma.categoryPage.findUnique({
      where: { id: params.id }
    })

    if (!categoryPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page catégorie non trouvée'
        },
        { status: 404 }
      )
    }

    const updatedCategoryPage = await prisma.categoryPage.update({
      where: { id: params.id },
      data: {
        ...(heroImage !== undefined && { heroImage }),
        ...(heroTitle !== undefined && { heroTitle }),
        ...(heroSubtitle !== undefined && { heroSubtitle }),
        ...(description !== undefined && { description }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(customCss !== undefined && { customCss }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCategoryPage
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la page catégorie:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de la page catégorie'
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une page catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryPage = await prisma.categoryPage.findUnique({
      where: { id: params.id }
    })

    if (!categoryPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page catégorie non trouvée'
        },
        { status: 404 }
      )
    }

    await prisma.categoryPage.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Page catégorie supprimée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de la page catégorie:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de la page catégorie'
      },
      { status: 500 }
    )
  }
}