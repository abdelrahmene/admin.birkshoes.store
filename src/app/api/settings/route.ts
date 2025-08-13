import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer tous les paramètres ou un paramètre spécifique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      // Récupérer un paramètre spécifique
      const setting = await prisma.setting.findUnique({
        where: { key }
      })

      if (!setting) {
        return NextResponse.json(
          { success: false, error: 'Paramètre non trouvé' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          key: setting.key,
          value: setting.type === 'json' ? JSON.parse(setting.value) : setting.value,
          type: setting.type
        }
      })
    }

    // Récupérer tous les paramètres
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' }
    })

    // Formatter en objet key-value
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.type === 'json' 
        ? JSON.parse(setting.value) 
        : setting.value
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: settingsObject
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau paramètre
export async function POST(request: NextRequest) {
  try {
    const { key, value, type = 'string' } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Clé et valeur requises' },
        { status: 400 }
      )
    }

    const stringValue = type === 'json' ? JSON.stringify(value) : String(value)

    const setting = await prisma.setting.create({
      data: { key, value: stringValue, type }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...setting,
        value: type === 'json' ? JSON.parse(setting.value) : setting.value
      }
    })
  } catch (error) {
    console.error('Erreur lors de la création du paramètre:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un paramètre existant
export async function PUT(request: NextRequest) {
  try {
    const { key, value, type } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Clé et valeur requises' },
        { status: 400 }
      )
    }

    const stringValue = type === 'json' ? JSON.stringify(value) : String(value)

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { 
        value: stringValue,
        ...(type && { type })
      },
      create: { 
        key, 
        value: stringValue, 
        type: type || 'string' 
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...setting,
        value: setting.type === 'json' ? JSON.parse(setting.value) : setting.value
      }
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
