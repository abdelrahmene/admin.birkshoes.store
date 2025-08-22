'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Edit,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  DollarSign,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react'

interface ProductVariant {
  id: string
  name: string
  sku: string | null
  price: number | null
  stock: number
  options: Record<string, string>
  stockValue: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  stockMovements: Array<{
    id: string
    type: 'IN' | 'OUT' | 'ADJUSTMENT'
    quantity: number
    reason: string | null
    createdAt: string
  }>
}

interface VariantStockManagerProps {
  productId: string
  productName: string
  onStockUpdate?: () => void
}

export function VariantStockManager({ 
  productId, 
  productName, 
  onStockUpdate 
}: VariantStockManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVariant, setEditingVariant] = useState<string | null>(null)
  const [newStock, setNewStock] = useState<number>(0)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchVariants()
    }
  }, [productId])

  const fetchVariants = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/inventory/variants?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 VariantStockManager - Variants response:', data)
        
        // 🔥 FIX: Extraire le tableau de variantes de la réponse
        const variantsArray = Array.isArray(data.variants) ? data.variants : (Array.isArray(data) ? data : [])
        console.log('🔎 VariantStockManager - Variants array is valid:', Array.isArray(variantsArray), 'Length:', variantsArray.length)
        
        setVariants(variantsArray)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des variantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockUpdate = async (variantId: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/inventory/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          newStock,
          reason
        })
      })

      if (response.ok) {
        await fetchVariants()
        setEditingVariant(null)
        setNewStock(0)
        setReason('')
        onStockUpdate?.()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (variant: ProductVariant) => {
    setEditingVariant(variant.id)
    setNewStock(variant.stock)
    setReason('')
  }

  const cancelEditing = () => {
    setEditingVariant(null)
    setNewStock(0)
    setReason('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            En stock
          </span>
        )
      case 'low_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Stock faible
          </span>
        )
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rupture
          </span>
        )
      default:
        return null
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'OUT':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'ADJUSTMENT':
        return <RefreshCw className="w-4 h-4 text-blue-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Chargement des variantes...</span>
        </div>
      </div>
    )
  }

  if (variants.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune variante</h3>
          <p className="text-gray-600">Ce produit n'a pas de variantes configurées.</p>
        </div>
      </div>
    )
  }

  // Statistiques des variantes
  const totalVariantStock = variants.reduce((sum, v) => sum + v.stock, 0)
  const totalVariantValue = variants.reduce((sum, v) => sum + v.stockValue, 0)
  const lowStockVariants = variants.filter(v => v.status === 'low_stock').length
  const outOfStockVariants = variants.filter(v => v.status === 'out_of_stock').length

  return (
    <div className="space-y-6">
      {/* Stats des variantes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Variantes</p>
              <p className="text-2xl font-bold text-gray-900">{variants.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalVariantStock}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalVariantValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertes</p>
              <p className="text-2xl font-bold text-red-600">{lowStockVariants + outOfStockVariants}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Liste des variantes */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Stock par Variante - {productName}
          </h3>
        </div>

        <div className="divide-y">
          {Array.isArray(variants) && variants.map((variant, index) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{variant.name}</h4>
                      {variant.sku && (
                        <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                      )}
                      
                      {/* Options de la variante */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(variant.options).map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-4 mt-3">
                        {getStatusBadge(variant.status)}
                        {variant.price && (
                          <span className="text-sm text-gray-600">
                            Prix: {formatCurrency(variant.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {variant.stock}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(variant.stockValue)}
                      </div>
                    </div>
                  </div>

                  {/* Édition du stock */}
                  {editingVariant === variant.id ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nouveau stock
                          </label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setNewStock(Math.max(0, newStock - 1))}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={newStock}
                              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                              className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                              min="0"
                            />
                            <button
                              onClick={() => setNewStock(newStock + 1)}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Raison (optionnel)
                          </label>
                          <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Inventaire physique, correction..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Stock actuel: {variant.stock} → Nouveau: {newStock}
                          <span className={`ml-2 font-medium ${
                            newStock > variant.stock ? 'text-green-600' : 
                            newStock < variant.stock ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            ({newStock > variant.stock ? '+' : ''}{newStock - variant.stock})
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>Annuler</span>
                          </button>
                          <button
                            onClick={() => handleStockUpdate(variant.id)}
                            disabled={saving}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2"
                          >
                            {saving ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      {/* Mouvements récents */}
                      <div className="flex-1">
                        {variant.stockMovements.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Mouvements récents:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(variant.stockMovements) && variant.stockMovements.slice(0, 3).map((movement) => (
                                <div
                                  key={movement.id}
                                  className="flex items-center space-x-1 text-xs bg-gray-100 rounded-full px-2 py-1"
                                >
                                  {getMovementIcon(movement.type)}
                                  <span className={movement.type === 'IN' ? 'text-green-600' : 
                                                movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'}>
                                    {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}
                                    {movement.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => startEditing(variant)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Ajuster</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
