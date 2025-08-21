'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Package,
  TrendingDown,
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Eye,
  Plus,
  Mail,
  Bell
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

// Types
interface AlertProduct {
  id: string
  name: string
  sku: string | null
  stock: number
  lowStock: number
  price: number
  cost: number | null
  category: string | null
  collection: string | null
  variants: {
    id: string
    name: string
    stock: number
    sku: string | null
  }[]
  totalVariantStock: number
  totalStock: number
  status: 'out_of_stock' | 'low_stock'
  alertLevel: 'critical' | 'warning'
}

interface AlertStats {
  outOfStock: number
  lowStock: number
  total: number
  estimatedLoss: number
}

export default function InventoryAlertsPage() {
  const [alertProducts, setAlertProducts] = useState<AlertProduct[]>([])
  const [stats, setStats] = useState<AlertStats>({
    outOfStock: 0,
    lowStock: 0,
    total: 0,
    estimatedLoss: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('priority')

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/products?include=variants,category') as any
      const products = Array.isArray(response) ? response : response?.data || []
      
      // Typer explicitement products comme array
      const productsArray = products as any[]
      
      // Filtrer et traiter les produits avec alertes
      const alertProducts: AlertProduct[] = productsArray
        .map((product: any) => {
          const totalVariantStock = product.variants?.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0) || 0
          const effectiveStock = product.variants?.length > 0 ? totalVariantStock : (product.stock || 0)
          const lowStockThreshold = product.lowStock || 5
          
          let status: 'out_of_stock' | 'low_stock' | null = null
          let alertLevel: 'critical' | 'warning' = 'warning'
          
          if (effectiveStock === 0) {
            status = 'out_of_stock'
            alertLevel = 'critical'
          } else if (effectiveStock <= lowStockThreshold) {
            status = 'low_stock'
            alertLevel = effectiveStock <= Math.floor(lowStockThreshold / 2) ? 'critical' : 'warning'
          }
          
          if (!status) return null // Pas d'alerte
          
          return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            stock: product.stock,
            lowStock: lowStockThreshold,
            price: product.price,
            cost: product.cost,
            category: product.category?.name || null,
            collection: product.collection?.name || null,
            variants: product.variants || [],
            totalVariantStock,
            totalStock: effectiveStock,
            status,
            alertLevel
          }
        })
        .filter((product): product is AlertProduct => product !== null) // Filtrer les null avec type guard
      
      // Calculer les statistiques
      const outOfStock = alertProducts.filter(p => p.status === 'out_of_stock').length
      const lowStock = alertProducts.filter(p => p.status === 'low_stock').length
      const estimatedLoss = alertProducts
        .filter(p => p.status === 'out_of_stock')
        .reduce((sum, p) => sum + (p.price * 5), 0) // Estimer 5 ventes perdues par produit en rupture
      
      setAlertProducts(alertProducts)
      setStats({
        outOfStock,
        lowStock,
        total: alertProducts.length,
        estimatedLoss
      })
      
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error)
      toast.error('Erreur lors du chargement des alertes de stock')
    } finally {
      setLoading(false)
    }
  }

  // Filtrage et tri des produits
  const filteredAndSortedProducts = alertProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      
      if (filterStatus === 'all') return matchesSearch
      if (filterStatus === 'out_of_stock') return matchesSearch && product.status === 'out_of_stock'
      if (filterStatus === 'low_stock') return matchesSearch && product.status === 'low_stock'
      
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          // Trier par priorité: rupture d'abord, puis stock faible
          if (a.status !== b.status) {
            return a.status === 'out_of_stock' ? -1 : 1
          }
          // Si même statut, trier par stock le plus faible
          return a.totalStock - b.totalStock
        case 'name':
          return a.name.localeCompare(b.name)
        case 'stock':
          return a.totalStock - b.totalStock
        case 'category':
          return (a.category || '').localeCompare(b.category || '')
        default:
          return 0
      }
    })

  const getAlertIcon = (status: string, alertLevel: string) => {
    if (status === 'out_of_stock') {
      return <AlertTriangle className="w-5 h-5 text-red-600" />
    }
    return <TrendingDown className={`w-5 h-5 ${alertLevel === 'critical' ? 'text-orange-600' : 'text-yellow-600'}`} />
  }

  const getAlertBadge = (status: string, alertLevel: string) => {
    if (status === 'out_of_stock') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rupture de stock
        </span>
      )
    }
    
    const colorClass = alertLevel === 'critical' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        Stock faible
      </span>
    )
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
        <div className="flex justify-between items-start">
          <div>
            <Link href="/inventory" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à l'inventaire
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <span>Alertes de Stock</span>
            </h1>
            <p className="text-gray-600">Gérez les produits en rupture ou avec un stock faible</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Envoyer rapport</span>
            </button>
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
                <p className="text-sm font-medium text-gray-600">Ruptures de stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
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
                <p className="text-sm font-medium text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-orange-600" />
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
                <p className="text-sm font-medium text-gray-600">Total alertes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-600" />
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
                <p className="text-sm font-medium text-gray-600">Perte estimée</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.estimatedLoss)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
              <option value="all">Toutes les alertes</option>
              <option value="out_of_stock">Ruptures de stock</option>
              <option value="low_stock">Stock faible</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="priority">Par priorité</option>
              <option value="name">Par nom</option>
              <option value="stock">Par stock</option>
              <option value="category">Par catégorie</option>
            </select>
          </div>
        </div>

        {/* Liste des alertes */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">
              Produits nécessitant votre attention ({filteredAndSortedProducts.length})
            </h2>
          </div>

          <div className="divide-y">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Chargement des alertes...</p>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Aucune alerte trouvée avec ces filtres' 
                    : 'Aucune alerte de stock ! Tout va bien 🎉'
                  }
                </p>
              </div>
            ) : (
              filteredAndSortedProducts.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(product.status, product.alertLevel)}
                          <div>
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            {product.sku && (
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            )}
                            <div className="flex items-center space-x-3 mt-2">
                              {getAlertBadge(product.status, product.alertLevel)}
                              {product.category && (
                                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                  {product.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {product.totalStock}
                          </div>
                          <div className="text-sm text-gray-500">
                            Seuil: {product.lowStock}
                          </div>
                          <div className="text-sm font-medium text-green-600 mt-1">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Détails des variantes si nécessaire */}
                      {product.variants.length > 0 && (
                        <div className="mt-3 pl-8">
                          <p className="text-xs text-gray-500 mb-2">
                            {product.variants.length} variante(s):
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {product.variants.map(variant => (
                              <div key={variant.id} className="text-xs p-2 bg-gray-50 rounded">
                                <div className="font-medium truncate">{variant.name}</div>
                                <div className={`${variant.stock === 0 ? 'text-red-600' : variant.stock <= 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                                  Stock: {variant.stock}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggestions d'actions */}
                      <div className="mt-3 pl-8">
                        <div className="flex flex-wrap gap-2">
                          {product.status === 'out_of_stock' ? (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                              ⚠️ Réapprovisionnement urgent requis
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                              📦 Prévoir réapprovisionnement
                            </span>
                          )}
                          
                          {product.cost && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              💰 Coût unitaire: {formatCurrency(product.cost)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Link href={`/products/${product.id}`}>
                        <button className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg">
                          <Eye size={16} />
                        </button>
                      </Link>
                      <Link href={`/products/${product.id}/edit`}>
                        <button className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <Link href={`/inventory/adjustments?product=${product.id}`}>
                        <button className="p-2 text-white bg-primary hover:bg-primary/90 rounded-lg">
                          <Plus size={16} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions en lot */}
        {filteredAndSortedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Actions groupées</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Ajustement en lot</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Notifier fournisseurs</span>
              </button>
              <Link href="/inventory/movements">
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Voir historique</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}