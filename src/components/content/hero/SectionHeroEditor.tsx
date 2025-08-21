'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Settings, Gift, Monitor, Tablet, Smartphone, Play, Pause } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { MediaSelector } from '../MediaSelector'
import { toast } from 'react-hot-toast'

// Import components
import { SlidesList } from './components/SlidesList'
import { SlideEditor } from './components/SlideEditor'
import { SliderConfig } from './components/SliderConfig'
import { LoyaltyCardConfig } from './components/LoyaltyCardConfig'
import { HeroPreview } from './components/HeroPreview'

// Import types and defaults
import {
  HeroContent, HeroSlide, MediaFile,
  DEFAULT_HERO_SLIDE, DEFAULT_SLIDER_CONFIG, DEFAULT_LOYALTY_CARD
} from './types'

interface SectionHeroEditorProps {
  content: HeroContent
  onChange: (content: HeroContent) => void
  mediaFiles: MediaFile[]
  onRefreshMedia: () => void
}

const SectionHeroEditor: React.FC<SectionHeroEditorProps> = ({
  content, onChange, mediaFiles, onRefreshMedia
}) => {
  const [activeTab, setActiveTab] = useState('slides')
  const [selectedSlide, setSelectedSlide] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState('desktop')
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [selectedImageSlide, setSelectedImageSlide] = useState<string | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize default values
  useEffect(() => {
    if (!content.sliderConfig || !content.slides || !content.loyaltyCard) {
      onChange({
        ...content,
        type: 'hero',
        mode: 'slider',
        sliderConfig: content.sliderConfig || DEFAULT_SLIDER_CONFIG,
        loyaltyCard: content.loyaltyCard || DEFAULT_LOYALTY_CARD,
        slides: content.slides || []
      })
    }
  }, [content, onChange])

  // Auto-play simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && content.sliderConfig?.autoplay && (content.slides?.length || 0) > 1) {
      interval = setInterval(() => {
        setCurrentSlideIndex(prev =>
          prev >= (content.slides?.length || 1) - 1 ? 0 : prev + 1
        )
      }, content.sliderConfig.interval || 5000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, content.sliderConfig, content.slides])

  const updateContent = (updates: Partial<HeroContent>) => {
    onChange({ ...content, ...updates })
  }

  const updateSliderConfig = (updates: Partial<typeof content.sliderConfig>) => {
    updateContent({ 
      sliderConfig: { ...content.sliderConfig, ...DEFAULT_SLIDER_CONFIG, ...updates } 
    })
  }

  const updateLoyaltyCard = (updates: Partial<typeof content.loyaltyCard>) => {
    updateContent({ 
      loyaltyCard: { ...content.loyaltyCard, ...DEFAULT_LOYALTY_CARD, ...updates } 
    })
  }

  const addSlide = () => {
    const newSlide: HeroSlide = { ...DEFAULT_HERO_SLIDE, id: `slide-${Date.now()}` }
    updateContent({ slides: [...(content.slides || []), newSlide] })
  }

  const updateSlide = (slideId: string, updates: Partial<HeroSlide>) => {
    const updatedSlides = (content.slides || []).map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    )
    updateContent({ slides: updatedSlides })
  }

  const removeSlide = (slideId: string) => {
    if ((content.slides || []).length <= 1) {
      toast.error('Vous devez garder au moins une slide')
      return
    }
    const updatedSlides = (content.slides || []).filter(slide => slide.id !== slideId)
    updateContent({ slides: updatedSlides })
    if (selectedSlide === slideId) setSelectedSlide(null)
  }

  const duplicateSlide = (slideId: string) => {
    const slideToClone = (content.slides || []).find(slide => slide.id === slideId)
    if (!slideToClone) return
    const newSlide: HeroSlide = {
      ...slideToClone,
      id: `slide-${Date.now()}`,
      title: `${slideToClone.title} (Copie)`
    }
    updateContent({ slides: [...(content.slides || []), newSlide] })
  }

  const handleImageSelect = (files: MediaFile[]) => {
    if (selectedImageSlide && files.length > 0) {
      updateSlide(selectedImageSlide, { image: files[0].url })
    }
    setShowMediaSelector(false)
    setSelectedImageSlide(null)
  }

  const reorderSlides = (reorderedSlides: HeroSlide[]) => {
    updateContent({ slides: reorderedSlides })
  }

  const tabs = [
    { id: 'slides', label: 'Slides', icon: ImageIcon },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'loyalty', label: 'Programme Fidélité', icon: Gift }
  ]

  const previewModes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  const slides = content.slides || []
  const selectedSlideData = selectedSlide ? slides.find(s => s.id === selectedSlide) : null

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

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'slides' && (
            <div className="space-y-4">
              <SlidesList
                slides={slides}
                selectedSlide={selectedSlide}
                onSelectSlide={setSelectedSlide}
                onReorderSlides={reorderSlides}
                onAddSlide={addSlide}
                onDuplicateSlide={duplicateSlide}
                onRemoveSlide={removeSlide}
              />

              {selectedSlideData && (
                <AnimatePresence>
                  <SlideEditor
                    slide={selectedSlideData}
                    onUpdateSlide={(updates) => updateSlide(selectedSlideData.id, updates)}
                    onSelectImage={() => {
                      setSelectedImageSlide(selectedSlideData.id)
                      setShowMediaSelector(true)
                    }}
                    onRemoveImage={() => updateSlide(selectedSlideData.id, { image: undefined })}
                    loyaltyCard={content.loyaltyCard}
                  />
                </AnimatePresence>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <SliderConfig
              config={{ ...DEFAULT_SLIDER_CONFIG, ...content.sliderConfig }}
              onUpdateConfig={updateSliderConfig}
            />
          )}

          {activeTab === 'loyalty' && (
            <LoyaltyCardConfig
              loyaltyCard={{ ...DEFAULT_LOYALTY_CARD, ...content.loyaltyCard }}
              onUpdateLoyaltyCard={updateLoyaltyCard}
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

            {slides.length > 1 && (
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
                  {currentSlideIndex + 1} / {slides.length}
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
            <HeroPreview
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              loyaltyCard={content.loyaltyCard}
              showArrows={content.sliderConfig?.showArrows}
              showDots={content.sliderConfig?.showDots}
              onSlideChange={setCurrentSlideIndex}
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
          setSelectedImageSlide(null)
        }}
        onSelect={handleImageSelect}
        multiple={false}
        mediaFiles={mediaFiles}
        onRefresh={onRefreshMedia}
      />
    </div>
  )
}

export default SectionHeroEditor