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

// Types
interface StockMovement {
  id: string
  productId: string
  productName: string
  productSku: string | null
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string | null
  reference: string | null
  createdAt: string
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
    fetchMovements()
  }, [pagination.page, filters])

  const fetchMovements = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (filters.type !== 'all') queryParams.append('type', filters.type)
      if (filters.productId) queryParams.append('productId', filters.productId)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)

      const response = await fetch(`/api/inventory/movements?${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        setMovements(data.movements)
        setPagination(prev => ({
          ...prev,
          totalCount: data.pagination.totalCount,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error)
    } finally {
      setLoading(false)
    }
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
      const queryParams = new URLSearchParams()
      if (filters.type !== 'all') queryParams.append('type', filters.type)
      if (filters.productId) queryParams.append('productId', filters.productId)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      queryParams.append('export', 'true')

      const response = await fetch(`/api/inventory/movements/export?${queryParams}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mouvements-stock-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
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

  // Filtrer les mouvements côté client pour la recherche
  const filteredMovements = movements.filter(movement => {
    if (!filters.search) return true
    const searchLower = filters.search.toLowerCase()
    return (
      movement.productName.toLowerCase().includes(searchLower) ||
      (movement.productSku && movement.productSku.toLowerCase().includes(searchLower)) ||
      (movement.reason && movement.reason.toLowerCase().includes(searchLower)) ||
      (movement.reference && movement.reference.toLowerCase().includes(searchLower))
    )
  })

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
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
                Page {pagination.page} sur {pagination.totalPages}
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
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Chargement des mouvements...</p>
                    </td>
                  </tr>
                ) : filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Aucun mouvement trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movement.productName}
                          </div>
                          {movement.productSku && (
                            <div className="text-sm text-gray-500">
                              SKU: {movement.productSku}
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
        onSuccess={fetchMovements}
      />
    </Sidebar>
  )
}