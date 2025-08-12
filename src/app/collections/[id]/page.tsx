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
  Package,
  Calendar,
  Tag,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images?: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  categoryId?: string
  category?: Category
  isActive: boolean
  products: Product[]
  createdAt: string
  updatedAt: string
  _count: {
    products: number
  }
}

export default function ViewCollectionPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState<Collection | null>(null)

  useEffect(() => {
    fetchCollection()
  }, [params.id])

  const fetchCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setCollection(data)
      } else if (response.status === 404) {
        toast.error('Collection non trouvée')
        router.push('/collections')
        return
      }
    } catch (error) {
      console.error('Error fetching collection:', error)
      toast.error('Erreur lors du chargement de la collection')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD'
    }).format(price)
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

  if (!collection) {
    return (
      <Sidebar>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Collection non trouvée</h3>
          <p className="text-gray-500 mt-2">Cette collection n'existe plus ou a été supprimée.</p>
          <Button 
            onClick={() => router.push('/collections')}
            className="mt-4"
          >
            Retour aux collections
          </Button>
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
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/collections')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {collection.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Prévisualisation de la collection
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={collection.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {collection.isActive ? 'Actif' : 'Inactif'}
            </Badge>
            <Button 
              onClick={() => router.push(`/collections/${collection.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Collection Details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Détails de la collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {collection.image ? (
                      <img 
                        src={collection.image} 
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nom</label>
                      <p className="text-lg font-semibold">{collection.name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Slug</label>
                      <p className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                        {collection.slug}
                      </p>
                    </div>

                    {collection.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-sm text-gray-700 mt-1">
                          {collection.description}
                        </p>
                      </div>
                    )}

                    {collection.category && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Catégorie</label>
                        <p className="text-sm text-gray-700">
                          {collection.category.name}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <div className="mt-1">
                        <Badge className={collection.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {collection.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre de produits</label>
                      <p className="text-lg font-semibold text-primary">
                        {collection._count.products}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meta Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Informations système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date de création</label>
                    <p className="text-sm text-gray-700">
                      {formatDate(collection.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dernière modification</label>
                    <p className="text-sm text-gray-700">
                      {formatDate(collection.updatedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Produits de cette collection ({collection._count.products})
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {collection.products.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {collection.products.map((product, index) => {
                        const productImages = product.images ? JSON.parse(product.images) : []
                        return (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex space-x-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                {productImages.length > 0 ? (
                                  <img 
                                    src={productImages[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                      {product.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {formatPrice(product.price)}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 ml-2">
                                    <Badge 
                                      variant={product.isActive ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {product.isActive ? 'Actif' : 'Inactif'}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => router.push(`/products/${product.id}`)}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-400 mt-1 font-mono">
                                  {product.slug}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Aucun produit
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Cette collection ne contient aucun produit pour le moment.
                      </p>
                      <div className="mt-6">
                        <Button
                          onClick={() => router.push('/products/new')}
                        >
                          Ajouter un produit
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}