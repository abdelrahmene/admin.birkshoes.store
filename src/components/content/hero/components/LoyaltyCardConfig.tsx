import React from 'react'
import { Crown } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { LoyaltyCard } from '../types'

interface LoyaltyCardConfigProps {
  loyaltyCard: LoyaltyCard
  onUpdateLoyaltyCard: (updates: Partial<LoyaltyCard>) => void
}

export const LoyaltyCardConfig: React.FC<LoyaltyCardConfigProps> = ({
  loyaltyCard, onUpdateLoyaltyCard
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-yellow-600">
        <Crown className="w-5 h-5" />
        <h3 className="font-medium text-gray-900">Programme de fidélité</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Activer le programme</label>
          <button
            onClick={() => onUpdateLoyaltyCard({ enabled: !loyaltyCard.enabled })}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors',
              loyaltyCard.enabled ? 'bg-blue-600' : 'bg-gray-200'
            )}
          >
            <div className={cn(
              'absolute w-4 h-4 bg-white rounded-full top-1 transition-transform',
              loyaltyCard.enabled ? 'translate-x-6' : 'translate-x-1'
            )} />
          </button>
        </div>

        {loyaltyCard.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={loyaltyCard.title}
                onChange={(e) => onUpdateLoyaltyCard({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Programme Fidélité"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
              <input
                type="text"
                value={loyaltyCard.subtitle}
                onChange={(e) => onUpdateLoyaltyCard({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Exclusif Birk&Shoes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={loyaltyCard.description}
                onChange={(e) => onUpdateLoyaltyCard({ description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="6 achetées = 7ème gratuite!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tampons</label>
              <input
                type="number"
                min="3"
                max="10"
                value={loyaltyCard.stampCount}
                onChange={(e) => onUpdateLoyaltyCard({ stampCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Récompense</label>
              <input
                type="text"
                value={loyaltyCard.reward}
                onChange={(e) => onUpdateLoyaltyCard({ reward: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paire gratuite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur d'accent (classe Tailwind)</label>
              <input
                type="text"
                value={loyaltyCard.accentColor}
                onChange={(e) => onUpdateLoyaltyCard({ accentColor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="from-yellow-400 to-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur du texte (classe Tailwind)</label>
              <input
                type="text"
                value={loyaltyCard.textColor}
                onChange={(e) => onUpdateLoyaltyCard({ textColor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="text-white"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}