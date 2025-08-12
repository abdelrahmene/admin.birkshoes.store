'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
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
  createdAt: string
  updatedAt: string
}

export default function EditCollectionPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [collection, setCollection] = useState<Collection | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    categoryId: '',
    isActive: true
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [collectionRes, categoriesRes] = await Promise.all([
        fetch(`/api/collections/${params.id}`),
        fetch('/api/categories')
      ])

      if (collectionRes.ok) {
        const collectionData = await collectionRes.json()
        setCollection(collectionData)
        setFormData({
          name: collectionData.name || '',
          description: collectionData.description || '',
          image: collectionData.image || '',
          categoryId: collectionData.categoryId || '',
          isActive: collectionData.isActive
        })
      } else if (collectionRes.status === 404) {
        toast.error('Collection non trouvée')
        router.push('/collections')
        return
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      image: images[0] || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Le nom de la collection est requis')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/collections/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Collection mise à jour avec succès!')
        router.push('/collections')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating collection:', error)
      toast.error('Erreur lors de la mise à jour de la collection')
    } finally {
      setSaving(false)
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
                Modifier la collection
              </h1>
              <p className="text-gray-600 mt-1">
                Modifier les détails de "{collection.name}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Informations de la collection</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la collection *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom de la collection"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description de la collection"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={formData.categoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      >
                        <option value="">Aucune catégorie</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Collection active
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image de la collection
                    </label>
                    <ImageUpload
                      value={formData.image ? [formData.image] : []}
                      onChange={handleImageChange}
                      maxFiles={1}
                      endpoint="collectionImage"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/collections')}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sauvegarder
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Sidebar>
  )
}