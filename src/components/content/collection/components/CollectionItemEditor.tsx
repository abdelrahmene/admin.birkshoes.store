'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, X, Palette, Type, Link as LinkIcon, Tag, ArrowUpDown } from 'lucide-react'
import { CollectionItem, COLLECTION_COLOR_PALETTES } from '../types'
import { cn } from '../../../../utils/cn'

interface CollectionItemEditorProps {
  item: CollectionItem
  onUpdateItem: (updates: Partial<CollectionItem>) => void
  onSelectImage: () => void
  onRemoveImage: () => void
}

export const CollectionItemEditor: React.FC<CollectionItemEditorProps> = ({
  item,
  onUpdateItem,
  onSelectImage,
  onRemoveImage
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-gray-200 rounded-xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-600" />
          Modifier l'élément
        </h3>
        <span className="text-sm text-gray-500">ID: {item.id}</span>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4" />
              Titre principal
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdateItem({ title: e.target.value })}
              placeholder="Ex: Nouvelle Collection"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4" />
              Sous-titre (optionnel)
            </label>
            <input
              type="text"
              value={item.subtitle || ''}
              onChange={(e) => onUpdateItem({ subtitle: e.target.value })}
              placeholder="Ex: Collection Été 2025"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={item.description}
              onChange={(e) => onUpdateItem({ description: e.target.value })}
              placeholder="Description de la collection..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <ImageIcon className="w-4 h-4" />
          Image de fond
        </label>
        
        {item.image ? (
          <div className="relative group">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-32 object-cover rounded-lg bg-gray-100"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={onSelectImage}
                  className="px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Changer
                </button>
                <button
                  onClick={onRemoveImage}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onSelectImage}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Sélectionner une image</span>
          </button>
        )}
      </div>

      {/* Link and CTA */}
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <LinkIcon className="w-4 h-4" />
            Lien de redirection
          </label>
          <input
            type="text"
            value={item.link}
            onChange={(e) => onUpdateItem({ link: e.target.value })}
            placeholder="Ex: /collections/new"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4" />
            Texte du bouton
          </label>
          <input
            type="text"
            value={item.ctaText}
            onChange={(e) => onUpdateItem({ ctaText: e.target.value })}
            placeholder="Ex: Découvrir"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <ArrowUpDown className="w-4 h-4" />
        Ordre d'affichage
        </label>
        <input
        type="number"
        value={item.order}
        onChange={(e) => onUpdateItem({ order: parseInt(e.target.value) || 0 })}
        min="0"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4" />
              Opacité de l'image de fond (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={(item.imageOpacity || 30)}
                onChange={(e) => onUpdateItem({ imageOpacity: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-600 min-w-[45px]">
                {(item.imageOpacity || 30)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ajustez la transparence de l'image pour améliorer la lisibilité du texte
            </p>
          </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Palette className="w-4 h-4" />
          Palette de couleurs
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {COLLECTION_COLOR_PALETTES.map((palette) => (
            <button
              key={palette.name}
              onClick={() => onUpdateItem({
                accent: palette.accent,
                textColor: palette.textColor,
                buttonColor: palette.buttonColor
              })}
              className={cn(
                "p-3 rounded-lg border-2 transition-all",
                item.accent === palette.accent
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className={cn(
                "w-full h-8 rounded-md mb-2 bg-gradient-to-r",
                palette.accent
              )} />
              <div className="text-xs font-medium text-gray-700">{palette.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="border-t border-gray-100 pt-4">
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          Aperçu de l'élément
        </label>
        <div className="relative h-32 rounded-lg overflow-hidden">
          <div className={cn("absolute inset-0 bg-gradient-to-br", item.accent)}>
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: (item.imageOpacity || 30) / 100 }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
            
            <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center">
              <h3 className={cn("text-lg font-bold mb-1", item.textColor)}>
                {item.title}
              </h3>
              {item.subtitle && (
                <p className={cn("text-sm opacity-90 mb-2", item.textColor)}>
                  {item.subtitle}
                </p>
              )}
              <p className={cn("text-xs opacity-80 mb-3", item.textColor)}>
                {item.description}
              </p>
              <button 
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
                  item.buttonColor
                )}
              >
                {item.ctaText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CollectionItemEditor