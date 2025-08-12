'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  TrendingUp,
  Calendar,
  Tag,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  DollarSign,
  BarChart3,
  Box
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface ProductVariant {
  id: string
  name: string
  sku?: string
  price?: number
  stock: number
  options: any
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  shortDesc?: string
  price: number
  comparePrice?: number
  cost?: number
  sku?: string
  barcode?: string
  trackStock: boolean
  stock: number
  lowStock: number
  weight?: number
  status: string
  isActive: boolean
  isFeatured: boolean
  seoTitle?: string
  seoDesc?: string
  categoryId?: string
  collectionId?: string
  images: string[]
  tags: string[]
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
  category?: {
    name: string
  }
  collection?: {
    name: string
  }
}

export default function ProductViewPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0])
        }
      } else {
        toast.error('Produit non trouvé')
        router.push('/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Erreur lors du chargement du produit')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Produit supprimé avec succès!')
        router.push('/products')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Erreur lors de la suppression du produit')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockStatus = (stock: number, lowStock: number) => {
    if (stock === 0) return { label: 'Rupture', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (stock <= lowStock) return { label: 'Stock faible', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { label: 'En stock', color: 'text-green-600', bgColor: 'bg-green-100' }
  }

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-gray-600">Chargement du produit...</p>
          </div>
        </div>
      </Sidebar>
    )
  }

  if (!product) {
    return (
      <Sidebar>
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Produit non trouvé</h3>
          <div className="mt-6">
            <Link href="/products">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux produits
              </Button>
            </Link>
          </div>
        </div>
      </Sidebar>
    )
  }

  const stockStatus = getStockStatus(product.stock, product.lowStock)

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600 mt-1">Détails du produit</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setSelectedImage(product.images[0])}>
              <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Voir sur le site
              </a>
            </Button>
            <Link href={`/products/${product.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeleteProduct}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Images du produit</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.images && product.images.length > 0 ? (
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={selectedImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Thumbnail Images */}
                      {product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {product.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(image)}
                              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImage === image 
                                  ? 'border-primary' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`${product.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Aucune image</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Description courte</h3>
                    <p className="text-gray-600 mt-1">{product.shortDesc || 'Aucune description courte'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Description complète</h3>
                    <div className="text-gray-600 mt-1 whitespace-pre-wrap">
                      {product.description || 'Aucune description complète'}
                    </div>
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Variantes du produit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Nom
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              SKU
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Prix
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Stock
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {product.variants.map((variant) => (
                            <tr key={variant.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">{variant.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{variant.sku || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {variant.price ? formatPrice(variant.price) : formatPrice(product.price)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{variant.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* SEO Information */}
            {(product.seoTitle || product.seoDesc) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Informations SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Titre SEO</h3>
                      <p className="text-gray-600 mt-1">{product.seoTitle || 'Aucun titre SEO'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">Description SEO</h3>
                      <p className="text-gray-600 mt-1">{product.seoDesc || 'Aucune description SEO'}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Prix</span>
                    </div>
                    <span className="font-medium">{formatPrice(product.price)}</span>
                  </div>
                  
                  {product.comparePrice && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Prix comparé</span>
                      </div>
                      <span className="font-medium line-through text-gray-500">
                        {formatPrice(product.comparePrice)}
                      </span>
                    </div>
                  )}

                  {product.cost && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-gray-600">Coût</span>
                      </div>
                      <span className="font-medium">{formatPrice(product.cost)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Box className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Stock</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-medium ${stockStatus.color}`}>{product.stock}</span>
                      <div className={`text-xs ${stockStatus.color}`}>{stockStatus.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Statut et visibilité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Statut</span>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Actif</span>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mis en avant</span>
                    <Badge variant={product.isFeatured ? "default" : "secondary"}>
                      {product.isFeatured ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Organization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Organisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Catégorie</span>
                    <span className="text-sm font-medium">
                      {product.category?.name || 'Sans catégorie'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Collection</span>
                    <span className="text-sm font-medium">
                      {product.collection?.name || 'Sans collection'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Détails techniques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">SKU</span>
                    <span className="text-sm font-medium">{product.sku || '-'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Code barre</span>
                    <span className="text-sm font-medium">{product.barcode || '-'}</span>
                  </div>
                  
                  {product.weight && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Poids</span>
                      <span className="text-sm font-medium">{product.weight} kg</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Suivi stock</span>
                    <Badge variant={product.trackStock ? "default" : "secondary"}>
                      {product.trackStock ? 'Oui' : 'Non'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seuil stock faible</span>
                    <span className="text-sm font-medium">{product.lowStock}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Timestamps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Historique</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Créé le</span>
                    <span className="text-sm font-medium">
                      {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Modifié le</span>
                    <span className="text-sm font-medium">
                      {new Date(product.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}