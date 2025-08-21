'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Eye, Settings, Layout, Type, Palette } from 'lucide-react'
import { SectionEditorContent } from './SectionEditorContent'

interface SectionEditorProps {
  section: any
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  mediaFiles?: any[]
  onRefreshMedia?: () => void
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  isOpen,
  onClose,
  onSave,
  mediaFiles = [],
  onRefreshMedia = () => {}
}) => {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    type: section?.type || 'hero',
    content: section?.content || {},
    isVisible: section?.isVisible !== false // default to true
  })

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const handleContentChange = (newContent: any) => {
    setFormData(prev => ({ ...prev, content: newContent }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-[95vw] w-full h-[95vh] mx-4 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">
              {section?.id ? 'Éditer la section' : 'Nouvelle section'}
            </h2>
            
            {/* Basic Info */}
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-3 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom de la section"
              />
              
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, content: {} })}
                className="px-3 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hero">Hero Banner</option>
                <option value="categories">Catégories</option>
                <option value="collection">Collection</option>
                <option value="new-products">Nouveaux Produits</option>
                <option value="advantages">Avantages</option>
              </select>
              
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Visible</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <SectionEditorContent
            sectionType={formData.type}
            content={formData.content}
            onChange={handleContentChange}
            mediaFiles={mediaFiles}
            onRefreshMedia={onRefreshMedia}
            sectionId={section?.id}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default SectionEditor
