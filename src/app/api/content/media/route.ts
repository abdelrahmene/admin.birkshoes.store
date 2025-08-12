import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

// GET - Récupérer tous les fichiers médias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || '/'
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const whereCondition: any = {
      folder: folder
    }

    if (search) {
      whereCondition.OR = [
        { filename: { contains: search } },
        { originalName: { contains: search } },
        { alt: { contains: search } }
      ]
    }

    const [mediaFiles, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.mediaFile.count({ where: whereCondition })
    ])

    return NextResponse.json({
      success: true,
      data: {
        files: mediaFiles,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des médias:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des médias'
      },
      { status: 500 }
    )
  }
}

// POST - Upload de fichiers médias
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string || '/'
    const alt = formData.get('alt') as string || ''

    if (!files.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun fichier fourni'
        },
        { status: 400 }
      )
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    
    // Créer le dossier s'il n'existe pas
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        continue // Skip non-image files
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
      const filePath = join(uploadDir, filename)
      const publicUrl = `/uploads${folder}${filename}`

      // Sauvegarder le fichier
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Enregistrer en base de données
      const mediaFile = await prisma.mediaFile.create({
        data: {
          filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path: filePath,
          url: publicUrl,
          alt: alt || file.name,
          folder,
          uploadedBy: 'admin' // À remplacer par l'ID de l'utilisateur connecté
        }
      })

      uploadedFiles.push(mediaFile)
    }

    return NextResponse.json({
      success: true,
      data: uploadedFiles
    })
  } catch (error) {
    console.error('Erreur lors de l\'upload des médias:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'upload des médias'
      },
      { status: 500 }
    )
  }
}