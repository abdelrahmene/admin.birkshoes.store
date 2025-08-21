'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Settings, Monitor, Tablet, Smartphone, Play, Pause } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { MediaSelector } from '../MediaSelector'
import { toast } from 'react-hot-toast'
import { getCollectionItems, saveCollectionItems, getMediaFiles } from '../../../services/api'

import { CollectionItemsList } from './components/CollectionItemsList'
import { CollectionItemEditor } from './components/CollectionItemEditor'
import { CarouselConfigEditor } from './components/CarouselConfigEditor'
import { CollectionPreview } from './components/CollectionPreview'

import {
  CollectionContent, CollectionItem, MediaFile,
  DEFAULT_COLLECTION_ITEM, DEFAULT_CAROUSEL_CONFIG, DEFAULT_COLLECTION_CONTENT
} from './types'

interface SectionCollectionEditorProps {
  content: CollectionContent
  onChange: (content: CollectionContent) => void
  mediaFiles: MediaFile[]
  onRefreshMedia: () => void
  sectionId: string
}

const SectionCollectionEditor: React.FC<SectionCollectionEditorProps> = ({
  content, onChange, mediaFiles, onRefreshMedia, sectionId
}) => {
  const [activeTab, setActiveTab] = useState('items')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState('desktop')
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [selectedImageItem, setSelectedImageItem] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!content.carouselConfig || !content.items) {
      onChange({
        ...DEFAULT_COLLECTION_CONTENT,
        ...content,
        carouselConfig: content.carouselConfig || DEFAULT_CAROUSEL_CONFIG,
        items: content.items || []
      })
    }
  }, [content, onChange])

  // Load collection items from DB on mount
  useEffect(() => {
    const loadCollectionData = async () => {
      if (sectionId) {
        try {
          const data = await getCollectionItems(sectionId)
          if (data.items && data.items.length > 0) {
            onChange({
              ...content,
              items: data.items,
              carouselConfig: data.carouselConfig || DEFAULT_CAROUSEL_CONFIG
            })
          }
        } catch (error) {
          console.error('Error loading collection items:', error)
        }
      }
    }

    loadCollectionData()
  }, [sectionId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && content.carouselConfig?.autoplay && (content.items?.length || 0) > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => prev >= (content.items?.length || 1) - 1 ? 0 : prev + 1)
      }, content.carouselConfig.interval || 4000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, content.carouselConfig, content.items])

  const updateContent = async (updates: Partial<CollectionContent>) => {
    const newContent = { ...content, ...updates }
    onChange(newContent)
    
    // Auto-save to DB
    if (sectionId && (updates.items || updates.carouselConfig)) {
      try {
        await saveCollectionItems(sectionId, newContent.items || [], newContent.carouselConfig || DEFAULT_CAROUSEL_CONFIG)
        toast.success('Données sauvegardées automatiquement')
      } catch (error) {
        console.error('Error auto-saving:', error)
        toast.error('Erreur lors de la sauvegarde')
      }
    }
  }

  const updateCarouselConfig = (updates: Partial<typeof content.carouselConfig>) => {
    updateContent({ 
      carouselConfig: { ...content.carouselConfig, ...DEFAULT_CAROUSEL_CONFIG, ...updates } 
    })
  }

  const addItem = () => {
    const newItem: CollectionItem = { 
      ...DEFAULT_COLLECTION_ITEM, 
      id: `item-${Date.now()}`,
      order: (content.items || []).length
    }
    updateContent({ items: [...(content.items || []), newItem] })
  }

  const updateItem = (itemId: string, updates: Partial<CollectionItem>) => {
    const updatedItems = (content.items || []).map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    )
    updateContent({ items: updatedItems })
  }

  const removeItem = (itemId: string) => {
    if ((content.items || []).length <= 1) {
      toast.error('Vous devez garder au moins un élément')
      return
    }
    const updatedItems = (content.items || []).filter(item => item.id !== itemId)
    updateContent({ items: updatedItems })
    if (selectedItem === itemId) setSelectedItem(null)
  }

  const duplicateItem = (itemId: string) => {
    const itemToClone = (content.items || []).find(item => item.id === itemId)
    if (!itemToClone) return
    const newItem: CollectionItem = {
      ...itemToClone,
      id: `item-${Date.now()}`,
      title: `${itemToClone.title} (Copie)`,
      order: (content.items || []).length
    }
    updateContent({ items: [...(content.items || []), newItem] })
  }

  const handleImageSelect = (files: MediaFile[]) => {
    if (selectedImageItem && files.length > 0) {
      updateItem(selectedImageItem, { image: files[0].url })
    }
    setShowMediaSelector(false)
    setSelectedImageItem(null)
  }

  const reorderItems = (reorderedItems: CollectionItem[]) => {
    const itemsWithUpdatedOrder = reorderedItems.map((item, index) => ({
      ...item,
      order: index
    }))
    updateContent({ items: itemsWithUpdatedOrder })
  }

  const tabs = [
    { id: 'items', label: 'Éléments', icon: ImageIcon },
    { id: 'config', label: 'Configuration', icon: Settings }
  ]

  const previewModes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  const items = content.items || []
  const selectedItemData = selectedItem ? items.find(s => s.id === selectedItem) : null

  return (
    <div className="h-full flex">
      {/* Configuration Panel */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Basic Settings */}
        <div className="p-4 border-b border-gray-100">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Titre</label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea
                value={content.description}
                onChange={(e) => updateContent({ description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'items' && (
            <div className="space-y-4">
              <CollectionItemsList
                items={items}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                onReorderItems={reorderItems}
                onAddItem={addItem}
                onDuplicateItem={duplicateItem}
                onRemoveItem={removeItem}
              />

              {selectedItemData && (
                <AnimatePresence>
                  <CollectionItemEditor
                    item={selectedItemData}
                    onUpdateItem={(updates) => updateItem(selectedItemData.id, updates)}
                    onSelectImage={() => {
                      setSelectedImageItem(selectedItemData.id)
                      setShowMediaSelector(true)
                    }}
                    onRemoveImage={() => updateItem(selectedItemData.id, { image: undefined })}
                  />
                </AnimatePresence>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <CarouselConfigEditor
              config={{ ...DEFAULT_CAROUSEL_CONFIG, ...content.carouselConfig }}
              onUpdateConfig={updateCarouselConfig}
            />
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 bg-gray-100 flex flex-col">
        {/* Preview Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Prévisualisation</h2>
              
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {previewModes.map(mode => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setPreviewMode(mode.id)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors',
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
            </div>

            {items.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isPlaying
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  )}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Arrêter' : 'Démarrer'}
                </button>
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} / {items.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6">
          <div className={cn(
            'mx-auto bg-white rounded-lg shadow-lg overflow-hidden',
            previewMode === 'desktop' ? 'max-w-6xl' : 
            previewMode === 'tablet' ? 'max-w-3xl' :
            'max-w-sm'
          )}>
            <CollectionPreview
              items={items}
              config={{ ...DEFAULT_CAROUSEL_CONFIG, ...content.carouselConfig }}
              title={content.title}
              description={content.description}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              className="h-96"
            />
          </div>
        </div>
      </div>

      {/* Media Selector Modal */}
      <MediaSelector
        isOpen={showMediaSelector}
        onClose={() => {
          setShowMediaSelector(false)
          setSelectedImageItem(null)
        }}
        onSelect={handleImageSelect}
        multiple={false}
        mediaFiles={mediaFiles}
        onRefresh={onRefreshMedia}
      />
    </div>
  )
}

export default SectionCollectionEditor