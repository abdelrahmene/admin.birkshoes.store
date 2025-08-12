import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

// GET - Récupérer un fichier média spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: params.id }
    })

    if (!mediaFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fichier média non trouvé'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: mediaFile
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier média:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du fichier média'
      },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un fichier média
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { alt, tags, folder } = data

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: params.id }
    })

    if (!mediaFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fichier média non trouvé'
        },
        { status: 404 }
      )
    }

    const updatedMediaFile = await prisma.mediaFile.update({
      where: { id: params.id },
      data: {
        ...(alt !== undefined && { alt }),
        ...(tags !== undefined && { tags }),
        ...(folder !== undefined && { folder }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedMediaFile
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fichier média:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du fichier média'
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un fichier média
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: params.id }
    })

    if (!mediaFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fichier média non trouvé'
        },
        { status: 404 }
      )
    }

    // Supprimer le fichier physique
    if (existsSync(mediaFile.path)) {
      await unlink(mediaFile.path)
    }

    // Supprimer l'enregistrement de la base de données
    await prisma.mediaFile.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Fichier média supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier média:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du fichier média'
      },
      { status: 500 }
    )
  }
}