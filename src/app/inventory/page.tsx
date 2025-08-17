'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  Warehouse,
  Activity,
  DollarSign,
  ShoppingCart,
  Settings
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

// Types pour les données d'inventaire
interface InventoryProduct {
  id: string
  name: string
  sku: string | null
  stock: number
  lowStock: number
  trackStock: boolean
  price: float
  cost: float | null
  category: string | null
  collection: string | null
  variants: {
    id: string
    name: string
    stock: number
    sku: string | null
  }[]
  totalVariantStock: number
  stockValue: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

interface InventoryStats {
  totalProducts: number
  totalStock: number
  totalValue: number
  lowStockProducts: number
  outOfStockProducts: number
  recentMovements: number
}

interface StockMovement {
  id: string
  productName: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string | null
  createdAt: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    recentMovements: 0
  })
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    setLoading(true)
    try {
      // Utiliser l'API des produits avec les variantes pour calculer les stocks
      const products = await apiClient.get('/products?include=variants,category')
      
      // Calculer les statistiques côté client pour l'instant
      const processedProducts: InventoryProduct[] = products.map((product: any) => {
        const totalVariantStock = product.variants?.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0) || 0
        const effectiveStock = product.variants?.length > 0 ? totalVariantStock : (product.stock || 0)
        
        let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
        if (effectiveStock === 0) {
          status = 'out_of_stock'
        } else if (effectiveStock <= (product.lowStock || 5)) {
          status = 'low_stock'
        }
        
        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          lowStock: product.lowStock || 5,
          trackStock: product.trackStock,
          price: product.price,
          cost: product.cost,
          category: product.category?.name || null,
          collection: product.collection?.name || null,
          variants: product.variants || [],
          totalVariantStock,
          totalStock: effectiveStock,
          stockValue: effectiveStock * product.price,
          status,
          hasVariants: product.variants?.length > 0
        }
      })
      
      // Calculer les statistiques
      const totalProducts = processedProducts.length
      const totalStock = processedProducts.reduce((sum, p) => sum + p.totalStock, 0)
      const totalValue = processedProducts.reduce((sum, p) => sum + p.stockValue, 0)
      const lowStockProducts = processedProducts.filter(p => p.status === 'low_stock').length
      const outOfStockProducts = processedProducts.filter(p => p.status === 'out_of_stock').length
      
      setProducts(processedProducts)
      setStats({
        totalProducts,
        totalStock,
        totalValue,
        lowStockProducts,
        outOfStockProducts,
        recentMovements: 0 // À implémenter plus tard
      })
      
      // Les mouvements seront implémentés plus tard
      setRecentMovements([])
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast.error('Erreur lors du chargement des données d\'inventaire')
    } finally {
      setLoading(false)
    }
  }

  // Filtrage et tri des produits
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      
      if (filterStatus === 'all') return matchesSearch
      if (filterStatus === 'in_stock') return matchesSearch && product.status === 'in_stock'
      if (filterStatus === 'low_stock') return matchesSearch && product.status === 'low_stock'
      if (filterStatus === 'out_of_stock') return matchesSearch && product.status === 'out_of_stock'
      
      return matchesSearch
    })
    .sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (sortBy) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'stock':
          // 🔥 CORRIGÉ: Utiliser le stock total calculé par l'API
          aVal = a.totalStock || 0
          bVal = b.totalStock || 0
          break
        case 'value':
          aVal = a.stockValue
          bVal = b.stockValue
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        default:
          aVal = a.name
          bVal = b.name
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

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

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <Warehouse className="w-8 h-8 text-primary" />
              <span>Inventaire</span>
            </h1>
            <p className="text-gray-600">Gérez vos stocks et suivez vos mouvements d'inventaire</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchInventoryData}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <Link href="/inventory/adjustments">
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Ajustement</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStock.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-green-600" />
              </div>
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
                <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
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
                <p className="text-sm font-medium text-gray-600">Alertes Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStockProducts + stats.outOfStockProducts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation rapide */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/inventory/alerts">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <h3 className="font-medium text-gray-900">Alertes Stock</h3>
                <p className="text-sm text-gray-600">Gérer les produits en rupture ou stock faible</p>
              </div>
            </Link>
            
            <Link href="/inventory/movements">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Activity className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">Mouvements</h3>
                <p className="text-sm text-gray-600">Historique des entrées et sorties de stock</p>
              </div>
            </Link>
            
            <Link href="/inventory/adjustments">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <RefreshCw className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900">Ajustements</h3>
                <p className="text-sm text-gray-600">Corriger les stocks et inventaires physiques</p>
              </div>
            </Link>
            
            <Link href="/inventory/sync">
              <div className="p-4 border rounded-lg hover:bg-yellow-50 cursor-pointer transition-colors border-yellow-200">
                <Settings className="w-8 h-8 text-yellow-600 mb-2" />
                <h3 className="font-medium text-gray-900">Synchronisation</h3>
                <p className="text-sm text-gray-600">Corriger automatiquement les incohérences</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des produits */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Produits en Stock</h2>
                <button className="text-sm text-primary hover:text-primary/80">
                  Voir tout
                </button>
              </div>

              {/* Filtres et recherche */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="in_stock">En stock</option>
                  <option value="low_stock">Stock faible</option>
                  <option value="out_of_stock">Rupture</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field)
                    setSortOrder(order as 'asc' | 'desc')
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="name-asc">Nom A-Z</option>
                  <option value="name-desc">Nom Z-A</option>
                  <option value="stock-desc">Stock (élevé)</option>
                  <option value="stock-asc">Stock (faible)</option>
                  <option value="value-desc">Valeur (élevée)</option>
                  <option value="value-asc">Valeur (faible)</option>
                </select>
              </div>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Chargement des produits...</p>
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Aucun produit trouvé</p>
                </div>
              ) : (
                filteredAndSortedProducts.slice(0, 10).map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            {product.sku && (
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusBadge(product.status)}
                              {product.category && (
                                <span className="text-xs text-gray-500">{product.category}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {/* 🔥 CORRIGÉ: Afficher le stock total calculé par l'API */}
                              {product.totalStock || 0}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(product.stockValue)}
                            </div>
                            {/* Debug info */}
                            {product.hasVariants && (
                              <div className="text-xs text-blue-500">
                                {product.variants.length} variante(s)
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {product.hasVariants && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">{product.variants.length} variante(s)</p>
                            <div className="text-xs text-gray-400">
                              Stock variantes: {product.totalVariantStock}
                            </div>
                            {/* Debug: Montrer le stock DB vs calculé */}
                            <div className="text-xs text-blue-400">
                              DB: {product.stock} | Calculé: {product.totalStock}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Link href={`/products/${product.id}`}>
                          <button className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg" title="Voir le produit">
                            <Eye size={16} />
                          </button>
                        </Link>
                        
                        {product.variants.length > 0 && (
                          <Link href={`/inventory/products/${product.id}`}>
                            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Gérer les stocks des variantes">
                              <Settings size={16} />
                            </button>
                          </Link>
                        )}
                        
                        <Link href={`/products/${product.id}/edit`}>
                          <button className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg" title="Modifier le produit">
                            <Edit size={16} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mouvements récents */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Mouvements Récents</h2>
                <Link href="/inventory/movements">
                  <button className="text-sm text-primary hover:text-primary/80">
                    Voir tout
                  </button>
                </Link>
              </div>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="p-6 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Chargement...</p>
                </div>
              ) : recentMovements.length === 0 ? (
                <div className="p-6 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Aucun mouvement récent</p>
                </div>
              ) : (
                recentMovements.map((movement) => (
                  <div key={movement.id} className="p-4">
                    <div className="flex items-center space-x-3">
                      {getMovementIcon(movement.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {movement.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {movement.reason || `Mouvement ${movement.type}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(movement.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          movement.type === 'IN' ? 'text-green-600' : 
                          movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}
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
      </div>
    </Sidebar>
  )
}