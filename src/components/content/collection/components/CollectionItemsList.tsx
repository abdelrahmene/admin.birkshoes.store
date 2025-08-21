'use client'

import React from 'react'
import { Reorder } from 'framer-motion'
import { Plus, GripVertical, Copy, Trash2, Eye, EyeOff, Image } from 'lucide-react'
import { CollectionItem } from '../types'
import { cn } from '../../../../utils/cn'

interface CollectionItemsListProps {
  items: CollectionItem[]
  selectedItem: string | null
  onSelectItem: (itemId: string | null) => void
  onReorderItems: (reorderedItems: CollectionItem[]) => void
  onAddItem: () => void
  onDuplicateItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
  onToggleVisibility?: (itemId: string, visible: boolean) => void
}

export const CollectionItemsList: React.FC<CollectionItemsListProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onReorderItems,
  onAddItem,
  onDuplicateItem,
  onRemoveItem,
  onToggleVisibility
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Collection Items ({items.length})
        </h3>
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Aucun élément de collection.</p>
          <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter" pour commencer.</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={onReorderItems}
          className="space-y-2"
        >
          {items.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className={cn(
                "group relative bg-white border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedItem === item.id
                  ? "ring-2 ring-blue-500 border-blue-200 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onSelectItem(selectedItem === item.id ? null : item.id)}
            >
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>

                {/* Item Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {/* Image Preview */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Image className="w-5 h-5 text-gray-400" />
                      </div>
                    )}

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          `bg-gradient-to-r ${item.accent}`,
                          item.textColor
                        )}>
                          {item.order + 1}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onToggleVisibility && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleVisibility(item.id, false) // Assuming visibility toggle
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      title="Visibilité"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateItem(item.id)
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveItem(item.id)
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Selected Indicator */}
              {selectedItem === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {items.length > 0 && (
        <div className="text-xs text-gray-400 mt-4 p-3 bg-gray-50 rounded-lg">
          💡 <strong>Astuce :</strong> Glissez et déposez pour réorganiser les éléments. 
          Cliquez sur un élément pour le modifier.
        </div>
      )}
    </div>
  )
}

export default CollectionItemsList