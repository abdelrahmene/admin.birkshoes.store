'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Eye, Upload, X, Plus, Trash2, Edit, Package } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import ImageUpload from '@/components/ui/ImageUpload'

interface Category {
  id: string
  name: string
}

interface Collection {
  id: string
  name: string
}

interface ProductVariant {
  id?: string
  name: string
  sku?: string
  price?: number
  stock: number
  options: { [key: string]: string }
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    price: '',
    comparePrice: '',
    cost: '',
    sku: '',
    barcode: '',
    trackStock: true,
    stock: '0',
    lowStock: '5',
    weight: '',
    status: 'DRAFT',
    isActive: false,
    isFeatured: false,
    seoTitle: '',
    seoDesc: '',
    categoryId: '',
    collectionId: '',
    images: [] as string[],
    tags: [] as string[],
    hasVariants: false,
    variants: [] as ProductVariant[]
  })
  
  const [tagInput, setTagInput] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [variantOptions, setVariantOptions] = useState<string[]>(['Taille', 'Couleur'])
  const [newVariantOption, setNewVariantOption] = useState('')
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchCollections()
  }, [])

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

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url]
        }))
        toast.success('Image uploadée avec succès!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }))
  }

  // Variant management functions
  const addVariantOption = () => {
    if (newVariantOption.trim() && !variantOptions.includes(newVariantOption.trim())) {
      setVariantOptions(prev => [...prev, newVariantOption.trim()])
      setNewVariantOption('')
    }
  }

  const removeVariantOption = (option: string) => {
    setVariantOptions(prev => prev.filter(opt => opt !== option))
  }

  const generateVariantName = (options: { [key: string]: string }) => {
    return Object.entries(options)
      .filter(([_, value]) => value.trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  }

  const saveVariant = (variantData: {
    name: string
    sku?: string
    price?: number
    stock: number
    options: { [key: string]: string }
  }) => {
    if (editingVariant) {
      // Update existing variant
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(v => 
          v === editingVariant ? { ...variantData, id: editingVariant.id } : v
        )
      }))
    } else {
      // Add new variant
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...variantData, id: Date.now().toString() }]
      }))
    }
    setShowVariantModal(false)
    setEditingVariant(null)
  }

  const deleteVariant = (variant: ProductVariant) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v !== variant)
    }))
  }

  const editVariant = (variant: ProductVariant) => {
    setEditingVariant(variant)
    setShowVariantModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price) {
      toast.error('Nom et prix sont requis')
      return
    }

    // Calculer automatiquement le stock si le produit a des variantes
    const submitData = { ...formData }
    if (formData.hasVariants && formData.variants.length > 0) {
      // Le stock est calculé côté serveur - on s'assure juste que les variantes sont envoyées
      const totalStock = formData.variants.reduce(
        (sum, variant) => sum + (parseInt(variant.stock?.toString() || '0') || 0), 0
      )
      submitData.stock = totalStock.toString() // Pour affichage uniquement
      console.log(`🎆 Nouveau produit: Stock calculé automatiquement: ${totalStock} unités depuis ${formData.variants.length} variantes`)
    } else {
      console.log(`📦 Nouveau produit: Stock manuel: ${submitData.stock} unités`)
    }

    setLoading(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        toast.success('Produit créé avec succès!')
        router.push('/products')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Erreur lors de la création du produit')
    } finally {
      setLoading(false)
    }
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
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nouveau produit</h1>
              <p className="text-gray-600 mt-1">Créez un nouveau produit pour votre catalogue</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Aperçu
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-24"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du produit *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nom du produit"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug URL
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="slug-du-produit"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description courte
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={2}
                      value={formData.shortDesc}
                      onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                      placeholder="Description courte pour les listes de produits"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description complète
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={6}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Description détaillée du produit"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Prix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix de vente * (DZD)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix comparé (DZD)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.comparePrice}
                        onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix d'achat (DZD)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => handleInputChange('cost', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Inventory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Inventaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <Input
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="SKU-001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code barre
                      </label>
                      <Input
                        value={formData.barcode}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="trackStock"
                      checked={formData.trackStock}
                      onChange={(e) => handleInputChange('trackStock', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="trackStock" className="text-sm font-medium text-gray-700">
                      Suivre le stock
                    </label>
                  </div>

                  {formData.trackStock && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {!formData.hasVariants ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock actuel
                          </label>
                          <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => handleInputChange('stock', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock total (calculé automatiquement)
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Auto
                            </span>
                          </label>
                          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-gray-900 font-medium">
                            {formData.variants.reduce((sum, variant) => sum + (parseInt(variant.stock?.toString() || '0') || 0), 0)} unités
                            <div className="text-xs text-gray-500 mt-1">
                              Somme des {formData.variants.length} variante{formData.variants.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seuil stock faible
                        </label>
                        <Input
                          type="number"
                          value={formData.lowStock}
                          onChange={(e) => handleInputChange('lowStock', e.target.value)}
                          placeholder="5"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poids (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Variants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Variantes du produit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasVariants"
                      checked={formData.hasVariants}
                      onChange={(e) => {
                        handleInputChange('hasVariants', e.target.checked)
                        if (!e.target.checked) {
                          handleInputChange('variants', [])
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="hasVariants" className="text-sm font-medium text-gray-700">
                      Ce produit a des variantes (tailles, couleurs, etc.)
                    </label>
                  </div>

                  {formData.hasVariants && (
                    <div className="space-y-4">
                      {/* Variant Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options de variante
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {variantOptions.map((option, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {option}
                              <button
                                type="button"
                                onClick={() => removeVariantOption(option)}
                                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            value={newVariantOption}
                            onChange={(e) => setNewVariantOption(e.target.value)}
                            placeholder="Nouvelle option (ex: Matière)"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariantOption())}
                          />
                          <Button type="button" onClick={addVariantOption} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Variants List */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Variantes du produit ({formData.variants.length})
                          </label>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setEditingVariant(null)
                              setShowVariantModal(true)
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une variante
                          </Button>
                        </div>

                        {formData.variants.length > 0 ? (
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variante</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {formData.variants.map((variant, index) => (
                                  <tr key={variant.id}>
                                    <td className="px-4 py-2 text-sm text-gray-900">{variant.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600 font-mono">{variant.sku || '-'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {variant.price ? `${variant.price} DZD` : 'Prix par défaut'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{variant.stock}</td>
                                    <td className="px-4 py-2 text-right text-sm">
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => editVariant(variant)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 hover:text-red-700"
                                          onClick={() => deleteVariant(variant)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <Package className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Aucune variante ajoutée</p>
                            <Button
                              type="button"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setEditingVariant(null)
                                setShowVariantModal(true)
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Ajouter la première variante
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* SEO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Référencement (SEO)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre SEO
                    </label>
                    <Input
                      value={formData.seoTitle}
                      onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                      placeholder="Titre optimisé pour les moteurs de recherche"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description SEO
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      value={formData.seoDesc}
                      onChange={(e) => handleInputChange('seoDesc', e.target.value)}
                      placeholder="Description pour les moteurs de recherche"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Product Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Statut du produit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="DRAFT">Brouillon</option>
                      <option value="ACTIVE">Actif</option>
                      <option value="ARCHIVED">Archivé</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Produit actif
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                        Produit mis en avant
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Organisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collection
                    </label>
                    <select
                      value={formData.collectionId}
                      onChange={(e) => handleInputChange('collectionId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Sélectionner une collection</option>
                      {collections.map(collection => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Ajouter un tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Images */}
            <motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.4 }}
>
  <Card>
    <CardHeader>
      <CardTitle>Images du produit</CardTitle>
    </CardHeader>
    <CardContent>
      <ImageUpload
      images={formData.images}
      onImagesChange={(images: string[]) => handleInputChange('images', images)}
      folder="products"
      maxImages={10}
      multiple={true}
      />
    </CardContent>
  </Card>
</motion.div>
          </div>
        </form>
      </div>

      {/* Variant Modal */}
      {showVariantModal && (
        <VariantModal
          variant={editingVariant}
          variantOptions={variantOptions}
          onSave={saveVariant}
          onClose={() => {
            setShowVariantModal(false)
            setEditingVariant(null)
          }}
          generateVariantName={generateVariantName}
        />
      )}
    </Sidebar>
  )
}

// Variant Modal Component
function VariantModal({ 
  variant, 
  variantOptions, 
  onSave, 
  onClose, 
  generateVariantName 
}: {
  variant: ProductVariant | null
  variantOptions: string[]
  onSave: (data: any) => void
  onClose: () => void
  generateVariantName: (options: { [key: string]: string }) => string
}) {
  const [variantData, setVariantData] = useState({
    name: variant?.name || '',
    sku: variant?.sku || '',
    price: variant?.price?.toString() || '',
    stock: variant?.stock?.toString() || '0',
    options: variant?.options || variantOptions.reduce((acc, opt) => ({ ...acc, [opt]: '' }), {})
  })

  useEffect(() => {
    const generatedName = generateVariantName(variantData.options)
    if (generatedName !== variantData.name) {
      setVariantData(prev => ({ ...prev, name: generatedName }))
    }
  }, [variantData.options, generateVariantName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!variantData.name.trim()) {
      toast.error('Le nom de la variante est requis')
      return
    }

    onSave({
      name: variantData.name,
      sku: variantData.sku || undefined,
      price: variantData.price ? parseFloat(variantData.price) : undefined,
      stock: parseInt(variantData.stock) || 0,
      options: variantData.options
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {variant ? 'Modifier la variante' : 'Nouvelle variante'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Variant Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Options de la variante
            </label>
            {variantOptions.map(option => (
              <div key={option}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {option}
                </label>
                <Input
                  value={(variantData.options as any)[option] || ''}
                  onChange={(e) => setVariantData(prev => ({
                    ...prev,
                    options: { ...prev.options, [option]: e.target.value }
                  }))}
                  placeholder={`Valeur pour ${option.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          {/* Generated Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la variante
            </label>
            <Input
              value={variantData.name}
              onChange={(e) => setVariantData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nom de la variante"
              required
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU (optionnel)
            </label>
            <Input
              value={variantData.sku}
              onChange={(e) => setVariantData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="SKU-variante"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix (optionnel - laissez vide pour utiliser le prix par défaut)
            </label>
            <Input
              type="number"
              step="0.01"
              value={variantData.price}
              onChange={(e) => setVariantData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <Input
              type="number"
              value={variantData.stock}
              onChange={(e) => setVariantData(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="0"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit">
              {variant ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}