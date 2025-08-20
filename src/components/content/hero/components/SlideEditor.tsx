import React from 'react'
import { motion } from 'framer-motion'
import { Edit, Plus, Crown, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { HeroSlide, MediaFile, COLOR_PALETTES } from '../types'

interface SlideEditorProps {
  slide: HeroSlide
  onUpdateSlide: (updates: Partial<HeroSlide>) => void
  onSelectImage: () => void
  onRemoveImage: () => void
  loyaltyCard?: any
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide, onUpdateSlide, onSelectImage, onRemoveImage, loyaltyCard
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-6 p-4 bg-gray-50 rounded-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Edit className="w-4 h-4 text-blue-500" />
          <h3 className="font-medium text-gray-900">Éditer la slide</h3>
        </div>

        {!slide.isLoyaltyCard ? (
          <>
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => onUpdateSlide({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Arizona"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => onUpdateSlide({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Collection Été 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={slide.description}
                  onChange={(e) => onUpdateSlide({ description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Le modèle iconique, réinventé"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                <input
                  type="text"
                  value={slide.price || ''}
                  onChange={(e) => onUpdateSlide({ price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="99.99"
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image du produit</label>
              <div className="border border-gray-300 rounded-lg p-3">
                {slide.image ? (
                  <div className="relative">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={onSelectImage}
                        className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        <ImageIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={onRemoveImage}
                        className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs mb-2">Aucune image</p>
                    <button
                      onClick={onSelectImage}
                      className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      <Plus className="w-3 h-3" />
                      Choisir
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Palette de couleurs</label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() => onUpdateSlide({
                      accent: palette.accent,
                      textColor: palette.textColor,
                      buttonColor: palette.buttonColor
                    })}
                    className={cn(
                      'p-2 rounded-lg border text-xs text-center transition-all',
                      slide.accent === palette.accent
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={cn('h-6 rounded mb-1 bg-gradient-to-r', palette.accent)}></div>
                    {palette.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-600">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Carte de fidélité</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tampons</label>
              <input
                type="number"
                min="3"
                max="10"
                value={slide.stampCount || 6}
                onChange={(e) => onUpdateSlide({ stampCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Convert to Loyalty Card */}
        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={() => onUpdateSlide({ isLoyaltyCard: !slide.isLoyaltyCard })}
            className={cn(
              'w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors',
              slide.isLoyaltyCard
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <Crown className="w-4 h-4" />
            {slide.isLoyaltyCard ? 'Convertir en slide produit' : 'Convertir en carte fidélité'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}