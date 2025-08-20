import React from 'react'
import { cn } from '../../../../utils/cn'
import { SliderConfig as SliderConfigType } from '../types'

interface SliderConfigProps {
  config: SliderConfigType
  onUpdateConfig: (updates: Partial<SliderConfigType>) => void
}

export const SliderConfig: React.FC<SliderConfigProps> = ({ config, onUpdateConfig }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Configuration du slider</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Lecture automatique</label>
            <button
              onClick={() => onUpdateConfig({ autoplay: !config.autoplay })}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                config.autoplay ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <div className={cn(
                'absolute w-4 h-4 bg-white rounded-full top-1 transition-transform',
                config.autoplay ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intervalle (ms)</label>
            <input
              type="number"
              min="1000"
              step="500"
              value={config.interval}
              onChange={(e) => onUpdateConfig({ interval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intervalle carte fidélité (ms)</label>
            <input
              type="number"
              min="1000"
              step="500"
              value={config.loyaltyCardInterval}
              onChange={(e) => onUpdateConfig({ loyaltyCardInterval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Afficher les flèches</label>
            <button
              onClick={() => onUpdateConfig({ showArrows: !config.showArrows })}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                config.showArrows ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <div className={cn(
                'absolute w-4 h-4 bg-white rounded-full top-1 transition-transform',
                config.showArrows ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Afficher les points</label>
            <button
              onClick={() => onUpdateConfig({ showDots: !config.showDots })}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                config.showDots ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <div className={cn(
                'absolute w-4 h-4 bg-white rounded-full top-1 transition-transform',
                config.showDots ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}