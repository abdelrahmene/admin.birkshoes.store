'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Settings,
  Eye,
  Plus,
  Image as ImageIcon,
  Home,
  Users,
  ShirtIcon as Shirt,
  Baby,
  Sparkles,
  BarChart3,
  Edit,
  Copy,
  Trash2,
  GripVertical,
  Monitor,
  Smartphone,
  Tablet,
  ChevronRight,
  Search,
  Filter,
  Upload,
  Save,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Calendar,
  Clock,
  Move,
  EyeOff,
  MoreVertical,
  Layers,
  Image,
  Type,
  Layout,
  Palette,
  Video,
  Link
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Sidebar } from '@/components/layout/Sidebar'
import { SectionEditor } from '@/components/content/SectionEditor'

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
  createdAt: string
}

const ContentManagementPage = () => {
  // States
  const [activeTab, setActiveTab] = useState('homepage')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [isLoading, setIsLoading] = useState(false)
  const [sections, setSections] = useState<HomeSection[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [selectedSection, setSelectedSection] = useState<HomeSection | null>(null)
  const [isEditing, setIsEditing] = useState(false)
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
    { id: 'advantages', label: 'Avantages', icon: Users, color: 'bg-indigo-500' },
    { id: 'text-content', label: 'Contenu Texte', icon: Type, color: 'bg-gray-500' },
    { id: 'video', label: 'Vidéo', icon: Video, color: 'bg-red-500' },
    { id: 'custom', label: 'Section Custom', icon: Palette, color: 'bg-pink-500' }
  ]

  // Fetch sections from API
  const fetchSections = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/content/home-sections')
      const data = await response.json()
      
      if (data.success) {
        setSections(data.data || [])
        console.log('✅ Sections chargées:', data.data?.length || 0)
      } else {
        throw new Error(data.error || 'Erreur lors du chargement')
      }
    } catch (error) {
      console.error('❌ Erreur fetch sections:', error)
      toast.error('Erreur lors du chargement des sections')
    } finally {
      setIsLoading(false)
    }
  }

  // Update section visibility
  const toggleSectionVisibility = async (sectionId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId)
      if (!section) return

      const response = await fetch(`/api/content/home-sections/${sectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isVisible: !section.isVisible
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setSections(prev => prev.map(s => 
          s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
        ))
        toast.success(`Section ${!section.isVisible ? 'activée' : 'désactivée'}`)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('❌ Erreur toggle visibility:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  // Delete section
  const deleteSection = async (sectionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return

    try {
      const response = await fetch(`/api/content/home-sections/${sectionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        setSections(prev => prev.filter(s => s.id !== sectionId))
        toast.success('Section supprimée avec succès')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('❌ Erreur delete section:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Duplicate section
  const duplicateSection = async (sectionId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId)
      if (!section) return

      const response = await fetch('/api/content/home-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${section.title} (Copie)`,
          description: section.description,
          type: section.type,
          content: section.content,
          isVisible: false
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setSections(prev => [...prev, data.data])
        toast.success('Section dupliquée avec succès')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('❌ Erreur duplicate section:', error)
      toast.error('Erreur lors de la duplication')
    }
  }

  // Create or update section
  const createOrUpdateSection = async (sectionData: any) => {
    try {
      const isUpdate = !!sectionData.id
      
      const response = await fetch(
        isUpdate ? `/api/content/home-sections/${sectionData.id}` : '/api/content/home-sections',
        {
          method: isUpdate ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sectionData),
        }
      )

      const data = await response.json()
      
      if (data.success) {
        if (isUpdate) {
          setSections(prev => prev.map(s => 
            s.id === sectionData.id ? data.data : s
          ))
          toast.success('Section mise à jour avec succès')
        } else {
          setSections(prev => [...prev, data.data])
          toast.success('Section créée avec succès')
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('❌ Erreur create/update section:', error)
      toast.error('Erreur lors de la sauvegarde de la section')
    }
  }

  // Open section editor
  const openSectionEditor = (section?: HomeSection) => {
    setEditingSection(section || null)
    setShowSectionEditor(true)
  }

  // Update sections order
  const updateSectionsOrder = async (newOrder: HomeSection[]) => {
    try {
      const response = await fetch('/api/content/home-sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: newOrder.map((section, index) => ({
            id: section.id,
            order: index + 1
          }))
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setSections(newOrder.map((section, index) => ({
          ...section,
          order: index + 1
        })))
        toast.success('Ordre des sections mis à jour')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('❌ Erreur update order:', error)
      toast.error('Erreur lors de la mise à jour de l\'ordre')
    }
  }

  // Initialize data
  useEffect(() => {
    fetchSections()
  }, [])

  // Filtered sections
  const filteredSections = useMemo(() => {
    return sections.filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           section.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'visible' && section.isVisible) ||
                           (filterType === 'hidden' && !section.isVisible) ||
                           section.type === filterType
      
      return matchesSearch && matchesFilter
    })
  }, [sections, searchQuery, filterType])

  // Stats
  const stats = useMemo(() => [
    { 
      label: 'Sections actives', 
      value: sections.filter(s => s.isVisible).length.toString(), 
      change: '+2', 
      color: 'text-green-600' 
    },
    { 
      label: 'Total sections', 
      value: sections.length.toString(), 
      change: '+1', 
      color: 'text-blue-600' 
    },
    { 
      label: 'Modifiées aujourd\'hui', 
      value: sections.filter(s => 
        new Date(s.updatedAt).toDateString() === new Date().toDateString()
      ).length.toString(), 
      change: '', 
      color: 'text-gray-600' 
    },
    { 
      label: 'Dernière modif.', 
      value: sections.length > 0 ? 'Il y a 2h' : 'Jamais', 
      change: '', 
      color: 'text-gray-600' 
    }
  ], [sections])

  const tabs = [
    { id: 'homepage', label: 'Page d\'accueil', icon: Home, count: sections.length },
    { id: 'categories', label: 'Pages catégories', icon: Shirt, count: 4 },
    { id: 'media', label: 'Médias', icon: ImageIcon, count: mediaFiles.length }
  ]

  const previewModes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  // Section Modal Component
  const SectionModal = () => (
    <AnimatePresence>
      {showSectionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowSectionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Créer une nouvelle section</h3>
            <div className="grid grid-cols-2 gap-3">
              {sectionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    // Handle section creation
                    setShowSectionModal(false)
                  }}
                  className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", type.color)}>
                    <type.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Render Homepage Tab
  const renderHomepageTab = () => (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Page d'accueil</h2>
          <p className="text-gray-600 mt-1">Gérez les sections de votre page d'accueil</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.open('/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Voir le site
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => openSectionEditor()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle section
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Toutes les sections</option>
            <option value="visible">Sections visibles</option>
            <option value="hidden">Sections masquées</option>
            {sectionTypes.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Preview modes */}
        <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
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
      </div>

      {/* Sections Reorderable List */}
      {filteredSections.length > 0 ? (
        <Reorder.Group 
          axis="y" 
          values={filteredSections} 
          onReorder={updateSectionsOrder}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredSections.map((section, index) => (
              <Reorder.Item 
                key={section.id} 
                value={section}
                className="group"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "relative bg-white border rounded-xl p-6 transition-all hover:shadow-lg",
                    section.isVisible ? "border-gray-200" : "border-gray-100 bg-gray-50"
                  )}
                >
                  {/* Drag handle */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex items-start space-x-4 ml-8">
                    {/* Section Icon & Type */}
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center",
                        sectionTypes.find(t => t.id === section.type)?.color || 'bg-gray-500'
                      )}>
                        {React.createElement(
                          sectionTypes.find(t => t.id === section.type)?.icon || Layout,
                          { className: "w-8 h-8 text-white" }
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className={cn(
                              "text-lg font-semibold",
                              section.isVisible ? "text-gray-900" : "text-gray-500"
                            )}>
                              {section.title}
                            </h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              #{section.order}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {section.description || 'Aucune description'}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full",
                            section.isVisible 
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          )}>
                            {section.isVisible ? 'Visible' : 'Masqué'}
                          </span>
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(section.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(section.updatedAt).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="flex items-center">
                          <Type className="w-3 h-3 mr-1" />
                          {sectionTypes.find(t => t.id === section.type)?.label || section.type}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleSectionVisibility(section.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          section.isVisible 
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-400 hover:bg-gray-50"
                        )}
                      >
                        {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      
                      <button 
                        onClick={() => openSectionEditor(section)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => duplicateSection(section.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => deleteSection(section.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => openSectionEditor()}
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Créer votre première section</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Commencez à construire votre page d'accueil en ajoutant des sections interactives
          </p>
        </motion.div>
      )}
    </div>
  )

  // Categories Tab
  const renderCategoriesTab = () => {
    const categoryPages = [
      { 
        id: 'men', 
        label: 'Homme', 
        icon: Users, 
        configured: true, 
        lastModified: '2024-01-15',
        products: 45,
        status: 'active'
      },
      { 
        id: 'women', 
        label: 'Femme', 
        icon: Shirt, 
        configured: true, 
        lastModified: '2024-01-14',
        products: 67,
        status: 'active'
      },
      { 
        id: 'kids', 
        label: 'Enfant', 
        icon: Baby, 
        configured: false, 
        lastModified: null,
        products: 23,
        status: 'draft'
      },
      { 
        id: 'new', 
        label: 'Nouveautés', 
        icon: Sparkles, 
        configured: true, 
        lastModified: '2024-01-13',
        products: 12,
        status: 'active'
      }
    ]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pages catégories</h2>
            <p className="text-gray-600 mt-1">Personnalisez le contenu de vos pages catégories</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle page
          </button>
        </div>

        {/* Category pages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryPages.map((page) => (
            <motion.div 
              key={page.id} 
              className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <page.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{page.label}</h3>
                    <p className="text-sm text-gray-500">{page.products} produits</p>
                  </div>
                </div>
                
                <div className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  page.configured 
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}>
                  {page.configured ? 'Configuré' : 'Brouillon'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Dernière modification</span>
                  <span className="font-medium text-gray-900">
                    {page.lastModified 
                      ? new Date(page.lastModified).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Statut</span>
                  <span className={cn(
                    "font-medium",
                    page.status === 'active' ? "text-green-600" : "text-yellow-600"
                  )}>
                    {page.status === 'active' ? 'Active' : 'Brouillon'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button className="flex items-center text-primary hover:text-primary/80 transition-colors">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Media Tab
  const renderMediaTab = () => {
    const handleFileUpload = async (files: FileList) => {
      // Handle file upload logic
      toast.success('Fichiers uploadés avec succès')
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des médias</h2>
            <p className="text-gray-600 mt-1">Gérez vos images et fichiers multimédias</p>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Uploader des fichiers
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Glissez-déposez vos fichiers ici</h3>
          <p className="text-gray-600 mb-4">ou cliquez pour sélectionner des fichiers</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4 jusqu'à 10MB</p>
        </div>

        {/* Search and filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher dans les médias..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="all">Tous les types</option>
            <option value="images">Images</option>
            <option value="videos">Vidéos</option>
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="recent">Plus récents</option>
            <option value="name">Nom</option>
            <option value="size">Taille</option>
          </select>
        </div>

        {/* Media grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <motion.div 
              key={index} 
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-all relative"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-primary/60" />
              </div>
              
              {/* Overlay avec actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-50">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-50">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm">
                <p className="text-xs font-medium text-gray-900 truncate">image_{index + 1}.jpg</p>
                <p className="text-xs text-gray-500">2.4 MB</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center">
          <button className="px-6 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Charger plus de fichiers
          </button>
        </div>
      </div>
    )
  }

  return (
    <Sidebar>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de Contenu</h1>
          <p className="text-gray-600 mt-2">Créez et gérez le contenu de votre site web</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchSections}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualiser
          </button>
          <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder tout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div 
            key={stat.label} 
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              {stat.change && (
                <span className={cn("text-sm font-medium px-2 py-1 rounded-full", stat.color)}>
                  {stat.change}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <tab.icon className={cn(
                "mr-2 w-5 h-5",
                activeTab === tab.id ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
              )} />
              {tab.label}
              <span className={cn(
                "ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-gray-500"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
      >
        {activeTab === 'homepage' && renderHomepageTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'media' && renderMediaTab()}
      </motion.div>

      {/* Modals */}
      <SectionModal />
      
      {/* Section Editor */}
      <SectionEditor
        section={editingSection}
        isOpen={showSectionEditor}
        onClose={() => {
          setShowSectionEditor(false)
          setEditingSection(null)
        }}
        onSave={createOrUpdateSection}
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="bg-white rounded-xl p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                <span className="font-medium">Chargement en cours...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </Sidebar>
  )
}

export default ContentManagementPage