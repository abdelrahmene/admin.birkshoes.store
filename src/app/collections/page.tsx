'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  Package,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  categoryId?: string
  category?: {
    id: string
    name: string
  }
  isActive: boolean
  createdAt: string
  _count: {
    products: number
  }
}

interface Category {
  id: string
  name: string
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [collectionToDelete, setCollectionToDelete] = useState<{id: string, name: string} | null>(null)
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    image: '',
    categoryId: '',
    isActive: true
  })

  useEffect(() => {
    fetchCollections()
    fetchCategories()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      toast.error('Erreur lors du chargement des collections')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCollection.name.trim()) {
      toast.error('Le nom de la collection est requis')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCollection)
      })

      if (response.ok) {
        toast.success('Collection créée avec succès!')
        setShowCreateModal(false)
        setNewCollection({ name: '', description: '', image: '', categoryId: '', isActive: true })
        fetchCollections()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('Erreur lors de la création de la collection')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCollection = (id: string, name: string) => {
    setCollectionToDelete({ id, name })
    setShowDeleteModal(true)
  }

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return

    try {
      const response = await fetch(`/api/collections/${collectionToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Collection supprimée avec succès!')
        fetchCollections()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      toast.error('Erreur lors de la suppression de la collection')
    } finally {
      setShowDeleteModal(false)
      setCollectionToDelete(null)
    }
  }

  const handleImageChange = (images: string[]) => {
    setNewCollection(prev => ({
      ...prev,
      image: images[0] || ''
    }))
  }

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
            <p className="text-gray-600 mt-1">Organisez vos produits en collections thématiques</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle collection
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total collections</p>
                    <p className="text-2xl font-bold">{collections.length}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Collections actives</p>
                    <p className="text-2xl font-bold text-green-600">
                      {collections.filter(c => c.isActive).length}
                    </p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total produits</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {collections.reduce((acc, c) => acc + c._count.products, 0)}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Rechercher une collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Collections Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                    {collection.image ? (
                      <img 
                        src={collection.image} 
                        alt={collection.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className={collection.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {collection.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {collection.name}
                      </h3>
                    </div>
                    
                    {collection.category && (
                      <div className="mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {collection.category.name}
                        </Badge>
                      </div>
                    )}
                    
                    {collection.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {collection._count.products} produit{collection._count.products !== 1 ? 's' : ''}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(`/collections/${collection.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(`/collections/${collection.id}/edit`, '_blank')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCollection(collection.id, collection.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredCollections.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune collection</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre première collection.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle collection
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvelle collection</h3>
            
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la collection *
                </label>
                <Input
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom de la collection"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la collection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newCollection.categoryId}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, categoryId: e.target.value }))}
                >
                  <option value="">Aucune catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image de la collection
                </label>
                <ImageUpload
                  value={newCollection.image ? [newCollection.image] : []}
                  onChange={handleImageChange}
                  maxFiles={1}
                  endpoint="collectionImage"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newCollection.isActive}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Collection active
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer la collection
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && collectionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Supprimer la collection
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer la collection{' '}
                <span className="font-medium text-gray-900">"{collectionToDelete.name}"</span> ?
                Cette action est irréversible.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setCollectionToDelete(null)
                }}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteCollection}
              >
                Supprimer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </Sidebar>
  )
}