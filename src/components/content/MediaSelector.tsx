'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Search,
  Grid,
  List,
  Image as ImageIcon,
  Video,
  File,
  Check,
  Loader2,
  FolderOpen,
  Calendar
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { toast } from 'react-hot-toast'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt?: string
  tags?: string[]
  createdAt: string
  folder: string
}

interface MediaSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (files: MediaFile[]) => void
  multiple?: boolean
  mediaFiles: MediaFile[]
  onRefresh: () => void
  acceptedTypes?: string[]
}

const MediaSelector: React.FC<MediaSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  mediaFiles,
  onRefresh,
  acceptedTypes = ['image/*', 'video/*']
}) => {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploading, setIsUploading] = useState(false)
  const [filterFolder, setFilterFolder] = useState<string>('')

  // Réinitialiser la sélection quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([])
      setSearchQuery('')
    }
  }, [isOpen])

  // Filtrer les fichiers selon les critères
  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = !filterFolder || file.folder === filterFolder
    const matchesType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.mimeType.startsWith('image/')
      if (type === 'video/*') return file.mimeType.startsWith('video/')
      return file.mimeType === type
    })
    
    return matchesSearch && matchesFolder && matchesType
  })

  // Obtenir les dossiers uniques
  const folders = Array.from(new Set(mediaFiles.map(file => file.folder).filter(Boolean)))

  const handleFileSelect = (file: MediaFile) => {
    if (!multiple) {
      setSelectedFiles([file])
      return
    }

    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id)
      if (isSelected) {
        return prev.filter(f => f.id !== file.id)
      } else {
        return [...prev, file]
      }
    })
  }

  const handleConfirmSelection = () => {
    if (selectedFiles.length > 0) {
      onSelect(selectedFiles)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file) // Utiliser 'file' au lieu de 'files'
        formData.append('folder', 'content')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Upload failed for ${file.name}`)
        }

        return response.json()
      })

      const results = await Promise.all(uploadPromises)
      const successCount = results.filter(r => r.success).length
      
      if (successCount > 0) {
        toast.success(`${successCount} fichier(s) uploadé(s) avec succès`)
        onRefresh()
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
    } finally {
      setIsUploading(false)
      event.target.value = '' // Reset input
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon
    if (mimeType.startsWith('video/')) return Video
    return File
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Sélectionner un média
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4">
              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? 'Upload...' : 'Upload'}
                </button>
              </div>

              {/* Search */}
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des fichiers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Folder Filter */}
              {folders.length > 0 && (
                <select
                  value={filterFolder}
                  onChange={(e) => setFilterFolder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les dossiers</option>
                  {folders.map(folder => (
                    <option key={folder} value={folder}>
                      {folder || 'Sans dossier'}
                    </option>
                  ))}
                </select>
              )}

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FolderOpen className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucun fichier trouvé</h3>
                <p className="text-center">
                  {searchQuery || filterFolder
                    ? 'Aucun fichier ne correspond aux critères de recherche.'
                    : 'Commencez par uploader des fichiers.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFiles.map(file => {
                  const isSelected = selectedFiles.some(f => f.id === file.id)
                  const FileIcon = getFileIcon(file.mimeType)
                  
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={cn(
                        'relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all',
                        isSelected
                          ? 'border-blue-500 ring-4 ring-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        {file.mimeType.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.alt || file.originalName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <FileIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                        <p className="text-white text-xs font-medium truncate">
                          {file.originalName}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map(file => {
                  const isSelected = selectedFiles.some(f => f.id === file.id)
                  const FileIcon = getFileIcon(file.mimeType)
                  
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {file.mimeType.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.alt || file.originalName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <FileIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {file.originalName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{file.mimeType}</span>
                          {file.folder && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" />
                              {file.folder}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedFiles.length > 0 ? (
                  `${selectedFiles.length} fichier(s) sélectionné(s)`
                ) : (
                  `${filteredFiles.length} fichier(s) disponible(s)`
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={selectedFiles.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sélectionner {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export { MediaSelector }