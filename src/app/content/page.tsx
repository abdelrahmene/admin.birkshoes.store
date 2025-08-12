'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ContentManagementPage = () => {
  const [activeTab, setActiveTab] = useState('homepage')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'homepage', label: 'Page d\'accueil', icon: Home, count: 5 },
    { id: 'categories', label: 'Pages catégories', icon: Shirt, count: 4 },
    { id: 'media', label: 'Médias', icon: ImageIcon, count: 127 }
  ]

  const previewModes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  const stats = [
    { label: 'Sections actives', value: '5', change: '+2', color: 'text-green-600' },
    { label: 'Pages configurées', value: '4', change: '0', color: 'text-gray-600' },
    { label: 'Médias utilisés', value: '89', change: '+15', color: 'text-blue-600' },
    { label: 'Dernière modif.', value: 'Il y a 2h', change: '', color: 'text-gray-600' }
  ]

  // Mock data pour les sections homepage
  const homeSections = [
    {
      id: '1',
      type: 'hero',
      title: 'Hero Banner Principal',
      description: 'Bannière d\'accueil avec slider',
      isVisible: true,
      order: 1,
      thumbnail: '/api/placeholder/300/200',
      lastModified: '2024-01-15'
    },
    {
      id: '2', 
      type: 'categories',
      title: 'Nos Catégories',
      description: 'Affichage des catégories principales',
      isVisible: true,
      order: 2,
      thumbnail: '/api/placeholder/300/200',
      lastModified: '2024-01-14'
    },
    {
      id: '3',
      type: 'collection',
      title: 'Collection Vedette',
      description: 'Mise en avant d\'une collection',
      isVisible: true,
      order: 3,
      thumbnail: '/api/placeholder/300/200',
      lastModified: '2024-01-13'
    },
    {
      id: '4',
      type: 'advantages',
      title: 'Nos Avantages',
      description: 'Points forts de la boutique',
      isVisible: false,
      order: 4,
      thumbnail: '/api/placeholder/300/200',
      lastModified: '2024-01-12'
    },
    {
      id: '5',
      type: 'new-products',
      title: 'Nouveautés',
      description: 'Derniers produits ajoutés',
      isVisible: true,
      order: 5,
      thumbnail: '/api/placeholder/300/200',
      lastModified: '2024-01-11'
    }
  ]

  const categoryPages = [
    { id: 'men', label: 'Homme', icon: Users, configured: true, lastModified: '2024-01-15' },
    { id: 'women', label: 'Femme', icon: Shirt, configured: true, lastModified: '2024-01-14' },
    { id: 'kids', label: 'Enfant', icon: Baby, configured: false, lastModified: null },
    { id: 'new', label: 'Nouveau', icon: Sparkles, configured: true, lastModified: '2024-01-13' }
  ]

  const renderHomepageTab = () => (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Page d'accueil</h2>
          <p className="text-gray-600 mt-1">Gérez les sections de votre page d'accueil</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4 mr-2" />
            Prévisualiser
          </button>
          <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une section
          </button>
        </div>
      </div>

      {/* Preview modes */}
      <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg w-fit">
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

      {/* Sections list */}
      <div className="grid gap-4">
        {homeSections.map((section, index) => (
          <motion.div
            key={section.id}
            layout
            className={cn(
              "group relative bg-white border rounded-lg p-4 transition-all hover:shadow-md",
              section.isVisible ? "border-gray-200" : "border-gray-100 bg-gray-50"
            )}
          >
            {/* Drag handle */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-start space-x-4 ml-6">
              {/* Thumbnail */}
              <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{section.type}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn(
                    "font-medium truncate",
                    section.isVisible ? "text-gray-900" : "text-gray-500"
                  )}>
                    {section.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      section.isVisible 
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {section.isVisible ? 'Visible' : 'Masqué'}
                    </span>
                    <span className="text-xs text-gray-500">Ordre: {section.order}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                <p className="text-xs text-gray-500">
                  Modifié le {new Date(section.lastModified).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add section hint */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ajouter une nouvelle section</h3>
        <p className="text-gray-600">Cliquez ici pour créer une nouvelle section pour votre page d'accueil</p>
      </div>
    </div>
  )

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pages catégories</h2>
          <p className="text-gray-600 mt-1">Gérez le contenu de vos pages catégories</p>
        </div>
      </div>

      {/* Category pages grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryPages.map((page) => (
          <div key={page.id} className="group relative bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <page.icon className="w-6 h-6 text-primary" />
              </div>
              <div className={cn(
                "px-2 py-1 text-xs rounded-full",
                page.configured 
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              )}>
                {page.configured ? 'Configuré' : 'À configurer'}
              </div>
            </div>

            <h3 className="font-medium text-gray-900 mb-2">{page.label}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {page.configured 
                ? `Modifié le ${new Date(page.lastModified).toLocaleDateString('fr-FR')}`
                : 'Pas encore configuré'
              }
            </p>

            <div className="flex items-center justify-between">
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMediaTab = () => (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des médias</h2>
          <p className="text-gray-600 mt-1">Gérez vos images et fichiers</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4 mr-2" />
          Importer des médias
        </button>
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
        <button className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </button>
      </div>

      {/* Media grid placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center group cursor-pointer hover:bg-gray-200 transition-colors">
            <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de Contenu</h1>
          <p className="text-gray-600 mt-2">Gérez le contenu de votre site web</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsLoading(!isLoading)}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Actualiser
          </button>
          <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              {stat.change && (
                <span className={cn("text-sm font-medium", stat.color)}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
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
                "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm",
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        {activeTab === 'homepage' && renderHomepageTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'media' && renderMediaTab()}
      </motion.div>
    </div>
  )
}

export default ContentManagementPage