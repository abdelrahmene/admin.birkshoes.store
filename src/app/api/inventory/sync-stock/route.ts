import { NextRequest, NextResponse } from 'next/server'
import { syncAllProductStocks, analyzeStockInconsistencies, syncSingleProduct } from '@/lib/inventory/sync-stock'

/**
 * GET /api/inventory/sync-stock?action=analyze
 * Analyser les incohérences sans les corriger
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'analyze') {
      const analysis = await analyzeStockInconsistencies()
      return NextResponse.json(analysis)
    }

    return NextResponse.json(
      { error: 'Action non reconnue. Utilisez ?action=analyze' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/sync-stock
 * Synchroniser les stocks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, productId } = body

    if (action === 'sync-all') {
      const result = await syncAllProductStocks()
      return NextResponse.json(result)
    }

    if (action === 'sync-single' && productId) {
      const result = await syncSingleProduct(productId)
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: 'Action non reconnue ou paramètres manquants' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
