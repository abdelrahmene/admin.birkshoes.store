'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Tag,
  Upload,
  AlertCircle,
  X,
  Check
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: {
    id: string
    name: string
  }
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentId: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategory()
    fetchAvailableCategories()
  }, [params.id])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          image: data.image || '',
          parentId: data.parentId || ''
        })
      } else if (response.status === 404) {
        toast.error('Catégorie non trouvée')
        router.push('/categories')
        return
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      toast.error('Erreur lors du chargement de la catégorie')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        // Filter out the current category and its children to prevent circular references
        const filtered = data.filter((cat: Category) => 
          cat.id !== params.id && 
          cat.parentId !== params.id
        )
        setAvailableCategories(filtered)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la catégorie est requis'
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Le nom ne peut pas dépasser 100 caractères'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La description ne peut pas dépasser 1000 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId === 'none' || !formData.parentId ? null : formData.parentId
        })
      })

      if (response.ok) {
        toast.success('Catégorie mise à jour avec succès!')
        router.push(`/categories/${params.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Erreur lors de la mise à jour de la catégorie')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/categories/${params.id}`)
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
              onClick={handleCancel}
              className="hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Tag className="h-8 w-8 mr-3 text-blue-600" />
                Modifier la catégorie
              </h1>
              <p className="text-gray-600 mt-1">
                Modifiez les informations de "{category.name}"
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
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="flex items-center text-blue-700">
                <Tag className="mr-2 h-5 w-5" />
                Informations de la catégorie
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la catégorie *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                        if (errors.name) {
                          setErrors(prev => ({ ...prev, name: '' }))
                        }
                      }}
                      placeholder="Ex: Chaussures de sport"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Parent Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie parent
                    </label>
                    <Select
                      value={formData.parentId || 'none'}
                      onValueChange={(value) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          parentId: value === 'none' ? '' : value 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune (catégorie principale)</SelectItem>
                        {availableCategories
                          .filter(cat => !cat.parentId) // Only show main categories
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, description: e.target.value }))
                      if (errors.description) {
                        setErrors(prev => ({ ...prev, description: '' }))
                      }
                    }}
                    placeholder="Description de la catégorie..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.description.length}/1000 caractères
                  </p>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'image
                  </label>
                  <div className="space-y-3">
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.image && (
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={formData.image}
                            alt="Aperçu"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycmV1cjwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
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