'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Save, 
  Eye, 
  EyeOff, 
  Type, 
  Image, 
  Layout,
  Palette
} from 'lucide-react'

interface SectionEditorProps {
  section: any
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSection: any) => void
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState(section || {
    title: '',
    description: '',
    type: 'hero',
    content: {},
    isVisible: true
  })

  const sectionTypes = [
    { id: 'hero', label: 'Hero Banner', icon: Layout, description: 'Section principale de la page' },
    { id: 'categories', label: 'Catégories', icon: Layout, description: 'Affichage des catégories de produits' },
    { id: 'collection', label: 'Collection', icon: Image, description: 'Mise en avant d\'une collection' },
    { id: 'text-content', label: 'Contenu Texte', icon: Type, description: 'Section avec du contenu textuel' },
    { id: 'custom', label: 'Section Custom', icon: Palette, description: 'Section personnalisée' }
  ]

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {section?.id ? 'Modifier la section' : 'Créer une nouvelle section'}
            </h2>
            <p className="text-gray-600 mt-1">Configurez les paramètres de votre section</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la section *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: Hero Principal, Nos Catégories..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Description de la section pour l'administration"
              />
            </div>
          </div>

          {/* Section Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de section *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sectionTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, type: type.id }))}
                  className={`flex items-start p-4 border-2 rounded-lg text-left transition-colors ${
                    formData.type === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <type.icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                    formData.type === type.id ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      formData.type === type.id ? 'text-primary' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {type.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Visibilité
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setFormData((prev: any) => ({ ...prev, isVisible: true }))}
                className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.isVisible
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visible
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev: any) => ({ ...prev, isVisible: false }))}
                className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                  !formData.isVisible
                    ? 'border-gray-200 bg-gray-50 text-gray-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Masqué
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Les sections masquées ne seront pas affichées sur le site web
            </p>
          </div>

          {/* Content Configuration based on type */}
          {formData.type === 'hero' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Configuration Hero Banner</h4>
              <p className="text-sm text-blue-700">
                La configuration détaillée du hero banner sera disponible après la création de base.
              </p>
            </div>
          )}

          {formData.type === 'categories' && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Configuration Catégories</h4>
              <p className="text-sm text-purple-700">
                Cette section affichera automatiquement vos catégories de produits.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFormData((prev: any) => ({ ...prev, isVisible: false }))}
              className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Enregistrer en brouillon
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.title.trim()}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}