'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Save,
  Eye,
  EyeOff,
  Type,
  Image as ImageIcon,
  Layout,
  Palette,
  Settings,
  Code,
  Layers,
  Sparkles,
  Link2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Move,
  Monitor,
  Smartphone,
  Tablet,
  Zap
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { toast } from 'react-hot-toast'
import { MediaSelector } from './MediaSelector'

interface HomeSection {
  id: string
  title: string
  description?: string
  type: string
  content: any
  isVisible: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt?: string
  tags?: string[]
  createdAt: string
  folder: string
}

interface SectionEditorProps {
  section: HomeSection
  onSave: (data: Partial<HomeSection>) => void
  onCancel: () => void
  mediaFiles: MediaFile[]
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onSave,
  onCancel,
  mediaFiles
}) => {
  const [localMediaFiles, setLocalMediaFiles] = useState<MediaFile[]>(mediaFiles)
  const [formData, setFormData] = useState<Partial<HomeSection>>({
    title: section.title,
    description: section.description || '',
    type: section.type,
    content: section.content || {},
    isVisible: section.isVisible
  })
  const [activeTab, setActiveTab] = useState('general')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [isDirty, setIsDirty] = useState(false)
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [selectedMediaType, setSelectedMediaType] = useState<'backgroundImage' | 'images' | null>(null)

  // Fonction pour rafraîchir la liste des médias
  const refreshMediaFiles = async () => {
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setLocalMediaFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error refreshing media files:', error)
    }
  }

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify({
      title: section.title,
      description: section.description || '',
      type: section.type,
      content: section.content || {},
      isVisible: section.isVisible
    }))
  }, [formData, section])

  const handleMediaSelect = (files: MediaFile[]) => {
    if (files.length === 0) return
    
    const file = files[0] // Pour l'instant, on prend le premier fichier
    
    if (selectedMediaType === 'backgroundImage') {
      updateContent('backgroundImage', file.url)
    } else if (selectedMediaType === 'images') {
      const existingImages = formData.content?.images || []
      updateContent('images', [...existingImages, ...files.map(f => f.url)])
    }
    
    setShowMediaSelector(false)
    setSelectedMediaType(null)
  }

  // Section Types Configuration
  const sectionTypes = {
    hero: {
      name: 'Hero Banner',
      icon: Layout,
      fields: ['title', 'subtitle', 'description', 'backgroundImage', 'ctaText', 'ctaLink']
    },
    categories: {
      name: 'Catégories',
      icon: Layers,
      fields: ['title', 'description', 'displayType', 'categoryIds']
    },
    collection: {
      name: 'Collection',
      icon: ImageIcon,
      fields: ['title', 'description', 'collectionId', 'productCount', 'viewType']
    },
    'new-products': {
      name: 'Nouveaux Produits',
      icon: Sparkles,
      fields: ['title', 'description', 'productCount', 'sortBy']
    },
    featured: {
      name: 'Mis en Avant',
      icon: Zap,
      fields: ['title', 'description', 'productIds', 'displayType']
    }
  }

  const currentType = sectionTypes[section.type as keyof typeof sectionTypes]

  const handleSave = () => {
    onSave(formData)
  }

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications non sauvegardées seront perdues.')) {
        onCancel()
      }
    } else {
      onCancel()
    }
  }

  const updateContent = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'content', label: 'Contenu', icon: Type },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'advanced', label: 'Avancé', icon: Code }
  ]

  const previewModes = [
    { id: 'desktop', icon: Monitor, label: 'Bureau' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentType && (
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <currentType.icon className="w-6 h-6" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">Éditer la section</h2>
                <p className="text-blue-100 mt-1">{currentType?.name || section.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Preview Mode Selector */}
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg p-1">
                {previewModes.map((mode) => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setPreviewMode(mode.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                        previewMode === mode.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-white hover:bg-white hover:bg-opacity-10'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {mode.label}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={handleCancel}
                className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Configuration */}
          <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex-1 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-white'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Titre de la section
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Titre de la section..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Description de la section..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isVisible}
                        onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Section visible sur le site
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  {section.type === 'hero' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Titre principal
                        </label>
                        <input
                          type="text"
                          value={formData.content?.title || ''}
                          onChange={(e) => updateContent('title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Titre principal du hero..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Sous-titre
                        </label>
                        <input
                          type="text"
                          value={formData.content?.subtitle || ''}
                          onChange={(e) => updateContent('subtitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Sous-titre..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Texte du bouton
                        </label>
                        <input
                          type="text"
                          value={formData.content?.ctaText || ''}
                          onChange={(e) => updateContent('ctaText', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Voir la collection"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Lien du bouton
                        </label>
                        <input
                          type="url"
                          value={formData.content?.ctaLink || ''}
                          onChange={(e) => updateContent('ctaLink', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="/collections/nouvelle-collection"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Image de fond
                        </label>
                        <div className="border border-gray-300 rounded-lg p-4">
                          {formData.content?.backgroundImage ? (
                            <div className="relative">
                              <img
                                src={formData.content.backgroundImage}
                                alt="Background"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedMediaType('backgroundImage')
                                    setShowMediaSelector(true)
                                  }}
                                  className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600"
                                  title="Changer l'image"
                                >
                                  <ImageIcon className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => updateContent('backgroundImage', '')}
                                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                  title="Supprimer l'image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm mb-3">Aucune image sélectionnée</p>
                              <button
                                onClick={() => {
                                  setSelectedMediaType('backgroundImage')
                                  setShowMediaSelector(true)
                                }}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                <ImageIcon className="w-4 h-4" />
                                Choisir une image
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {section.type === 'categories' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Type d'affichage
                        </label>
                        <select
                          value={formData.content?.displayType || 'grid'}
                          onChange={(e) => updateContent('displayType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="grid">Grille</option>
                          <option value="carousel">Carrousel</option>
                          <option value="list">Liste</option>
                        </select>
                      </div>
                    </>
                  )}

                  {section.type === 'collection' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Nombre de produits à afficher
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={formData.content?.productCount || 6}
                          onChange={(e) => updateContent('productCount', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Type de vue
                        </label>
                        <select
                          value={formData.content?.viewType || 'grid'}
                          onChange={(e) => updateContent('viewType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="grid">Grille</option>
                          <option value="masonry">Mosaïque</option>
                          <option value="carousel">Carrousel</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Couleur de fond
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.content?.backgroundColor || '#ffffff'}
                        onChange={(e) => updateContent('backgroundColor', e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.content?.backgroundColor || '#ffffff'}
                        onChange={(e) => updateContent('backgroundColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Espacement (padding)
                    </label>
                    <select
                      value={formData.content?.padding || 'medium'}
                      onChange={(e) => updateContent('padding', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="none">Aucun</option>
                      <option value="small">Petit</option>
                      <option value="medium">Moyen</option>
                      <option value="large">Grand</option>
                      <option value="xl">Très grand</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Alignement du texte
                    </label>
                    <select
                      value={formData.content?.textAlign || 'center'}
                      onChange={(e) => updateContent('textAlign', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      CSS personnalisé
                    </label>
                    <textarea
                      value={formData.content?.customCss || ''}
                      onChange={(e) => updateContent('customCss', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                      placeholder={`.section {
  background: linear-gradient(...);
  border-radius: 12px;
}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Classes CSS additionnelles
                    </label>
                    <input
                      type="text"
                      value={formData.content?.cssClasses || ''}
                      onChange={(e) => updateContent('cssClasses', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="shadow-xl border-2 border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {isDirty ? (
                    <>
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      Modifications non sauvegardées
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Sauvegardé
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Aperçu temps réel</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  Mode {previewMode}
                </div>
              </div>
              
              <div className={cn(
                'mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300',
                previewMode === 'desktop' && 'w-full',
                previewMode === 'tablet' && 'w-2/3',
                previewMode === 'mobile' && 'w-80'
              )}>
                {/* Section Preview */}
                <div 
                  className="min-h-[400px] p-8"
                  style={{ 
                    backgroundColor: formData.content?.backgroundColor || '#ffffff',
                    textAlign: formData.content?.textAlign || 'center'
                  }}
                >
                  {section.type === 'hero' && (
                    <div className="text-center">
                      {formData.content?.title && (
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                          {formData.content.title}
                        </h1>
                      )}
                      {formData.content?.subtitle && (
                        <p className="text-xl text-gray-600 mb-8">
                          {formData.content.subtitle}
                        </p>
                      )}
                      {formData.content?.ctaText && (
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          {formData.content.ctaText}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {section.type !== 'hero' && (
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {formData.title}
                      </h2>
                      {formData.description && (
                        <p className="text-gray-600 mb-8">
                          {formData.description}
                        </p>
                      )}
                      <div className="bg-gray-100 rounded-lg p-8">
                        <p className="text-gray-500">
                          Aperçu du contenu de la section "{currentType?.name}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Media Selector Modal */}
      <MediaSelector
        isOpen={showMediaSelector}
        onClose={() => {
          setShowMediaSelector(false)
          setSelectedMediaType(null)
        }}
        onSelect={handleMediaSelect}
        multiple={false}
        mediaFiles={localMediaFiles}
        onRefresh={refreshMediaFiles}
      />
    </motion.div>
  )
}

export { SectionEditor }