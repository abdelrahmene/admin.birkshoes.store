'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Image,
  Type,
  Layout,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Plus,
  Trash2,
  Copy,
  Move,
  MoreVertical,
  AlertCircle,
  Check,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface SectionEditor {
  id: string
  title: string
  type: string
  content: any
  isVisible: boolean
  order: number
}

const SectionEditorPage = () => {
  const [section, setSection] = useState<SectionEditor | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop')
  const [activeEditor, setActiveEditor] = useState('content')
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'hero',
    content: {},
    isVisible: true
  })

  const previewModes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  const editorTabs = [
    { id: 'content', label: 'Contenu', icon: Type },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ]

  // Save section
  const saveSection = async () => {
    try {
      setIsLoading(true)
      
      const endpoint = section?.id 
        ? `/api/content/home-sections/${section.id}`
        : '/api/content/home-sections'
      
      const method = section?.id ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(section?.id ? 'Section mise à jour' : 'Section créée')
        setUnsavedChanges(false)
        if (!section?.id) {
          // Redirect to edit mode for new sections
          window.location.href = `/content/sections?id=${data.data.id}`
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('❌ Erreur save section:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form changes
  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setUnsavedChanges(true)
  }

  // Content Editor Components
  const HeroEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre principal
        </label>
        <input
          type="text"
          value={formData.content?.title || ''}
          onChange={(e) => updateFormData('content', {
            ...formData.content,
            title: e.target.value
          })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Votre titre accrocheur"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sous-titre
        </label>
        <textarea
          value={formData.content?.subtitle || ''}
          onChange={(e) => updateFormData('content', {
            ...formData.content,
            subtitle: e.target.value
          })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Description ou sous-titre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image de fond
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={formData.content?.backgroundImage || ''}
              onChange={(e) => updateFormData('content', {
                ...formData.content,
                backgroundImage: e.target.value
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="URL de l'image ou sélectionner"
            />
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Parcourir
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bouton d'action
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={formData.content?.buttonText || ''}
            onChange={(e) => updateFormData('content', {
              ...formData.content,
              buttonText: e.target.value
            })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Texte du bouton"
          />
          <input
            type="text"
            value={formData.content?.buttonLink || ''}
            onChange={(e) => updateFormData('content', {
              ...formData.content,
              buttonLink: e.target.value
            })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Lien du bouton"
          />
        </div>
      </div>
    </div>
  )

  const CategoriesEditor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Catégories affichées</h3>
        <button className="flex items-center px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </button>
      </div>

      <div className="space-y-4">
        {(formData.content?.categories || []).map((category: any, index: number) => (
          <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <input
                type="text"
                value={category.name || ''}
                onChange={(e) => {
                  const updatedCategories = [...(formData.content?.categories || [])]
                  updatedCategories[index] = { ...category, name: e.target.value }
                  updateFormData('content', {
                    ...formData.content,
                    categories: updatedCategories
                  })
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nom de la catégorie"
              />
              <input
                type="text"
                value={category.link || ''}
                onChange={(e) => {
                  const updatedCategories = [...(formData.content?.categories || [])]
                  updatedCategories[index] = { ...category, link: e.target.value }
                  updateFormData('content', {
                    ...formData.content,
                    categories: updatedCategories
                  })
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Lien vers la catégorie"
              />
            </div>
            <button 
              onClick={() => {
                const updatedCategories = (formData.content?.categories || []).filter((_: any, i: number) => i !== index)
                updateFormData('content', {
                  ...formData.content,
                  categories: updatedCategories
                })
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const CollectionEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Collection sélectionnée
        </label>
        <select
          value={formData.content?.collectionId || ''}
          onChange={(e) => updateFormData('content', {
            ...formData.content,
            collectionId: e.target.value
          })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Sélectionner une collection</option>
          <option value="featured">Collection en vedette</option>
          <option value="summer">Collection été</option>
          <option value="new">Nouveautés</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de la section
        </label>
        <input
          type="text"
          value={formData.content?.sectionTitle || ''}
          onChange={(e) => updateFormData('content', {
            ...formData.content,
            sectionTitle: e.target.value
          })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Titre de la section collection"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.content?.description || ''}
          onChange={(e) => updateFormData('content', {
            ...formData.content,
            description: e.target.value
          })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Description de la collection"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de produits à afficher
        </label>
        <input
          type="number"
          value={formData.content?.productsCount || 8}
          onChange={(e) => updateFormData('content', {
            ...formData.content,
            productsCount: parseInt(e.target.value)
          })}
          min="4"
          max="16"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  )

  // Design Editor
  const DesignEditor = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Couleurs</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de fond
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.content?.backgroundColor || '#ffffff'}
                onChange={(e) => updateFormData('content', {
                  ...formData.content,
                  backgroundColor: e.target.value
                })}
                className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.content?.backgroundColor || '#ffffff'}
                onChange={(e) => updateFormData('content', {
                  ...formData.content,
                  backgroundColor: e.target.value
                })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur du texte
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.content?.textColor || '#000000'}
                onChange={(e) => updateFormData('content', {
                  ...formData.content,
                  textColor: e.target.value
                })}
                className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.content?.textColor || '#000000'}
                onChange={(e) => updateFormData('content', {
                  ...formData.content,
                  textColor: e.target.value
                })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Espacement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding vertical
            </label>
            <select
              value={formData.content?.paddingY || 'normal'}
              onChange={(e) => updateFormData('content', {
                ...formData.content,
                paddingY: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="small">Petit (20px)</option>
              <option value="normal">Normal (40px)</option>
              <option value="large">Grand (80px)</option>
              <option value="extra-large">Très grand (120px)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding horizontal
            </label>
            <select
              value={formData.content?.paddingX || 'normal'}
              onChange={(e) => updateFormData('content', {
                ...formData.content,
                paddingX: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="small">Petit (16px)</option>
              <option value="normal">Normal (24px)</option>
              <option value="large">Grand (48px)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Animation</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.content?.enableAnimation || false}
              onChange={(e) => updateFormData('content', {
                ...formData.content,
                enableAnimation: e.target.checked
              })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label className="text-sm font-medium text-gray-700">
              Activer les animations
            </label>
          </div>

          {formData.content?.enableAnimation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'animation
              </label>
              <select
                value={formData.content?.animationType || 'fadeIn'}
                onChange={(e) => updateFormData('content', {
                  ...formData.content,
                  animationType: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="fadeIn">Apparition en fondu</option>
                <option value="slideUp">Glissement vers le haut</option>
                <option value="slideLeft">Glissement vers la gauche</option>
                <option value="scale">Zoom progressif</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Settings Editor
  const SettingsEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de la section
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Nom interne de la section"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description interne
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Description pour l'administration"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de section
        </label>
        <select
          value={formData.type}
          onChange={(e) => updateFormData('type', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="hero">Hero Banner</option>
          <option value="categories">Catégories</option>
          <option value="collection">Collection</option>
          <option value="new-products">Nouveaux Produits</option>
          <option value="advantages">Avantages</option>
        </select>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={formData.isVisible}
          onChange={(e) => updateFormData('isVisible', e.target.checked)}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label className="text-sm font-medium text-gray-700">
          Section visible sur le site
        </label>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Conseils d'utilisation</h4>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Donnez un nom descriptif à votre section</li>
              <li>• La description aide à identifier rapidement la section</li>
              <li>• Désactivez temporairement sans supprimer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // Render content editor based on type
  const renderContentEditor = () => {
    switch (formData.type) {
      case 'hero':
        return <HeroEditor />
      case 'categories':
        return <CategoriesEditor />
      case 'collection':
        return <CollectionEditor />
      default:
        return (
          <div className="text-center py-12">
            <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Éditeur en développement</h3>
            <p className="text-gray-600">L'éditeur pour ce type de section sera bientôt disponible</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/content"
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {section?.id ? 'Éditer la section' : 'Nouvelle section'}
              </h1>
              <p className="text-sm text-gray-600">
                {formData.title || 'Section sans nom'}
              </p>
            </div>
            {unsavedChanges && (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Modifications non sauvegardées</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Preview Mode Selector */}
            <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-lg">
              {previewModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setPreviewMode(mode.id)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    previewMode === mode.id
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </button>
              ))}
            </div>

            <button className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4 mr-2" />
              Prévisualiser
            </button>

            <button 
              onClick={saveSection}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Editor Panel */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          {/* Editor Tabs */}
          <div className="border-b border-gray-200 px-6 py-4">
            <nav className="flex space-x-8">
              {editorTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveEditor(tab.id)}
                  className={cn(
                    "flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeEditor === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Editor Content */}
          <div className="p-6">
            <motion.div
              key={activeEditor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeEditor === 'content' && renderContentEditor()}
              {activeEditor === 'design' && <DesignEditor />}
              {activeEditor === 'settings' && <SettingsEditor />}
            </motion.div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 bg-gray-100 overflow-y-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Preview Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Aperçu - {previewMode}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className={cn(
                "transition-all duration-300",
                previewMode === 'mobile' && "max-w-sm mx-auto",
                previewMode === 'tablet' && "max-w-2xl mx-auto"
              )}>
                <div className="min-h-[400px] bg-white flex items-center justify-center">
                  <div className="text-center">
                    <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aperçu de la section
                    </h3>
                    <p className="text-gray-600">
                      L'aperçu en temps réel de votre section apparaîtra ici
                    </p>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                      <h4 className="font-medium text-gray-900 mb-2">Configuration actuelle :</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Type :</strong> {formData.type}</p>
                        <p><strong>Titre :</strong> {formData.title || 'Sans titre'}</p>
                        <p><strong>Visible :</strong> {formData.isVisible ? 'Oui' : 'Non'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionEditorPage