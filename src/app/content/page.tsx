'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Eye,
  Plus,
  Image as ImageIcon,
  Home,
  Users,
  Sparkles,
  BarChart3,
  Edit,
  Copy,
  Trash2,
  GripVertical,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  RefreshCw,
  EyeOff,
  Layers,
  Image,
  Type,
  Layout,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { Sidebar } from '@/components/layout/Sidebar'
import SectionEditor from '@/components/content/SectionEditor'
import { apiClient } from '@/services/api'

// Types
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
}

const ContentManagementPage = () => {
  // States
  const [activeTab, setActiveTab] = useState('homepage')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [isLoading, setIsLoading] = useState(false)
  const [sections, setSections] = useState<HomeSection[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null)
  const [showSectionEditor, setShowSectionEditor] = useState(false)

  // Section Types Available
  const sectionTypes = [
    { id: 'hero', label: 'Hero Banner', icon: Layout, color: 'bg-blue-500' },
    { id: 'categories', label: 'Catégories', icon: Layers, color: 'bg-purple-500' },
    { id: 'collection', label: 'Collection', icon: Image, color: 'bg-green-500' },
    { id: 'new-products', label: 'Nouveaux Produits', icon: Sparkles, color: 'bg-yellow-500' },
    { id: 'featured', label: 'Mis en Avant', icon: BarChart3, color: 'bg-red-500' },
    { id: 'testimonials', label: 'Témoignages', icon: Users, color: 'bg-indigo-500' },
    { id: 'newsletter', label: 'Newsletter', icon: Type, color: 'bg-pink-500' },
    { id: 'video', label: 'Vidéo', icon: Video, color: 'bg-orange-500' }
  ]

  // Fetch data from API
  const fetchSections = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/content/home-sections/all')
      
      if (Array.isArray(response)) {
        setSections(response)
      } else if (response && Array.isArray(response.data)) {
        setSections(response.data)
      } else {
        setSections([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sections:', error)
      toast.error('Erreur lors du chargement des sections')
      setSections([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMediaFiles = async () => {
    try {
      const response = await apiClient.get('/media')
      
      if (response && response.files) {
        setMediaFiles(response.files)
      } else if (Array.isArray(response)) {
        setMediaFiles(response)
      } else {
        setMediaFiles([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error)
      setMediaFiles([])
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchSections()
    fetchMediaFiles()
  }, [])

  // Filtered sections based on search and type
  const filteredSections = useMemo(() => {
    return sections.filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          section.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || section.type === filterType
      return matchesSearch && matchesType
    })
  }, [sections, searchQuery, filterType])

  // Handle section reordering
  const handleReorder = async (reorderedSections: HomeSection[]) => {
    setSections(reorderedSections)
    
    try {
      const sectionIds = reorderedSections.map(section => section.id)
      await apiClient.patch('/content/home-sections/reorder', { sectionIds })
      toast.success('Ordre des sections mis à jour')
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error)
      toast.error('Erreur lors de la réorganisation des sections')
      fetchSections()
    }
  }

  // Toggle section visibility
  const toggleSectionVisibility = async (sectionId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId)
      if (!section) return

      await apiClient.put(`/content/home-sections/${sectionId}`, {
        ...section,
        isVisible: !section.isVisible
      })

      setSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { ...s, isVisible: !s.isVisible }
          : s
      ))
      
      toast.success(`Section ${!section.isVisible ? 'affichée' : 'masquée'}`)
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error)
      toast.error('Erreur lors du changement de visibilité')
    }
  }

  // Delete section
  const deleteSection = async (sectionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return

    try {
      await apiClient.delete(`/content/home-sections/${sectionId}`)
      setSections(prev => prev.filter(s => s.id !== sectionId))
      toast.success('Section supprimée')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression de la section')
    }
  }

  // Duplicate section
  const duplicateSection = async (sectionId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId)
      if (!section) return

      const response = await apiClient.post('/content/home-sections', {
        ...section,
        id: undefined,
        title: `${section.title} (Copie)`,
        order: sections.length + 1
      })

      setSections(prev => [...prev, response.data])
      toast.success('Section dupliquée')
    } catch (error) {
      console.error('Erreur lors de la duplication:', error)
      toast.error('Erreur lors de la duplication de la section')
    }
  }

  // Create new section
  const createSection = async (type: string) => {
    try {
      const sectionType = sectionTypes.find(t => t.id === type)
      
      const response = await apiClient.post('/content/home-sections', {
        title: `Nouvelle section ${sectionType?.label || type}`,
        type,
        content: {},
        isVisible: true,
        order: sections.length + 1
      })

      setSections(prev => [...prev, response.data])
      setShowSectionModal(false)
      toast.success('Section créée')
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error('Erreur lors de la création de la section')
    }
  }

  // Save section changes
  const saveSection = async (sectionData: Partial<HomeSection>) => {
    if (!editingSection) return

    try {
      const response = await apiClient.put(`/content/home-sections/${editingSection.id}`, sectionData)
      
      setSections(prev => prev.map(s => 
        s.id === editingSection.id 
          ? { ...s, ...response.data }
          : s
      ))
      
      setEditingSection(null)
      setShowSectionEditor(false)
      toast.success('Section mise à jour')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  // Preview modes
  const previewModes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  return (
    <Sidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion du Contenu</h1>
              <p className="text-gray-600 mt-1">Gérez les sections et le contenu de votre site</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Preview Mode Selector */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
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
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {mode.label}
                    </button>
                  )
                })}
              </div>
              
              {/* Actions */}
              <button
                onClick={() => setShowSectionModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter Section
              </button>
              
              <button
                onClick={fetchSections}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                Actualiser
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'homepage', label: 'Page d\'accueil', icon: Home },
                  { id: 'categories', label: 'Catégories', icon: Layers },
                  { id: 'media', label: 'Médiathèque', icon: ImageIcon }
                ].map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'homepage' && (
              <div className="p-6">
                {/* Search and Filters */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher des sections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Tous les types</option>
                      {sectionTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {filteredSections.length} section{filteredSections.length > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Sections List */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <Reorder.Group values={filteredSections} onReorder={handleReorder}>
                    <div className="space-y-4">
                      {filteredSections.map((section) => {
                        const sectionType = sectionTypes.find(t => t.id === section.type)
                        const Icon = sectionType?.icon || Layout
                        
                        return (
                          <Reorder.Item
                            key={section.id}
                            value={section}
                            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                          >
                            <div className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                                  
                                  <div className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center',
                                    sectionType?.color || 'bg-gray-500'
                                  )}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                                    <p className="text-sm text-gray-600">
                                      {sectionType?.label || section.type} • 
                                      Ordre: {section.order} • 
                                      {section.isVisible ? 'Visible' : 'Masqué'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleSectionVisibility(section.id)}
                                    className={cn(
                                      'p-2 rounded-lg transition-colors',
                                      section.isVisible 
                                        ? 'text-blue-600 hover:bg-blue-50' 
                                        : 'text-gray-400 hover:bg-gray-50'
                                    )}
                                    title={section.isVisible ? 'Masquer' : 'Afficher'}
                                  >
                                    {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setEditingSection(section)
                                      setShowSectionEditor(true)
                                    }}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  
                                  <button
                                    onClick={() => duplicateSection(section.id)}
                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Dupliquer"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  
                                  <button
                                    onClick={() => deleteSection(section.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Reorder.Item>
                        )
                      })}
                    </div>
                  </Reorder.Group>
                )}

                {filteredSections.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune section trouvée</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery || filterType !== 'all' 
                        ? 'Essayez de modifier vos critères de recherche'
                        : 'Commencez par créer votre première section'
                      }
                    </p>
                    {!searchQuery && filterType === 'all' && (
                      <button
                        onClick={() => setShowSectionModal(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Créer une section
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Médiathèque</h3>
                  <p className="text-gray-600 mb-6">Gérez vos images, vidéos et documents</p>
                  <a
                    href="/content/mediatheque"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Ouvrir la médiathèque
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Type Modal */}
        <AnimatePresence>
          {showSectionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowSectionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Choisir un type de section</h2>
                  <p className="text-gray-600 mt-1">Sélectionnez le type de section que vous souhaitez ajouter</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {sectionTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => createSection(type.id)}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                        >
                          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', type.color)}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{type.label}</h3>
                            <p className="text-sm text-gray-600">Section {type.label.toLowerCase()}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Editor Modal */}
        {showSectionEditor && editingSection && (
          <SectionEditor
            section={editingSection}
            isOpen={showSectionEditor}
            onClose={() => {
              setShowSectionEditor(false)
              setEditingSection(null)
            }}
            onSave={saveSection}
          />
        )}
      </div>
    </Sidebar>
  )
}

export default ContentManagementPage
