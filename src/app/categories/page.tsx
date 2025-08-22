'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Tag,
  Package,
  FolderTree,
  Image
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: {
    name: string
  }
  children: Category[]
  createdAt: string
  _count: {
    products: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: '',
    parentId: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories') as any
      console.log('🔍 Categories response:', response)
      
      // 🔥 FIX: Extraire le tableau de catégories de la réponse
      const categoriesArray = Array.isArray(response.categories) ? response.categories : (Array.isArray(response) ? response : [])
      console.log('🔎 Categories array is valid:', Array.isArray(categoriesArray), 'Length:', categoriesArray.length)
      
      setCategories(categoriesArray)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCategory.name.trim()) {
      toast.error('Le nom de la catégorie est requis')
      return
    }

    try {
      await apiClient.post('/categories', {
        ...newCategory,
        parentId: newCategory.parentId === 'none' ? null : newCategory.parentId || null
      })

      toast.success('Catégorie créée avec succès!')
      setShowCreateModal(false)
      setNewCategory({ name: '', description: '', image: '', parentId: '' })
      fetchCategories()
    } catch (error: any) {
      console.error('Error creating category:', error)
      toast.error(error.message || 'Erreur lors de la création de la catégorie')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return
    }

    try {
      await apiClient.delete(`/categories/${categoryId}`)
      toast.success('Catégorie supprimée avec succès!')
      fetchCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const mainCategories = filteredCategories.filter(cat => !cat.parentId)
  const subCategories = filteredCategories.filter(cat => cat.parentId)

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
            <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
            <p className="text-gray-600 mt-1">Organisez vos produits par catégories</p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle catégorie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom de la catégorie *</label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Chaussures de sport"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Catégorie parent</label>
                    <Select
                      value={newCategory.parentId}
                      onValueChange={(value) => setNewCategory(prev => ({ ...prev, parentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune (catégorie principale)</SelectItem>
                        {Array.isArray(mainCategories) && mainCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id || "default"}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de la catégorie..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">URL de l'image</label>
                  <Input
                    value={newCategory.image}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Créer la catégorie
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total catégories</p>
                    <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Tag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Catégories principales</p>
                    <p className="text-2xl font-bold text-green-600">{mainCategories.length}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FolderTree className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sous-catégories</p>
                    <p className="text-2xl font-bold text-purple-600">{subCategories.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FolderTree className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total produits</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {categories.reduce((acc, c) => acc + (c._count?.products || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Rechercher une catégorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 bg-white shadow-sm"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories Tree */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="flex items-center">
                <FolderTree className="mr-2 h-5 w-5" />
                Arbre des catégories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produits
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Main Categories */}
                    {Array.isArray(mainCategories) && mainCategories.map((category, index) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {category.image ? (
                              <div className="h-10 w-10 mr-3 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img src={category.image} alt={category.name} className="h-8 w-8 object-cover" />
                              </div>
                            ) : (
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <FolderTree className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                <FolderTree className="mr-2 h-4 w-4 text-blue-500" />
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500">{category.description?.slice(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{category.slug}</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {category._count?.products || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/categories/${category.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    
                    {/* Sub Categories */}
                    {Array.isArray(subCategories) && subCategories.map((category, index) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (mainCategories.length + index) * 0.05 }}
                        className="hover:bg-purple-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center pl-8">
                            {category.image ? (
                              <div className="h-8 w-8 mr-3 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img src={category.image} alt={category.name} className="h-6 w-6 object-cover" />
                              </div>
                            ) : (
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <Tag className="h-4 w-4 text-purple-600" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                <Tag className="mr-2 h-4 w-4 text-purple-500" />
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500">{category.description?.slice(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{category.slug}</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {category.parent?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {category._count?.products || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/categories/${category.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune catégorie trouvée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer votre première catégorie.'}
                  </p>
                  {!searchQuery && (
                    <div className="mt-6">
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Créer une catégorie
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Sidebar>
  )
}