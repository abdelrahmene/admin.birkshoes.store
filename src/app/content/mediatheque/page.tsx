'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Grid,
  List,
  Upload,
  X,
  Check,
  ImageIcon,
  Video,
  File,
  Folder,
  Calendar,
  Eye,
  Trash2,
  Download,
  Tag,
  MoreVertical,
  Plus,
  Edit3,
  FolderPlus,
  Settings
} from 'lucide-react'
import { cn } from '../../../utils/cn'
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
  usageCount: number
}

const MediaLibraryPage: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showFileDetails, setShowFileDetails] = useState<string | null>(null)

  // Load media files
  const loadMediaFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setMediaFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error loading media files:', error)
      toast.error('Erreur lors du chargement des fichiers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMediaFiles()
  }, [])

  // Filter files based on search and type
  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.filename.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'images' && file.mimeType.startsWith('image/')) ||
                       (filterType === 'videos' && file.mimeType.startsWith('video/')) ||
                       (filterType === 'documents' && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/'))
    
    return matchesSearch && matchesType
  })

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id))
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'content')

        const response = await fetch('/api/upload/single', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`)
        }

        return response.json()
      })

      await Promise.all(uploadPromises)
      await loadMediaFiles() // Refresh media list
      setShowUploadModal(false)
      toast.success(`${files.length} fichier(s) uploadé(s) avec succès`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Erreur lors de l'upload des fichiers")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedFiles.length} fichier(s) ?`)) {
      return
    }

    try {
      for (const fileId of selectedFiles) {
        const response = await fetch(`/api/upload/${fileId}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error('Delete failed')
        }
      }
      
      await loadMediaFiles()
      setSelectedFiles([])
      toast.success(`${selectedFiles.length} fichier(s) supprimé(s)`)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon
    if (mimeType.startsWith('video/')) return Video
    return File
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Médiathèque</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos images, vidéos et documents
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Uploader des fichiers
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des fichiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les fichiers</option>
              <option value="images">Images</option>
              <option value="videos">Vidéos</option>
              <option value="documents">Documents</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
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
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Selection Info */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>
                {filteredFiles.length} fichier{filteredFiles.length > 1 ? 's' : ''}
              </span>
              {selectedFiles.length > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-blue-600 font-medium">
                    {selectedFiles.length} sélectionné{selectedFiles.length > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedFiles.length === filteredFiles.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100 transition-colors text-sm"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des fichiers...</p>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterType !== 'all' ? 'Aucun fichier trouvé' : 'Aucun fichier'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterType !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par uploader vos premiers fichiers'
              }
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Uploader des fichiers
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file.mimeType)
                const isSelected = selectedFiles.includes(file.id)
                
                return (
                  <div
                    key={file.id}
                    className={cn(
                      'relative bg-gray-50 border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md group',
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div 
                      className="aspect-square p-2"
                      onClick={() => handleFileSelect(file.id)}
                    >
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.alt || file.originalName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                          <Icon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2 border-t border-gray-200 bg-white">
                      <p className="text-xs font-medium text-gray-900 truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        {file.usageCount > 0 && (
                          <span className="text-xs bg-green-100 text-green-600 px-1 rounded">
                            {file.usageCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowFileDetails(file.id)}
                        className="w-5 h-5 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                        title="Voir les détails"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-2">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file.mimeType)
                const isSelected = selectedFiles.includes(file.id)
                
                return (
                  <div
                    key={file.id}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50',
                      isSelected && 'bg-blue-50 border border-blue-200'
                    )}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.alt || file.originalName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Icon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 truncate">
                            {file.originalName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {file.usageCount > 0 && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                              Utilisé {file.usageCount} fois
                            </span>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowFileDetails(file.id)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Uploader des fichiers
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className={cn(
                  'mx-auto h-12 w-12 mb-4',
                  isUploading ? 'animate-bounce text-blue-500' : 'text-gray-400'
                )} />
                
                <p className="text-sm text-gray-600 mb-4">
                  {isUploading 
                    ? 'Upload en cours...' 
                    : 'Glissez vos fichiers ici ou cliquez pour parcourir'
                  }
                </p>
                
                <input
                  type="file"
                  id="upload-files"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="upload-files"
                  className={cn(
                    'inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer',
                    isUploading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  Parcourir les fichiers
                </label>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Formats supportés: JPG, PNG, GIF, WebP, MP4, PDF (max 5MB)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MediaLibraryPage
