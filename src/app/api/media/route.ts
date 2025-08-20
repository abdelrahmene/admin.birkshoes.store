import { NextRequest, NextResponse } from 'next/server'
import { readFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Fonction pour lire les métadonnées des médias
async function getMediaFiles() {
  const metadataPath = path.join(process.cwd(), 'public', 'uploads', 'metadata.json')
  
  try {
    if (existsSync(metadataPath)) {
      const data = await readFile(metadataPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading metadata:', error)
  }
  
  return []
}

// Fonction pour sauvegarder les métadonnées
async function saveMediaFiles(files: any[]) {
  const metadataPath = path.join(process.cwd(), 'public', 'uploads', 'metadata.json')
  
  try {
    await require('fs/promises').writeFile(metadataPath, JSON.stringify(files, null, 2))
  } catch (error) {
    console.error('Error saving metadata:', error)
    throw error
  }
}

// GET: Récupérer tous les fichiers média
export async function GET(request: NextRequest) {
  try {
    const files = await getMediaFiles()
    
    // Ajouter des informations supplémentaires
    const enrichedFiles = files.map((file: any) => ({
      ...file,
      usageCount: 0, // TODO: Implémenter le comptage d'utilisation
      tags: file.tags || []
    }))

    return NextResponse.json({
      success: true,
      files: enrichedFiles,
      total: enrichedFiles.length
    })
  } catch (error) {
    console.error('Error fetching media files:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers' },
      { status: 500 }
    )
  }
}

// POST: Upload multiple files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string || 'content'

    if (!files.length) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      // Réutiliser la logique d'upload de la route principale
      const singleFormData = new FormData()
      singleFormData.append('file', file)
      singleFormData.append('folder', folder)

      // Simuler une requête interne vers la route d'upload existante
      const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
        method: 'POST',
        body: singleFormData
      })

      if (uploadResponse.ok) {
        const result = await uploadResponse.json()
        uploadedFiles.push(result.file)
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      total: uploadedFiles.length
    })

  } catch (error) {
    console.error('Multi-upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des fichiers' },
      { status: 500 }
    )
  }
}

// DELETE: Supprimer un fichier
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const fileId = url.searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { error: 'ID du fichier manquant' },
        { status: 400 }
      )
    }

    const files = await getMediaFiles()
    const fileIndex = files.findIndex((f: any) => f.id === fileId)

    if (fileIndex === -1) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      )
    }

    const fileToDelete = files[fileIndex]

    // Supprimer le fichier physique
    const filePath = path.join(process.cwd(), 'public', fileToDelete.url)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // Retirer le fichier de la liste
    files.splice(fileIndex, 1)
    await saveMediaFiles(files)

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}