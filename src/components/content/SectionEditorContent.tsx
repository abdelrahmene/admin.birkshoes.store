'use client'

import React from 'react'
import SectionCollectionEditor from './collection/SectionCollectionEditor'
import SectionHeroEditor from './hero/SectionHeroEditor'

interface SectionEditorContentProps {
  sectionType: string
  content: any
  onChange: (content: any) => void
  mediaFiles: any[]
  onRefreshMedia: () => void
  sectionId?: string
}

export const SectionEditorContent: React.FC<SectionEditorContentProps> = ({
  sectionType,
  content,
  onChange,
  mediaFiles,
  onRefreshMedia,
  sectionId
}) => {
  switch (sectionType) {
    case 'hero':
      return (
        <SectionHeroEditor
          content={content}
          onChange={onChange}
          mediaFiles={mediaFiles}
          onRefreshMedia={onRefreshMedia}
        />
      )
    
    case 'collection':
      return (
        <SectionCollectionEditor
          content={content}
          onChange={onChange}
          mediaFiles={mediaFiles}
          onRefreshMedia={onRefreshMedia}
          sectionId={sectionId || ''}
        />
      )
    
    case 'categories':
    case 'new-products':
    case 'advantages':
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Éditeur en développement</p>
            <p className="text-sm">L'éditeur pour le type "{sectionType}" sera disponible prochainement</p>
          </div>
        </div>
      )
    
    default:
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Type de section non supporté</p>
            <p className="text-sm">Le type "{sectionType}" n'a pas d'éditeur personnalisé</p>
          </div>
        </div>
      )
  }
}

export default SectionEditorContent