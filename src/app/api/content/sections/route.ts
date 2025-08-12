import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer toutes les sections homepage
export async function GET() {
  try {
    const sections = await prisma.homeSection.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: sections
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des sections:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des sections'
      },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle section
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { title, description, type, content, isVisible = true } = data

    if (!title || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le titre et le type sont requis'
        },
        { status: 400 }
      )
    }

    // Obtenir l'ordre suivant
    const lastSection = await prisma.homeSection.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastSection?.order || 0) + 1

    const newSection = await prisma.homeSection.create({
      data: {
        title,
        description,
        type,
        content: content || {},
        isVisible,
        order: nextOrder
      }
    })

    return NextResponse.json({
      success: true,
      data: newSection
    })
  } catch (error) {
    console.error('Erreur lors de la création de la section:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la section'
      },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour l'ordre des sections
export async function PUT(request: NextRequest) {
  try {
    const { sections } = await request.json()

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides'
        },
        { status: 400 }
      )
    }

    // Mettre à jour l'ordre de chaque section
    const updatePromises = sections.map((section, index) =>
      prisma.homeSection.update({
        where: { id: section.id },
        data: { order: index + 1 }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: 'Ordre des sections mis à jour'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'ordre'
      },
      { status: 500 }
    )
  }
}