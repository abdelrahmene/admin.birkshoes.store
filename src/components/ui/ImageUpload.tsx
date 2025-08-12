'use client'

import React, { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface ImageUploadProps {
  // Legacy props
  images?: string[]
  onImagesChange?: (images: string[]) => void
  // New props
  value?: string[]
  onChange?: (images: string[]) => void
  // Common props
  maxImages?: number
  maxFiles?: number
  folder?: 'products' | 'collections' | 'categories'
  endpoint?: string
  className?: string
  multiple?: boolean
}

export default function ImageUpload({ 
  // Legacy props
  images: legacyImages, 
  onImagesChange: legacyOnImagesChange, 
  // New props
  value,
  onChange,
  // Common props
  maxImages = 10,
  maxFiles,
  folder: propFolder,
  endpoint,
  className = '',
  multiple = true
}: ImageUploadProps) {
  // Support both interfaces
  const images = value || legacyImages || []
  const onImagesChange = onChange || legacyOnImagesChange || (() => {})
  const maxImagesLimit = maxFiles || maxImages
  
  // Map endpoint to folder
  const endpointToFolderMap: Record<string, 'products' | 'collections' | 'categories'> = {
    'productImage': 'products',
    'collectionImage': 'collections',
    'categoryImage': 'categories'
  }
  
  const folder = endpoint ? endpointToFolderMap[endpoint] : (propFolder || 'products')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return

    if (!multiple && files.length > 1) {
      toast.error('Une seule image est autorisée')
      return
    }

    if (images.length + files.length > maxImagesLimit) {
      toast.error(`Maximum ${maxImagesLimit} images autorisées`)
      return
    }

    setUploading(true)
    const uploadedImages: string[] = []

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          uploadedImages.push(data.url)
        } else {
          const error = await response.json()
          toast.error(error.error || 'Erreur lors de l\'upload')
        }
      }

      if (uploadedImages.length > 0) {
        onImagesChange([...images, ...uploadedImages])
        toast.success(`${uploadedImages.length} image(s) uploadée(s) avec succès!`)
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Erreur lors de l\'upload des images')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeImage = (imageUrl: string) => {
    onImagesChange(images.filter(img => img !== imageUrl))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : uploading 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className={`mx-auto h-12 w-12 ${
          uploading ? 'animate-bounce text-primary' : 
          dragOver ? 'text-primary' : 'text-gray-400'
        }`} />
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {uploading 
              ? 'Upload en cours...' 
              : dragOver 
              ? 'Relâchez pour uploader' 
              : 'Glissez vos images ici ou'
            }
          </p>
          
          <div className="mt-2">
            <input
              type="file"
              id={`image-upload-${folder}`}
              accept="image/*"
              onChange={handleFileInputChange}
              multiple={multiple}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor={`image-upload-${folder}`}>
              <Button 
                type="button" 
                variant="outline" 
                className="cursor-pointer"
                disabled={uploading}
                onClick={() => document.getElementById(`image-upload-${folder}`)?.click()}
              >
                <span>
                  {uploading ? 'Upload...' : 'Parcourir les fichiers'}
                </span>
              </Button>
            </label>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG, GIF, WebP jusqu'à 10MB
          {multiple && ` • Maximum ${maxImagesLimit} images`}
        </p>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Images ajoutées ({images.length}/{maxImagesLimit})
            </h4>
            {multiple && (
              <p className="text-xs text-gray-500">
                Glissez pour réorganiser
              </p>
            )}
          </div>
          
          <div className={`grid gap-3 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
            {images.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(imageUrl)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:opacity-100"
                  title="Supprimer l'image"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Principal Badge */}
                {index === 0 && multiple && (
                  <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                    Principal
                  </div>
                )}

                {/* Move Buttons (for multiple images) */}
                {multiple && images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index - 1)}
                          className="bg-black/50 text-white p-1 rounded text-xs hover:bg-black/70"
                          title="Déplacer vers la gauche"
                        >
                          ←
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index + 1)}
                          className="bg-black/50 text-white p-1 rounded text-xs hover:bg-black/70"
                          title="Déplacer vers la droite"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export { ImageUpload }