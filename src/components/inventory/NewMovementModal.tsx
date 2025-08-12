'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Package, Search, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string | null
  stock: number
}

interface NewMovementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewMovementModal({ isOpen, onClose, onSuccess }: NewMovementModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductList, setShowProductList] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: '',
    reason: '',
    reference: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
      resetForm()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(
        products.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      )
      setShowProductList(true)
    } else {
      setFilteredProducts([])
      setShowProductList(false)
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products?limit=1000&status=active')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'IN',
      quantity: '',
      reason: '',
      reference: ''
    })
    setSelectedProduct(null)
    setSearchTerm('')
    setShowProductList(false)
  }

  const selectProduct = (product: Product) => {
    setSelectedProduct(product)
    setFormData(prev => ({ ...prev, productId: product.id }))
    setSearchTerm(product.name)
    setShowProductList(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productId || !formData.quantity) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: formData.productId,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          reason: formData.reason || null,
          reference: formData.reference || null
        })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la création du mouvement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création du mouvement')
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'OUT':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      case 'ADJUSTMENT':
        return <RefreshCw className="w-5 h-5 text-blue-600" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'IN':
        return 'Entrée de stock'
      case 'OUT':
        return 'Sortie de stock'
      case 'ADJUSTMENT':
        return 'Ajustement de stock'
      default:
        return type
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Nouveau mouvement de stock</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection du produit */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produit *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            {/* Liste des produits */}
            {showProductList && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-center text-gray-500">Chargement...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-3 text-center text-gray-500">Aucun produit trouvé</div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.sku && (
                          <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
            
            {/* Produit sélectionné */}
            {selectedProduct && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{selectedProduct.name}</div>
                    <div className="text-xs text-gray-500">
                      Stock actuel: {selectedProduct.stock} • SKU: {selectedProduct.sku || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type de mouvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de mouvement *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['IN', 'OUT', 'ADJUSTMENT'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`p-3 rounded-lg border transition-colors flex flex-col items-center space-y-1 ${
                    formData.type === type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {getTypeIcon(type)}
                  <span className="text-xs font-medium">{getTypeLabel(type).split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité *
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === 'IN' && 'Quantité à ajouter au stock'}
              {formData.type === 'OUT' && 'Quantité à retirer du stock'}
              {formData.type === 'ADJUSTMENT' && 'Quantité pour l\'ajustement'}
            </p>
          </div>

          {/* Raison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Ex: Réception fournisseur, vente, inventaire..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Ex: Bon de livraison, commande #123..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!formData.productId || !formData.quantity || submitting}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <span>Créer le mouvement</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}