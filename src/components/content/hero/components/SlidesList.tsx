import React from 'react'
import { Reorder } from 'framer-motion'
import { Plus, Crown, Copy, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { toast } from 'react-hot-toast'
import { HeroSlide } from '../types'

interface SlidesListProps {
  slides: HeroSlide[]
  selectedSlide: string | null
  onSelectSlide: (slideId: string) => void
  onReorderSlides: (slides: HeroSlide[]) => void
  onAddSlide: () => void
  onDuplicateSlide: (slideId: string) => void
  onRemoveSlide: (slideId: string) => void
}

export const SlidesList: React.FC<SlidesListProps> = ({
  slides, selectedSlide, onSelectSlide, onReorderSlides, onAddSlide, onDuplicateSlide, onRemoveSlide
}) => {
  const handleRemoveSlide = (slideId: string) => {
    if (slides.length <= 1) {
      toast.error('Vous devez garder au moins une slide')
      return
    }
    onRemoveSlide(slideId)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onAddSlide}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
      >
        <Plus className="w-4 h-4" />
        Ajouter une slide
      </button>

      <Reorder.Group values={slides} onReorder={onReorderSlides}>
        <div className="space-y-2">
          {slides.map((slide) => (
            <Reorder.Item key={slide.id} value={slide}>
              <div className={cn(
                'border rounded-lg p-3 cursor-pointer transition-all',
                selectedSlide === slide.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}>
                <div 
                  className="flex items-center gap-3"
                  onClick={() => onSelectSlide(slide.id)}
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  
                  {slide.isLoyaltyCard ? (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  ) : slide.image ? (
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {slide.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {slide.subtitle}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateSlide(slide.id)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                      title="Dupliquer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveSlide(slide.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </div>
      </Reorder.Group>
    </div>
  )
}