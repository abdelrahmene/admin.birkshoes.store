'use client'

import React from 'react'
import { Settings, Play, Pause, ArrowLeftRight, Circle, Smartphone, Tablet, Monitor, Timer, MousePointer } from 'lucide-react'
import { CarouselConfig } from '../types'
import { cn } from '../../../../utils/cn'

interface CarouselConfigEditorProps {
  config: CarouselConfig
  onUpdateConfig: (updates: Partial<CarouselConfig>) => void
}

export const CarouselConfigEditor: React.FC<CarouselConfigEditorProps> = ({
  config,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <Settings className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configuration du carrousel</h3>
      </div>

      {/* Autoplay Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Play className="w-4 h-4 text-green-600" />
          Lecture automatique
        </h4>

        <div className="space-y-3 ml-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.autoplay}
              onChange={(e) => onUpdateConfig({ autoplay: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Activer la lecture automatique</span>
          </label>

          {config.autoplay && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Intervalle entre les slides
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2000"
                    max="10000"
                    step="500"
                    value={config.interval}
                    onChange={(e) => onUpdateConfig({ interval: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 min-w-[60px]">
                    {config.interval / 1000}s
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.pauseOnHover}
                  onChange={(e) => onUpdateConfig({ pauseOnHover: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Pause au survol
                </span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-blue-600" />
          Contrôles de navigation
        </h4>

        <div className="space-y-3 ml-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.showArrows}
              onChange={(e) => onUpdateConfig({ showArrows: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les flèches de navigation</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.showDots}
              onChange={(e) => onUpdateConfig({ showDots: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 flex items-center gap-2">
              <Circle className="w-4 h-4" />
              Afficher les points indicateurs
            </span>
          </label>
        </div>
      </div>

      {/* Responsive Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900">Affichage responsive</h4>

        <div className="space-y-4 ml-6">
          <div className="flex items-center gap-3">
            <Monitor className="w-4 h-4 text-purple-600" />
            <label className="text-sm font-medium text-gray-700 min-w-[80px]">Desktop</label>
            <input
              type="number"
              min="1"
              max="5"
              value={config.itemsVisible.desktop}
              onChange={(e) => onUpdateConfig({
                itemsVisible: {
                  ...config.itemsVisible,
                  desktop: parseInt(e.target.value) || 1
                }
              })}
              className="w-16 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">éléments visibles</span>
          </div>

          <div className="flex items-center gap-3">
            <Tablet className="w-4 h-4 text-orange-600" />
            <label className="text-sm font-medium text-gray-700 min-w-[80px]">Tablette</label>
            <input
              type="number"
              min="1"
              max="3"
              value={config.itemsVisible.tablet}
              onChange={(e) => onUpdateConfig({
                itemsVisible: {
                  ...config.itemsVisible,
                  tablet: parseInt(e.target.value) || 1
                }
              })}
              className="w-16 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">éléments visibles</span>
          </div>

          <div className="flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-green-600" />
            <label className="text-sm font-medium text-gray-700 min-w-[80px]">Mobile</label>
            <input
              type="number"
              min="1"
              max="2"
              value={config.itemsVisible.mobile}
              onChange={(e) => onUpdateConfig({
                itemsVisible: {
                  ...config.itemsVisible,
                  mobile: parseInt(e.target.value) || 1
                }
              })}
              className="w-16 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">éléments visibles</span>
          </div>
        </div>
      </div>

      {/* Animation Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900">Animations et effets</h4>

        <div className="space-y-4 ml-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Durée d'animation
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="200"
                max="1500"
                step="100"
                value={config.animationDuration}
                onChange={(e) => onUpdateConfig({ animationDuration: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 min-w-[60px]">
                {config.animationDuration}ms
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Échelle des éléments non-actifs
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={config.scale}
                onChange={(e) => onUpdateConfig({ scale: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 min-w-[60px]">
                {Math.round(config.scale * 100)}%
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Espacement entre les éléments
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="64"
                step="8"
                value={config.gap}
                onChange={(e) => onUpdateConfig({ gap: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 min-w-[60px]">
                {config.gap}px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Settings */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Résumé de la configuration</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Lecture auto:</span>
              <span className={cn(
                "font-medium",
                config.autoplay ? "text-green-600" : "text-red-600"
              )}>
                {config.autoplay ? 'Activée' : 'Désactivée'}
              </span>
            </div>
            {config.autoplay && (
              <div className="flex justify-between">
                <span className="text-gray-600">Intervalle:</span>
                <span className="font-medium">{config.interval / 1000}s</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Flèches:</span>
              <span className={cn(
                "font-medium",
                config.showArrows ? "text-green-600" : "text-gray-400"
              )}>
                {config.showArrows ? 'Visibles' : 'Masquées'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Points:</span>
              <span className={cn(
                "font-medium",
                config.showDots ? "text-green-600" : "text-gray-400"
              )}>
                {config.showDots ? 'Visibles' : 'Masqués'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Animation:</span>
              <span className="font-medium">{config.animationDuration}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Échelle:</span>
              <span className="font-medium">{Math.round(config.scale * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarouselConfigEditor