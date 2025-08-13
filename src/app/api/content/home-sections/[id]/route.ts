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
          error: 'Section non trouvée'
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

// PATCH - Mettre à jour une section
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    // Vérifier que la section existe
    const existingSection = await prisma.homeSection.findUnique({
      where: { id: params.id }
    })

    if (!existingSection) {
      return NextResponse.json(
        {
          success: false,
          error: 'Section non trouvée'
        },
        { status: 404 }
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.type !== undefined) updateData.type = data.type
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible
    if (data.order !== undefined) updateData.order = data.order
    if (data.content !== undefined) {
      updateData.content = typeof data.content === 'object' 
        ? JSON.stringify(data.content) 
        : data.content
    }

    const updatedSection = await prisma.homeSection.update({
      where: { id: params.id },
      data: updateData
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
    // Vérifier que la section existe
    const existingSection = await prisma.homeSection.findUnique({
      where: { id: params.id }
    })

    if (!existingSection) {
      return NextResponse.json(
        {
          success: false,
          error: 'Section non trouvée'
        },
        { status: 404 }
      )
    }

    // Supprimer la section
    await prisma.homeSection.delete({
      where: { id: params.id }
    })

    // Réorganiser les ordres des sections restantes
    const remainingSections = await prisma.homeSection.findMany({
      where: { order: { gt: existingSection.order } },
      orderBy: { order: 'asc' }
    })

    // Mettre à jour l'ordre des sections suivantes
    const updatePromises = remainingSections.map((section, index) =>
      prisma.homeSection.update({
        where: { id: section.id },
        data: { order: existingSection.order + index }
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