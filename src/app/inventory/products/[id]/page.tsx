'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Edit,
  Activity,
  Warehouse,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { VariantStockManager } from '@/components/inventory/VariantStockManager'

interface Product {
  id: string
  name: string
  sku: string | null
  stock: number
  lowStock: number
  price: number
  cost: number | null
  trackStock: boolean
  category: { name: string } | null
  collection: { name: string } | null
  variants: Array<{
    id: string
    name: string
    stock: number
    sku: string | null
  }>
}

interface StockMovement {
  id: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string | null
  productVariantId: string | null
  productVariantName: string | null
  createdAt: string
}

export default function ProductStockPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [newStock, setNewStock] = useState(0)
  const [reason, setReason] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProductData()
    fetchMovements()
  }, [params.id])

  const fetchProductData = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        setNewStock(data.stock)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMovements = async () => {
    try {
      const response = await fetch(`/api/inventory/movements?productId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMovements(data.movements)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error)
    }
  }

  const handleStockUpdate = async () => {
    if (!product) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          newStock,
          reason
        })
      })

      if (response.ok) {
        await fetchProductData()
        await fetchMovements()
        setIsEditing(false)
        setReason('')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    } finally {
      setSaving(false)
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
      <Sidebar>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Chargement...</span>
        </div>
      </Sidebar>
    )
  }

  if (!product) {
    return (
      <Sidebar>
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Produit non trouvé</h2>
          <p className="text-gray-600 mb-4">Le produit demandé n'existe pas ou a été supprimé.</p>
          <Link href="/inventory">
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              Retour à l'inventaire
            </button>
          </Link>
        </div>
      </Sidebar>
    )
  }

  const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0)
  const totalStock = product.stock + totalVariantStock
  const stockValue = totalStock * (product.cost || product.price)

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
                <Package className="w-8 h-8 text-primary" />
                <span>{product.name}</span>
              </h1>
              <p className="text-gray-600">
                Gestion du stock - {product.sku && `SKU: ${product.sku}`}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link href={`/products/${product.id}`}>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Voir Produit</span>
              </button>
            </Link>
            <Link href={`/products/${product.id}/edit`}>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Stats du produit */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Principal</p>
                <p className="text-2xl font-bold text-gray-900">{product.stock}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Variantes</p>
                <p className="text-2xl font-bold text-green-600">{totalVariantStock}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold text-primary">{totalStock}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(stockValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gestion du stock principal */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stock Principal</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Ajuster Stock</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau stock
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="0"
                  />
                </div>

                <div>
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
                  Stock actuel: {product.stock} → Nouveau: {newStock}
                  <span className={`ml-2 font-medium ${
                    newStock > product.stock ? 'text-green-600' : 
                    newStock < product.stock ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    ({newStock > product.stock ? '+' : ''}{newStock - product.stock})
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleStockUpdate}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{product.stock}</div>
                <p className="text-sm text-gray-600">
                  Seuil d'alerte: {product.lowStock}
                  {product.stock <= product.lowStock && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Stock faible
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(product.stock * (product.cost || product.price))}
                </div>
                <p className="text-sm text-gray-600">Valeur stock principal</p>
              </div>
            </div>
          )}
        </div>

        {/* Gestion des variantes */}
        {product.variants.length > 0 && (
          <VariantStockManager
            productId={product.id}
            productName={product.name}
            onStockUpdate={() => {
              fetchProductData()
              fetchMovements()
            }}
          />
        )}

        {/* Historique des mouvements */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Historique des Mouvements</h2>
          </div>

          <div className="divide-y">
            {movements.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Aucun mouvement de stock enregistré</p>
              </div>
            ) : (
              movements.slice(0, 20).map((movement) => (
                <div key={movement.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {movement.productVariantName 
                            ? `${movement.productVariantName}` 
                            : 'Stock principal'
                          }
                        </div>
                        <p className="text-sm text-gray-600">
                          {movement.reason || `Mouvement ${movement.type}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(movement.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-medium ${
                        movement.type === 'IN' ? 'text-green-600' : 
                        movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '±'}
                        {movement.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
