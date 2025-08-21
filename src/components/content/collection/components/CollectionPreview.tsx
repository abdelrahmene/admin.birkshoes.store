'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { CollectionItem, CarouselConfig } from '../types'
import { cn } from '../../../../utils/cn'

interface CollectionPreviewProps {
  items: CollectionItem[]
  config: CarouselConfig
  title: string
  description: string
  currentIndex?: number
  onIndexChange?: (index: number) => void
  className?: string
}

export const CollectionPreview: React.FC<CollectionPreviewProps> = ({
  items,
  config,
  title,
  description,
  currentIndex = 0,
  onIndexChange,
  className
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [isPlaying, setIsPlaying] = useState(config.autoplay)

  useEffect(() => {
    setActiveIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && config.autoplay && items.length > 1) {
      interval = setInterval(() => {
        const nextIndex = (activeIndex + 1) % items.length
        setActiveIndex(nextIndex)
        onIndexChange?.(nextIndex)
      }, config.interval)
    }
    return () => clearInterval(interval)
  }, [isPlaying, config.autoplay, config.interval, activeIndex, items.length, onIndexChange])

  const handlePrevious = () => {
    const newIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1
    setActiveIndex(newIndex)
    onIndexChange?.(newIndex)
  }

  const handleNext = () => {
    const newIndex = (activeIndex + 1) % items.length
    setActiveIndex(newIndex)
    onIndexChange?.(newIndex)
  }

  const handleDotClick = (index: number) => {
    setActiveIndex(index)
    onIndexChange?.(index)
  }

  if (items.length === 0) {
    return (
      <div className={cn("h-full flex flex-col justify-center py-8 px-4", className)}>
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-sm" />
          </h2>
          <p className="text-base md:text-lg text-gray-700 dark:text-slate-300 font-medium mt-4">
            {description}
          </p>
        </div>
        <div className="relative w-full overflow-hidden bg-gray-50 h-[70vh] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ExternalLink className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Aucun élément à afficher</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn("h-full flex flex-col justify-center py-8 px-4", className)}
      onMouseEnter={() => config.pauseOnHover && setIsPlaying(false)}
      onMouseLeave={() => config.pauseOnHover && config.autoplay && setIsPlaying(true)}
    >
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-sm" />
          </h2>
        </div>
        <p className="text-base md:text-lg text-gray-700 dark:text-slate-300 font-medium mt-4">
          {description}
        </p>
      </div>

      <div className="relative w-full overflow-hidden bg-gray-50 dark:bg-slate-900/90 py-4">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-[70vh] w-full">
            
            <AnimatePresence mode="wait">
              {items.map((item, index) => {
                const isActive = index === activeIndex
                const distance = Math.abs(index - activeIndex)
                if (distance > 2) return null

                return (
                  <motion.div
                    key={item.id}
                    className="absolute inset-0 w-full z-20"
                    initial={{ opacity: 0, x: index > activeIndex ? '100%' : '-100%', scale: config.scale }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.3,
                      x: `${(index - activeIndex) * (100 + config.gap)}%`,
                      scale: isActive ? 1 : config.scale
                    }}
                    transition={{ duration: config.animationDuration / 1000, ease: "easeInOut" }}
                  >
                    <a className="block w-full h-full" href={item.link}>
                      <div className={cn("relative h-[70vh] overflow-hidden rounded-2xl bg-gradient-to-br", item.accent)}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                        
                        {item.image && (
                          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                        )}
                        
                        <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
                          <motion.div 
                            className="max-w-2xl"
                            animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 20 }}
                          >
                            <h3 className={cn("text-4xl md:text-5xl font-bold mb-4 tracking-tight", item.textColor)}>
                              {item.title}
                            </h3>
                            {item.subtitle && (
                              <p className={cn("text-lg md:text-xl mb-2 opacity-90", item.textColor)}>
                                {item.subtitle}
                              </p>
                            )}
                            <p className={cn("text-lg md:text-xl mb-8 opacity-80", item.textColor)}>
                              {item.description}
                            </p>
                            <button className={cn("px-8 py-3 rounded-full text-lg font-medium shadow-lg", item.buttonColor)}>
                              {item.ctaText}
                            </button>
                          </motion.div>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {config.showArrows && items.length > 1 && (
              <>
                <button onClick={handlePrevious} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm">
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm">
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {config.showDots && items.length > 1 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={cn("w-2 h-2 rounded-full transition-colors", index === activeIndex ? "bg-white" : "bg-white/40")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionPreview