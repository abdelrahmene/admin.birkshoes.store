import { NextRequest, NextResponse } from 'next/server'
import { readFile, unlink, writeFile } from 'fs/promises'
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
    await writeFile(metadataPath, JSON.stringify(files, null, 2))
  } catch (error) {
    console.error('Error saving metadata:', error)
    throw error
  }
}

// DELETE: Supprimer un fichier spécifique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id

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