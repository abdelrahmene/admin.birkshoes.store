'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Package,
  Search,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  Save
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string | null
  stock: number
  lowStock: number
}

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  productId?: string
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  onSuccess,
  productId
}: StockAdjustmentModalProps) {
  const [step, setStep] = useState<'search' | 'adjust'>('search')
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newStock, setNewStock] = useState(0)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (productId) {
        // Si un produit spécifique est fourni, le charger directement
        loadSpecificProduct(productId)
      } else {
        setStep('search')
        setSelectedProduct(null)
        setNewStock(0)
        setReason('')
      }
    }
  }, [isOpen, productId])

  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      searchProducts()
    } else {
      setProducts([])
    }
  }, [searchTerm])

  const loadSpecificProduct = async (id: string) => {
    setSearchLoading(true)
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const product = await response.json()
        setSelectedProduct({
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          lowStock: product.lowStock
        })
        setNewStock(product.stock)
        setStep('adjust')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const searchProducts = async () => {
    if (searchLoading) return
    
    setSearchLoading(true)
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const selectProduct = (product: Product) => {
    setSelectedProduct(product)
    setNewStock(product.stock)
    setStep('adjust')
  }

  const handleAdjustment = async () => {
    if (!selectedProduct || loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          newStock,
          reason: reason || `Ajustement manuel: ${selectedProduct.stock} → ${newStock}`
        })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajustement:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockDifference = () => {
    if (!selectedProduct) return 0
    return newStock - selectedProduct.stock
  }

  const getStockStatus = (stock: number, lowStock: number) => {
    if (stock === 0) return { label: 'Rupture', color: 'text-red-600' }
    if (stock <= lowStock) return { label: 'Stock faible', color: 'text-yellow-600' }
    return { label: 'En stock', color: 'text-green-600' }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-purple-600/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {step === 'search' ? 'Ajustement de Stock' : 'Modifier le Stock'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {step === 'search' 
                      ? 'Recherchez un produit pour ajuster son stock'
                      : `Ajuster le stock de ${selectedProduct?.name}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {step === 'search' ? (
              <div className="space-y-4">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                  {searchLoading && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                  )}
                </div>

                {/* Résultats de recherche */}
                <div className="max-h-80 overflow-y-auto">
                  {products.length === 0 && searchTerm.length >= 2 && !searchLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun produit trouvé</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {products.map((product) => {
                        const status = getStockStatus(product.stock, product.lowStock)
                        return (
                          <button
                            key={product.id}
                            onClick={() => selectProduct(product)}
                            className="w-full p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                {product.sku && (
                                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                                )}
                                <span className={`text-sm font-medium ${status.color}`}>
                                  {status.label}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  {product.stock}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Seuil: {product.lowStock}
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Informations produit */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <Package className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedProduct?.name}</h3>
                      {selectedProduct?.sku && (
                        <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Stock actuel</p>
                      <p className="text-xl font-bold text-gray-900">{selectedProduct?.stock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Seuil d'alerte</p>
                      <p className="text-lg font-semibold text-yellow-600">{selectedProduct?.lowStock}</p>
                    </div>
                  </div>
                </div>

                {/* Ajustement du stock */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau stock
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setNewStock(Math.max(0, newStock - 1))}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 px-4 py-3 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        onClick={() => setNewStock(newStock + 1)}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Différence */}
                  {getStockDifference() !== 0 && (
                    <div className={`p-3 rounded-xl flex items-center space-x-2 ${
                      getStockDifference() > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">
                        {getStockDifference() > 0 ? '+' : ''}
                        {getStockDifference()} unités
                      </span>
                      <span className="text-sm">
                        ({selectedProduct?.stock} → {newStock})
                      </span>
                    </div>
                  )}

                  {/* Raison */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison (optionnel)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Inventaire physique, produit défectueux, erreur de saisie..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            {step === 'adjust' && (
              <button
                onClick={() => setStep('search')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Changer de produit
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-white transition-colors"
              >
                Annuler
              </button>
              {step === 'adjust' && (
                <button
                  onClick={handleAdjustment}
                  disabled={loading || !selectedProduct || getStockDifference() === 0}
                  className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Enregistrement...' : 'Ajuster le stock'}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}