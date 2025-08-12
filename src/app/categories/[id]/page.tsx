'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Tag,
  Package,
  FolderTree,
  Calendar,
  Users,
  Eye,
  ExternalLink,
  Grid,
  Plus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  createdAt: string
  _count: {
    products: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  createdAt: string
  parent?: {
    id: string
    name: string
  }
  children: Category[]
  collections: Collection[]
  _count: {
    products: number
    collections: number
  }
}

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCategory()
    }
  }, [params.id])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
      } else if (response.status === 404) {
        toast.error('Catégorie non trouvée')
        router.push('/categories')
        return
      } else {
        toast.error('Erreur lors du chargement de la catégorie')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      toast.error('Erreur lors du chargement de la catégorie')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Catégorie supprimée avec succès!')
        router.push('/categories')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Erreur lors de la suppression')
    }
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

  if (!category) {
    return (
      <Sidebar>
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Catégorie non trouvée</h2>
            <p className="text-gray-600 mb-4">La catégorie que vous cherchez n'existe pas.</p>
            <Button onClick={() => router.push('/categories')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux catégories
            </Button>
          </div>
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
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/categories')}
              className="hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                {category.parentId ? (
                  <Tag className="h-8 w-8 mr-3 text-purple-600" />
                ) : (
                  <FolderTree className="h-8 w-8 mr-3 text-blue-600" />
                )}
                {category.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {category.parentId ? 'Sous-catégorie' : 'Catégorie principale'} • 
                Créée le {new Date(category.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Link href={`/categories/${category.id}/edit`}>
              <Button variant="outline" className="hover:bg-yellow-50 hover:border-yellow-300">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </motion.div>

        {/* Category Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Informations de la catégorie
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Image */}
                <div className="md:col-span-1">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTAwIDkwQzEwNS41MjMgOTAgMTEwIDg1LjUyMyAxMTAgODBDMTEwIDc0LjQ3NyAxMDUuNTIzIDcwIDEwMCA3MEM5NC40NzcgNzAgOTAgNzQuNDc3IDkwIDgwQzkwIDg1LjUyMyA5NC40NzcgOTAgMTAwIDkwWiIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik02MCAyMDBIMTQwTDEyMCAxNjBIODBMNjAgMjAwWiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Aucune image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    <p className="text-lg font-semibold text-gray-900">{category.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Slug</label>
                    <p className="text-gray-700 bg-gray-100 px-3 py-1 rounded inline-block">
                      {category.slug}
                    </p>
                  </div>

                  {category.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-700 leading-relaxed">{category.description}</p>
                    </div>
                  )}

                  {category.parent && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Catégorie parent</label>
                      <Link href={`/categories/${category.parent.id}`}>
                        <Badge variant="secondary" className="hover:bg-blue-100 cursor-pointer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {category.parent.name}
                        </Badge>
                      </Link>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Produits</label>
                      <p className="text-xl font-bold text-blue-600">{category._count.products}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Collections</label>
                      <p className="text-xl font-bold text-purple-600">{category._count.collections}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sub Categories */}
        {category.children && category.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                <CardTitle className="flex items-center text-purple-700">
                  <FolderTree className="mr-2 h-5 w-5" />
                  Sous-catégories ({category.children.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.children.map((subCategory) => (
                    <motion.div
                      key={subCategory.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{subCategory.name}</h4>
                        <Link href={`/categories/${subCategory.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      {subCategory.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {subCategory.description}
                        </p>
                      )}
                      <Badge variant="secondary">
                        {subCategory._count.products} produits
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Collections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="flex items-center text-blue-700">
                <Grid className="mr-2 h-5 w-5" />
                Collections associées ({category.collections?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {category.collections && category.collections.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.collections.map((collection, index) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Collection Image */}
                      <div className="aspect-video bg-gray-100 relative">
                        {collection.image ? (
                          <img
                            src={collection.image}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTUwIDkwQzE1NS41MjMgOTAgMTYwIDg1LjUyMyAxNjAgODBDMTYwIDc0LjQ3NyAxNTUuNTIzIDcwIDE1MCA3MEMxNDQuNDc3IDcwIDE0MCA3NC40NzcgMTQwIDgwQzE0MCA4NS41MjMgMTQ0LjQ3NyA5MCAxNTAgOTBaIiBmaWxsPSIjOUNBM0FGIi8+PHBhdGggZD0iTTExMCAyMDBIMTkwTDE3MCA1NkgxMzBMMTEwIDIwMFoiIGZpbGw9IiM5Q0EzQUYiLz48L3N2Zz4=';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Grid className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        {!collection.isActive && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-gray-500 text-white">
                              Inactive
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Collection Info */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {collection.name}
                          </h4>
                          <Link href={`/collections/${collection.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                        
                        {collection.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {collection.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {collection._count.products} produits
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(collection.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <Grid className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune collection associée
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Cette catégorie n'a pas encore de collections associées.
                  </p>
                  <Link href="/collections/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une collection
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Sidebar>
  )
}