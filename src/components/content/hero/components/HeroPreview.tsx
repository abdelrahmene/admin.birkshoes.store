import React from 'react'
import { Crown, Star } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { HeroSlide, LoyaltyCard } from '../types'

interface HeroPreviewProps {
  slides: HeroSlide[]
  currentSlideIndex: number
  loyaltyCard?: LoyaltyCard
  showArrows?: boolean
  showDots?: boolean
  onSlideChange: (index: number) => void
  className?: string
}

export const HeroPreview: React.FC<HeroPreviewProps> = ({
  slides, currentSlideIndex, loyaltyCard, showArrows, showDots, onSlideChange, className
}) => {
  const nextSlide = () => {
    onSlideChange(currentSlideIndex >= slides.length - 1 ? 0 : currentSlideIndex + 1)
  }

  const prevSlide = () => {
    onSlideChange(currentSlideIndex <= 0 ? slides.length - 1 : currentSlideIndex - 1)
  }

  return (
    <div className={cn('relative h-96 overflow-hidden bg-gray-200', className)}>
      {slides.length > 0 ? (
        <>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                currentSlideIndex === index ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center p-8', slide.accent)}>
                <div className="text-center max-w-4xl mx-auto">
                  {slide.isLoyaltyCard ? (
                    <div className="text-center">
                      <Crown className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                      <h2 className={cn('text-3xl font-bold mb-2', slide.textColor)}>
                        {loyaltyCard?.title || 'Programme Fidélité'}
                      </h2>
                      <p className={cn('text-lg mb-4 opacity-90', slide.textColor)}>
                        {loyaltyCard?.subtitle || 'Exclusif Birk&Shoes'}
                      </p>
                      <p className={cn('text-lg mb-4 opacity-80', slide.textColor)}>
                        {loyaltyCard?.description || '6 achetées = 7ème gratuite!'}
                      </p>
                      <div className="flex justify-center gap-2 mb-4">
                        {Array.from({ length: loyaltyCard?.stampCount || 6 }).map((_, i) => (
                          <Star key={i} className="w-6 h-6 text-yellow-300 fill-current" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-8">
                      {slide.image && (
                        <div className="flex-1">
                          <img 
                            src={slide.image} 
                            alt={slide.title}
                            className="max-w-full h-64 object-contain"
                          />
                        </div>
                      )}
                      <div className={slide.image ? 'flex-1 text-left' : 'w-full'}>
                        <h2 className={cn('text-4xl font-bold mb-2', slide.textColor)}>
                          {slide.title}
                        </h2>
                        <p className={cn('text-xl mb-3 opacity-90', slide.textColor)}>
                          {slide.subtitle}
                        </p>
                        <p className={cn('text-lg mb-4 opacity-80', slide.textColor)}>
                          {slide.description}
                        </p>
                        {slide.price && (
                          <div className="mb-6">
                            <span className={cn('text-3xl font-bold', slide.textColor)}>
                              {slide.price}€
                            </span>
                          </div>
                        )}
                        <button className={cn('px-6 py-3 rounded-lg font-semibold transition-colors', slide.buttonColor)}>
                          Découvrir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {showArrows && slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                ←
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                →
              </button>
            </>
          )}

          {showDots && slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onSlideChange(index)}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all',
                    currentSlideIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                  )}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-lg flex items-center justify-center">
              📷
            </div>
            <p>Aucune slide disponible</p>
            <p className="text-sm">Ajoutez une slide pour commencer</p>
          </div>
        </div>
      )}
    </div>
  )
}