'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Eye,
  Settings,
  Database,
  Zap,
  Activity
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'

interface StockAnalysis {
  inconsistentProducts: Array<{
    id: string
    name: string
    stock: number
    variantCount: number
    variantStockSum: number
    issue: string
  }>
  summary: {
    total: number
    withVariants: number
    withInconsistencies: number
    needsSync: number
  }
}

interface SyncResult {
  total: number
  updated: number
  skipped: number
  errors: number
  details: Array<{
    productId: string
    productName: string
    action: 'updated' | 'skipped' | 'error'
    oldStock: number
    newStock: number
    variantCount: number
    reason: string
  }>
}

export default function StockSyncPage() {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    analyzeStocks()
  }, [])

  const analyzeStocks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory/sync-stock?action=analyze')
      if (response.ok) {
        const data = await response.json()
        setAnalysis(data)
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncAllStocks = async () => {
    if (!confirm('Êtes-vous sûr de vouloir synchroniser tous les stocks ? Cette action modifiera les données.')) {
      return
    }

    setSyncing(true)
    try {
      const response = await fetch('/api/inventory/sync-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-all' })
      })
      
      if (response.ok) {
        const result = await response.json()
        setSyncResult(result)
        // Reanalyser après la sync
        await analyzeStocks()
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/inventory">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <Database className="w-8 h-8 text-primary" />
                <span>Synchronisation des Stocks</span>
              </h1>
              <p className="text-gray-600">
                Analysez et corrigez les incohérences de stock automatiquement
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={analyzeStocks}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Reanalyser</span>
            </button>
            
            {analysis?.summary.needsSync > 0 && (
              <button
                onClick={syncAllStocks}
                disabled={syncing}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>{syncing ? 'Synchronisation...' : 'Synchroniser Tout'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Règles de synchronisation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <Settings className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Règles de Synchronisation
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Produits avec variantes</strong> → Stock principal = 0 (stock géré par les variantes)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Produits sans variantes</strong> → Conserver le stock existant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Tous les changements sont enregistrés dans l'historique des mouvements</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques d'analyse */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-900">{analysis.summary.total}</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avec Variantes</p>
                  <p className="text-2xl font-bold text-blue-600">{analysis.summary.withVariants}</p>
                </div>
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Incohérences</p>
                  <p className={`text-2xl font-bold ${
                    analysis.summary.withInconsistencies > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {analysis.summary.withInconsistencies}
                  </p>
                </div>
                {analysis.summary.withInconsistencies > 0 ? (
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">À Synchroniser</p>
                  <p className={`text-2xl font-bold ${
                    analysis.summary.needsSync > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {analysis.summary.needsSync}
                  </p>
                </div>
                {analysis.summary.needsSync > 0 ? (
                  <Zap className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Résultat de la synchronisation */}
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border"
          >
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Synchronisation Terminée</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{syncResult.updated}</div>
                  <div className="text-sm text-gray-600">Mis à jour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{syncResult.skipped}</div>
                  <div className="text-sm text-gray-600">Ignorés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{syncResult.errors}</div>
                  <div className="text-sm text-gray-600">Erreurs</div>
                </div>
              </div>

              {syncResult.details.some(d => d.action === 'updated') && (
                <div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-4"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showDetails ? 'Masquer' : 'Voir'} les détails</span>
                  </button>

                  {showDetails && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {syncResult.details
                        .filter(detail => detail.action === 'updated')
                        .map((detail, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{detail.productName}</div>
                              <div className="text-sm text-gray-600">{detail.reason}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {detail.oldStock} → {detail.newStock}
                              </div>
                              <div className="text-xs text-gray-500">
                                {detail.variantCount} variantes
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Liste des produits avec incohérences */}
        {analysis && analysis.inconsistentProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border"
          >
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Produits avec Incohérences ({analysis.inconsistentProducts.length})
                </h2>
              </div>
            </div>
            
            <div className="divide-y">
              {analysis.inconsistentProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-orange-600 mt-1">{product.issue}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Stock DB: {product.stock} | Variantes: {product.variantCount} | Stock variantes: {product.variantStockSum}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                        Correction requise
                      </span>
                      <Link href={`/inventory/products/${product.id}`}>
                        <button className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* État de cohérence */}
        {analysis && analysis.summary.withInconsistencies === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
          >
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ✅ Tous les stocks sont cohérents !
            </h3>
            <p className="text-green-800">
              Aucune incohérence détectée. Votre système d'inventaire est parfaitement synchronisé.
            </p>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && !analysis && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Analyse des stocks en cours...</p>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
