import { NextRequest, NextResponse } from 'next/server'

// Redirection vers la route principale d'upload
export async function POST(request: NextRequest) {
  try {
    // Rediriger vers /api/upload pour la compatibilité
    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
      method: 'POST',
      body: await request.formData()
    })

    const result = await uploadResponse.json()
    return NextResponse.json(result, { status: uploadResponse.status })

  } catch (error) {
    console.error('Single upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}