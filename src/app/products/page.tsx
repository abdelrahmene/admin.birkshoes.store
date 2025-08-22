'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  comparePrice?: number
  stock: number
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  images?: string[]
  category?: { name: string }
  sku?: string
  lowStock: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  // 🔥 AJOUT POUR LOGIQUE STOCK UNIFIÉE
  variants?: {
    id: string
    name: string
    stock: number
    sku?: string
  }[]
  totalStock?: number
  hasVariants?: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get<{ products: Product[], pagination: any }>('/products')
      console.log('🔍 Products fetched:', response)
        
      // 🎯 VÉRIFIER QUE LA RÉPONSE CONTIENT UN TABLEAU DE PRODUITS
      const productsArray = Array.isArray(response.products) ? response.products : []
        
      // 🎯 CALCULER LE STOCK TOTAL POUR CHAQUE PRODUIT
      const productsWithCalculatedStock = productsArray.map(product => {
        const hasVariants = product.variants && product.variants.length > 0
        const totalStock = hasVariants
        ? product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0
          : product.stock
        
        return {
          ...product,
          totalStock,
          hasVariants
        }
      })
      
      setProducts(productsWithCalculatedStock)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return
    }

    try {
      await apiClient.delete(`/products/${productId}`)
      // Remove product from local state
      setProducts(prev => prev.filter(p => p.id !== productId))
      toast.success('Produit supprimé avec succès!')
    } catch (error: any) {
      console.error('Error deleting product:', error)
      toast.error(error.message || 'Erreur lors de la suppression du produit')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || product.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockStatus = (stock: number, lowStock: number) => {
    if (stock === 0) return { label: 'Rupture', color: 'text-red-600' }
    if (stock <= lowStock) return { label: 'Stock faible', color: 'text-orange-600' }
    return { label: 'En stock', color: 'text-green-600' }
  }

  // 🔥 FONCTION POUR OBTENIR LE STOCK CORRECT (UNIFIÉ)
  const getProductStock = (product: Product) => {
    return product.totalStock !== undefined ? product.totalStock : product.stock
  }

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
            <p className="text-gray-600 mt-1">Gérez votre catalogue de produits</p>
          </div>
          <Link href="/products/new">
            <Button className="mt-4 sm:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total produits</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Produits actifs</p>
                    <p className="text-2xl font-bold text-green-600">
                      {products.filter(p => p.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stock faible</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {products.filter(p => {
                        const stock = getProductStock(p)
                        return stock <= p.lowStock && stock > 0
                      }).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rupture de stock</p>
                    <p className="text-2xl font-bold text-red-600">
                      {products.filter(p => getProductStock(p) === 0).length}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="draft">Brouillon</option>
                    <option value="archived">Archivé</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtres
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Liste des produits ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product, index) => {
                      const productStock = getProductStock(product)
                      const stockStatus = getStockStatus(productStock, product.lowStock)
                      
                      return (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    className="h-12 w-12 rounded-lg object-cover"
                                    src={product.images[0]}
                                    alt={product.name}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.category?.name || 'Sans catégorie'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.sku || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(product.price)}
                            </div>
                            {product.comparePrice && (
                              <div className="text-sm text-gray-500 line-through">
                                {formatPrice(product.comparePrice)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${stockStatus.color}`}>
                              {productStock}
                              {product.hasVariants && (
                                <span className="text-xs text-blue-500 ml-1">({product.variants?.length}v)</span>
                              )}
                            </div>
                            <div className={`text-xs ${stockStatus.color}`}>
                              {stockStatus.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/products/${product.id}`}>
                                <Button size="sm" variant="outline" title="Voir le produit">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/products/${product.id}/edit`}>
                                <Button size="sm" variant="outline" title="Modifier le produit">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700"
                                title="Supprimer le produit"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par ajouter votre premier produit.
                    </p>
                    <div className="mt-6">
                      <Link href="/products/new">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un produit
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Sidebar>
  )
}