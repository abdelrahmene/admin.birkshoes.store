import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Configuration des dossiers d'upload
const UPLOAD_FOLDERS = {
  products: 'products',
  collections: 'collections', 
  categories: 'categories',
  content: 'content',
  hero: 'hero'
}

// Types de fichiers autorisés
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'application/pdf': 'pdf'
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Fonction pour sauvegarder les métadonnées
async function saveMediaMetadata(mediaFile: any) {
  const metadataPath = path.join(process.cwd(), 'public', 'uploads', 'metadata.json')
  let existingData: any[] = []
  
  try {
    if (existsSync(metadataPath)) {
      const data = await readFile(metadataPath, 'utf-8')
      existingData = JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading metadata:', error)
  }
  
  existingData.push(mediaFile)
  
  await writeFile(metadataPath, JSON.stringify(existingData, null, 2))
}

// Fonction pour lire les métadonnées
export async function getMediaFiles() {
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'content'

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10MB)' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier
    if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé' },
        { status: 400 }
      )
    }

    // Valider le dossier
    const uploadFolder = UPLOAD_FOLDERS[folder as keyof typeof UPLOAD_FOLDERS] || 'content'

    // Générer un nom de fichier unique
    const fileExtension = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Créer le chemin de destination
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadFolder)
    const filePath = path.join(uploadDir, fileName)

    // Créer le dossier s'il n'existe pas
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Construire l'URL publique
    const publicUrl = `/uploads/${uploadFolder}/${fileName}`

    // Créer l'objet media file
    const mediaFile = {
      id: uuidv4(),
      filename: fileName,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: publicUrl,
      folder: uploadFolder,
      alt: file.name,
      createdAt: new Date().toISOString()
    }

    // Sauvegarder les métadonnées dans un fichier JSON
    await saveMediaMetadata(mediaFile)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      file: mediaFile
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    )
  }
}

// Pour la compatibilité, on peut aussi avoir une route single
export { POST as PUT }
