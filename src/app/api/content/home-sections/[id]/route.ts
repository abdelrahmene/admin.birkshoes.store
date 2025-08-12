import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer une section spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const section = await prisma.homeSection.findUnique({
      where: {
        id: params.id
      }
    })

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          error: 'Section introuvable'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...section,
        content: JSON.parse(section.content)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la section:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la section'
      },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { title, description, type, content, isVisible } = data

    if (!title || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le titre et le type sont requis'
        },
        { status: 400 }
      )
    }

    const updatedSection = await prisma.homeSection.update({
      where: {
        id: params.id
      },
      data: {
        title,
        description,
        type,
        content: typeof content === 'object' ? JSON.stringify(content) : content || '{}',
        isVisible,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedSection,
        content: JSON.parse(updatedSection.content)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la section:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de la section'
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si la section existe
    const section = await prisma.homeSection.findUnique({
      where: {
        id: params.id
      }
    })

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          error: 'Section introuvable'
        },
        { status: 404 }
      )
    }

    // Supprimer la section
    await prisma.homeSection.delete({
      where: {
        id: params.id
      }
    })

    // Réorganiser l'ordre des sections restantes
    const remainingSections = await prisma.homeSection.findMany({
      where: {
        order: { gt: section.order }
      },
      orderBy: { order: 'asc' }
    })

    // Mettre à jour l'ordre des sections suivantes
    const updatePromises = remainingSections.map((s, index) =>
      prisma.homeSection.update({
        where: { id: s.id },
        data: { order: section.order + index }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: 'Section supprimée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de la section:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de la section'
      },
      { status: 500 }
    )
  }
}