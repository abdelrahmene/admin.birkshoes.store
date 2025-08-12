'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  RefreshCw,
  Package,
  ArrowLeft,
  Search,
  Plus,
  Save,
  X,
  Edit,
  History,
  AlertCircle,
  Check
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'

// Types
interface Product {
  id: string
  name: string
  sku: string | null
  stock: number
  lowStock: number
  price: number
  cost: number | null
  category: string | null
  variants: {
    id: string
    name: string
    stock: number
    sku: string | null
  }[]
  totalVariantStock: number
}

interface StockAdjustment {
  productId: string
  currentStock: number
  newStock: number
  difference: number
  reason: string
}

interface RecentAdjustment {
  id: string
  productName: string
  oldStock: number
  newStock: number
  difference: number
  reason: string
  createdAt: string
}

export default function StockAdjustmentsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [recentAdjustments, setRecentAdjustments] = useState<RecentAdjustment[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showBulkMode, setShowBulkMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProducts()
    fetchRecentAdjustments()
  }, [])

  useEffect(() => {
    // Filtrer les produits selon le terme de recherche
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentAdjustments = async () => {
    try {
      const response = await fetch('/api/inventory/adjustments?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentAdjustments(data.adjustments)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ajustements récents:', error)
    }
  }

  const handleStockChange = (productId: string, newStock: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const newStockNumber = parseInt(newStock) || 0
    const currentStock = product.stock + product.totalVariantStock
    const difference = newStockNumber - currentStock

    setAdjustments(prev => {
      const existing = prev.find(adj => adj.productId === productId)
      if (existing) {
        return prev.map(adj => 
          adj.productId === productId 
            ? { ...adj, newStock: newStockNumber, difference }
            : adj
        )
      } else if (difference !== 0) {
        return [...prev, {
          productId,
          currentStock,
          newStock: newStockNumber,
          difference,
          reason: ''
        }]
      }
      return prev
    })
  }

  const handleReasonChange = (productId: string, reason: string) => {
    setAdjustments(prev => 
      prev.map(adj => 
        adj.productId === productId 
          ? { ...adj, reason }
          : adj
      )
    )
  }

  const removeAdjustment = (productId: string) => {
    setAdjustments(prev => prev.filter(adj => adj.productId !== productId))
  }

  const saveAdjustments = async () => {
    if (adjustments.length === 0) return

    setSaving(true)
    try {
      const results = await Promise.all(
        adjustments.map(async (adjustment) => {
          const response = await fetch('/api/inventory/movements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: adjustment.productId,
              type: 'ADJUSTMENT',
              quantity: adjustment.difference,
              reason: adjustment.reason || `Ajustement: ${adjustment.currentStock} → ${adjustment.newStock}`
            })
          })
          return response.ok
        })
      )

      const successful = results.filter(Boolean).length
      
      if (successful > 0) {
        setAdjustments([])
        await fetchProducts()
        await fetchRecentAdjustments()
        
        // Afficher une notification de succès
        alert(`${successful} ajustement(s) sauvegardé(s) avec succès !`)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde des ajustements')
    } finally {
      setSaving(false)
    }
  }

  const getStockStatusColor = (product: Product) => {
    const totalStock = product.stock + product.totalVariantStock
    if (totalStock === 0) return 'text-red-600'
    if (totalStock <= product.lowStock) return 'text-orange-600'
    return 'text-green-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const bulkAdjustmentOptions = [
    { label: 'Inventaire physique', value: 'physical_inventory' },
    { label: 'Produits endommagés', value: 'damaged_goods' },
    { label: 'Produits perdus', value: 'lost_goods' },
    { label: 'Correction d\'erreur', value: 'error_correction' }
  ]

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Link href="/inventory" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à l'inventaire
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <RefreshCw className="w-8 h-8 text-primary" />
              <span>Ajustements de Stock</span>
            </h1>
            <p className="text-gray-600">Corrigez les stocks et gérez les inventaires physiques</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBulkMode(!showBulkMode)}
              className={`px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2 ${
                showBulkMode ? 'bg-gray-50 text-primary border-primary' : 'bg-white border-gray-200'
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>Mode groupé</span>
            </button>
            <Link href="/inventory/movements">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>Historique</span>
              </button>
            </Link>
            {adjustments.length > 0 && (
              <button
                onClick={saveAdjustments}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Sauvegarder ({adjustments.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Ajustements en cours */}
        {adjustments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">
                Ajustements en cours ({adjustments.length})
              </h3>
              <button
                onClick={() => setAdjustments([])}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {adjustments.map(adjustment => {
                const product = products.find(p => p.id === adjustment.productId)
                if (!product) return null
                
                return (
                  <div key={adjustment.productId} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            Stock actuel: {adjustment.currentStock}
                          </span>
                          <span className="text-sm text-gray-600">
                            Nouveau stock: {adjustment.newStock}
                          </span>
                          <span className={`text-sm font-medium ${
                            adjustment.difference > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {adjustment.difference > 0 ? '+' : ''}{adjustment.difference}
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="Raison de l'ajustement..."
                          value={adjustment.reason}
                          onChange={(e) => handleReasonChange(adjustment.productId, e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeAdjustment(adjustment.productId)}
                        className="ml-4 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un produit à ajuster..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des produits */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Produits ({filteredProducts.length})</h2>
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Chargement des produits...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Aucun produit trouvé</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = product.stock + product.totalVariantStock
                  const pendingAdjustment = adjustments.find(adj => adj.productId === product.id)
                  
                  return (
                    <div key={product.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{product.name}</h3>
                              {product.sku && (
                                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                              )}
                              {product.category && (
                                <p className="text-xs text-gray-400">{product.category}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-semibold ${getStockStatusColor(product)}`}>
                                {totalStock}
                              </div>
                              <div className="text-sm text-gray-500">
                                Seuil: {product.lowStock}
                              </div>
                              {product.cost && (
                                <div className="text-xs text-gray-400">
                                  {formatCurrency(product.cost)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Champ d'ajustement */}
                          <div className="mt-3 flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700 min-w-0">
                              Nouveau stock:
                            </label>
                            <input
                              type="number"
                              min="0"
                              defaultValue={totalStock}
                              onChange={(e) => handleStockChange(product.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                            {pendingAdjustment && (
                              <span className={`text-sm font-medium ${
                                pendingAdjustment.difference > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {pendingAdjustment.difference > 0 ? '+' : ''}
                                {pendingAdjustment.difference}
                              </span>
                            )}
                          </div>

                          {/* Variantes si disponibles */}
                          {product.variants.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-2">{product.variants.length} variante(s):</p>
                              <div className="grid grid-cols-2 gap-2">
                                {product.variants.slice(0, 4).map(variant => (
                                  <div key={variant.id} className="text-xs p-2 bg-gray-50 rounded">
                                    <div className="font-medium truncate">{variant.name}</div>
                                    <div className="text-gray-600">Stock: {variant.stock}</div>
                                  </div>
                                ))}
                              </div>
                              {product.variants.length > 4 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{product.variants.length - 4} autre(s)...
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Ajustements récents */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Ajustements Récents</h2>
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
              {recentAdjustments.length === 0 ? (
                <div className="p-6 text-center">
                  <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Aucun ajustement récent</p>
                </div>
              ) : (
                recentAdjustments.map((adjustment) => (
                  <div key={adjustment.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {adjustment.difference > 0 ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <X className="w-3 h-3 text-red-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {adjustment.productName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {adjustment.oldStock} → {adjustment.newStock}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {adjustment.reason}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(adjustment.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          adjustment.difference > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {adjustment.difference > 0 ? '+' : ''}
                          {adjustment.difference}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions rapides */}
            <div className="p-4 border-t bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Raisons fréquentes</h3>
              <div className="space-y-2">
                {[
                  'Inventaire physique',
                  'Produits endommagés',
                  'Erreur de saisie',
                  'Retour client'
                ].map(reason => (
                  <button
                    key={reason}
                    onClick={() => {
                      // Appliquer cette raison aux ajustements en cours sans raison
                      setAdjustments(prev => 
                        prev.map(adj => 
                          adj.reason === '' ? { ...adj, reason } : adj
                        )
                      )
                    }}
                    className="block w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-white hover:text-gray-900 rounded border border-gray-200 hover:border-gray-300"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Modifiez la quantité de stock pour créer un ajustement</li>
                <li>• Ajoutez une raison pour chaque ajustement (recommandé)</li>
                <li>• Les ajustements seront enregistrés comme mouvements de type "ADJUSTMENT"</li>
                <li>• Le stock ne peut pas être négatif</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}