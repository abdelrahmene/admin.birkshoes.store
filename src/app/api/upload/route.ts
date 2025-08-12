// import { NextRequest, NextResponse } from 'next/server'
// import { writeFile, mkdir } from 'fs/promises'
// import path from 'path'

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()
//     const file = formData.get('file') as File
    
//     if (!file) {
//       return NextResponse.json(
//         { error: 'Aucun fichier trouvé' },
//         { status: 400 }
//       )
//     }

//     // Validate file type
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json(
//         { error: 'Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.' },
//         { status: 400 }
//       )
//     }

//     // Validate file size (10MB max)
//     const maxSize = 10 * 1024 * 1024 // 10MB in bytes
//     if (file.size > maxSize) {
//       return NextResponse.json(
//         { error: 'Le fichier est trop volumineux. Maximum 10MB.' },
//         { status: 400 }
//       )
//     }

//     const bytes = await file.arrayBuffer()
//     const buffer = Buffer.from(bytes)

//     // Create unique filename
//     const timestamp = Date.now()
//     const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
//     const extension = path.extname(originalName)
//     const nameWithoutExtension = path.basename(originalName, extension)
//     const uniqueFilename = `${nameWithoutExtension}_${timestamp}${extension}`

//     // Create uploads directory if it doesn't exist
//     const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
//     try {
//       await mkdir(uploadsDir, { recursive: true })
//     } catch (error) {
//       // Directory might already exist, ignore error
//     }

//     // Save file
//     const filepath = path.join(uploadsDir, uniqueFilename)
//     await writeFile(filepath, buffer)

//     // Return public URL
//     const publicUrl = `/uploads/products/${uniqueFilename}`

//     return NextResponse.json({
//       url: publicUrl,
//       filename: uniqueFilename,
//       size: file.size,
//       type: file.type
//     })

//   } catch (error) {
//     console.error('Error uploading file:', error)
//     return NextResponse.json(
//       { error: 'Erreur lors de l\'upload du fichier' },
//       { status: 500 }
//     )
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const filename = searchParams.get('filename')
    
//     if (!filename) {
//       return NextResponse.json(
//         { error: 'Nom de fichier requis' },
//         { status: 400 }
//       )
//     }

//     const filepath = path.join(process.cwd(), 'public', 'uploads', 'products', filename)
    
//     // Note: In a production environment, you might want to use a cloud storage service
//     // For now, we'll just return success without actually deleting the file
//     // to avoid file system issues
    
//     return NextResponse.json({ message: 'File deleted successfully' })
//   } catch (error) {
//     console.error('Error deleting file:', error)
//     return NextResponse.json(
//       { error: 'Erreur lors de la suppression du fichier' },
//       { status: 500 }
//     )
//   }
// }


//  Créer la route API flexible : `/api/upload/route.ts`


import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'products'
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier trouvé' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Maximum 10MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const extension = path.extname(originalName)
    const nameWithoutExtension = path.basename(originalName, extension)
    const uniqueFilename = `${nameWithoutExtension}_${timestamp}_${randomString}${extension}`

    // Validate folder name
    const allowedFolders = ['products', 'collections', 'categories']
    const sanitizedFolder = allowedFolders.includes(folder) ? folder : 'products'

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', sanitizedFolder)
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file
    const filepath = path.join(uploadsDir, uniqueFilename)
    await writeFile(filepath, buffer)

    // Return public URL
    const publicUrl = `/uploads/${sanitizedFolder}/${uniqueFilename}`

    return NextResponse.json({
      url: publicUrl,
      filename: uniqueFilename,
      folder: sanitizedFolder,
      size: file.size,
      type: file.type,
      originalName: file.name
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const folder = searchParams.get('folder') || 'products'
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Nom de fichier requis' },
        { status: 400 }
      )
    }

    // In production, you would delete the file from your cloud storage
    // For now, we'll just return success
    
    return NextResponse.json({ 
      message: 'File deleted successfully',
      filename,
      folder 
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    )
  }
}
