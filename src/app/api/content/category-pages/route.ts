import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer toutes les pages catégories
export async function GET() {
  try {
    const categoryPages = await prisma.categoryPage.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: categoryPages
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des pages catégories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des pages catégories'
      },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle page catégorie
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { 
      categoryId, 
      heroImage, 
      heroTitle, 
      heroSubtitle, 
      description, 
      seoTitle, 
      seoDescription,
      customCss,
      isActive = true 
    } = data

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: 'L\'ID de la catégorie est requis'
        },
        { status: 400 }
      )
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Catégorie non trouvée'
        },
        { status: 404 }
      )
    }

    // Vérifier qu'une page n'existe pas déjà pour cette catégorie
    const existingPage = await prisma.categoryPage.findUnique({
      where: { categoryId }
    })

    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Une page existe déjà pour cette catégorie'
        },
        { status: 409 }
      )
    }

    const newCategoryPage = await prisma.categoryPage.create({
      data: {
        categoryId,
        heroImage,
        heroTitle,
        heroSubtitle,
        description,
        seoTitle,
        seoDescription,
        customCss,
        isActive
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
      data: newCategoryPage
    })
  } catch (error) {
    console.error('Erreur lors de la création de la page catégorie:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la page catégorie'
      },
      { status: 500 }
    )
  }
}