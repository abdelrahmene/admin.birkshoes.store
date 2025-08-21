'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Download,
  Plus,
  ArrowLeft,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { NewMovementModal } from '@/components/inventory/NewMovementModal'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

// Types
interface StockMovement {
  id: string
  productId: string
  productVariantId?: string | null
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  previousStock: number
  newStock: number
  reason?: string | null
  reference?: string | null
  createdAt: string
  product: {
    id: string
    name: string
    sku?: string | null
  }
  productVariant?: {
    id: string
    sku?: string | null
    options: any
  } | null
}

interface MovementFilters {
  type: string
  productId: string
  startDate: string
  endDate: string
  search: string
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<MovementFilters>({
    type: 'all',
    productId: '',
    startDate: '',
    endDate: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showNewMovementModal, setShowNewMovementModal] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchMovements()
  }, [])

  useEffect(() => {
    fetchMovements()
  }, [pagination.page, filters])

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get<any[]>('/products?include=variants')
      setProducts(data)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    }
  }

  const fetchMovements = async () => {
    setLoading(true)
    try {
      // Simuler des mouvements de stock basés sur les produits réels
      // En attendant qu'une vraie API de mouvements soit implémentée
      const mockMovements: StockMovement[] = products.slice(0, 5).map((product, index) => ({
        id: `mov_${index + 1}`,
        productId: product.id,
        productVariantId: product.variants?.length > 0 ? product.variants[0].id : null,
        type: ['IN', 'OUT', 'ADJUSTMENT'][index % 3] as 'IN' | 'OUT' | 'ADJUSTMENT',
        quantity: Math.floor(Math.random() * 20) + 1,
        previousStock: Math.floor(Math.random() * 50),
        newStock: Math.floor(Math.random() * 70),
        reason: ['Réapprovisionnement', 'Vente', 'Ajustement inventaire', 'Retour client', 'Défaut'][index % 5],
        reference: `REF-2024-${String(index + 1).padStart(3, '0')}`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku
        },
        productVariant: product.variants?.length > 0 ? {
          id: product.variants[0].id,
          sku: product.variants[0].sku,
          options: product.variants[0].options
        } : null
      }))

      const filteredMovements = applyFilters(mockMovements)
      const startIndex = (pagination.page - 1) * pagination.limit
      const endIndex = startIndex + pagination.limit
      const paginatedMovements = filteredMovements.slice(startIndex, endIndex)
      
      setMovements(paginatedMovements)
      setPagination(prev => ({
        ...prev,
        totalCount: filteredMovements.length,
        totalPages: Math.ceil(filteredMovements.length / prev.limit)
      }))
      
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error)
      toast.error('Erreur lors du chargement des mouvements')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (movements: StockMovement[]) => {
    return movements.filter(movement => {
      const matchesType = filters.type === 'all' || movement.type === filters.type
      const matchesProduct = !filters.productId || movement.productId === filters.productId
      const matchesSearch = !filters.search || 
        movement.product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        movement.product.sku?.toLowerCase().includes(filters.search.toLowerCase()) ||
        movement.reason?.toLowerCase().includes(filters.search.toLowerCase()) ||
        movement.reference?.toLowerCase().includes(filters.search.toLowerCase())
      
      let matchesDateRange = true
      if (filters.startDate) {
        matchesDateRange = matchesDateRange && new Date(movement.createdAt) >= new Date(filters.startDate)
      }
      if (filters.endDate) {
        matchesDateRange = matchesDateRange && new Date(movement.createdAt) <= new Date(filters.endDate + 'T23:59:59')
      }

      return matchesType && matchesProduct && matchesSearch && matchesDateRange
    })
  }

  const handleFilterChange = (key: keyof MovementFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const resetFilters = () => {
    setFilters({
      type: 'all',
      productId: '',
      startDate: '',
      endDate: '',
      search: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const exportMovements = async () => {
    try {
      toast.success('Export des mouvements lancé...')
      // TODO: Implémenter l'export réel
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      toast.error('Erreur lors de l\'export')
    }
  }

  const handleMovementSuccess = async () => {
    setShowNewMovementModal(false)
    await fetchMovements()
    toast.success('Mouvement créé avec succès!')
  }

  const createMovement = async (movementData: any) => {
    try {
      // Simuler la création d'un mouvement
      await apiClient.patch('/inventory/stock', {
        productId: movementData.productId,
        variantId: movementData.variantId,
        newStock: movementData.newStock,
        reason: movementData.reason
      })
      
      // Le succès sera géré par handleMovementSuccess
    } catch (error: any) {
      console.error('Erreur lors de la création du mouvement:', error)
      toast.error(error.message || 'Erreur lors de la création du mouvement')
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'OUT':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      case 'ADJUSTMENT':
        return <RefreshCw className="w-5 h-5 text-blue-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'IN':
        return 'Entrée'
      case 'OUT':
        return 'Sortie'
      case 'ADJUSTMENT':
        return 'Ajustement'
      default:
        return type
    }
  }

  const getMovementTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (type) {
      case 'IN':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'OUT':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'ADJUSTMENT':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getVariantDisplay = (variant: any) => {
    if (!variant || !variant.options) return ''
    
    const options = typeof variant.options === 'string' ? JSON.parse(variant.options) : variant.options
    return Object.entries(options).map(([key, value]) => `${key}: ${value}`).join(', ')
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
              <Activity className="w-8 h-8 text-primary" />
              <span>Mouvements de Stock</span>
            </h1>
            <p className="text-gray-600">Historique détaillé des entrées et sorties de stock</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2 ${
                showFilters ? 'bg-gray-50 text-primary border-primary' : 'bg-white border-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
            <button
              onClick={exportMovements}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
            <button
              onClick={fetchMovements}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => setShowNewMovementModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau mouvement</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border rounded-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de mouvement</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="IN">Entrées</option>
                  <option value="OUT">Sorties</option>
                  <option value="ADJUSTMENT">Ajustements</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                <select
                  value={filters.productId}
                  onChange={(e) => handleFilterChange('productId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Tous les produits</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 w-full"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recherche */}
        <div className="bg-white border rounded-xl p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par produit, SKU, raison ou référence..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste des mouvements */}
        <div className="bg-white border rounded-xl">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Mouvements ({pagination.totalCount})
              </h2>
              <div className="text-sm text-gray-600">
                Page {pagination.page} sur {pagination.totalPages || 1}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock avant/après
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Chargement des mouvements...</p>
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Aucun mouvement trouvé</p>
                      {filters.search && (
                        <p className="text-sm text-gray-500 mt-1">
                          Essayez de modifier vos critères de recherche
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movement.product.name}
                          </div>
                          {movement.product.sku && (
                            <div className="text-sm text-gray-500">
                              SKU: {movement.product.sku}
                            </div>
                          )}
                          {movement.productVariant && (
                            <div className="text-xs text-blue-600 mt-1">
                              {getVariantDisplay(movement.productVariant)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getMovementIcon(movement.type)}
                          <span className={getMovementTypeBadge(movement.type)}>
                            {getMovementTypeLabel(movement.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          movement.type === 'IN' ? 'text-green-600' : 
                          movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '±'}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {movement.previousStock} → {movement.newStock}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {movement.reason || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {movement.reference || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(movement.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(movement.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Affichage de {(pagination.page - 1) * pagination.limit + 1} à{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} sur{' '}
                {pagination.totalCount} mouvements
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Précédent</span>
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour nouveau mouvement */}
      <NewMovementModal
        isOpen={showNewMovementModal}
        onClose={() => setShowNewMovementModal(false)}
        onSuccess={handleMovementSuccess}
      />
    </Sidebar>
  )
}