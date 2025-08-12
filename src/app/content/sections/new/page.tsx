'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Image as ImageIcon,
  Type,
  Layout,
  Palette,
  Code,
  Plus,
  Trash2,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sectionTypes = [
  {
    id: 'hero',
    name: 'Hero Banner',
    description: 'Bannière principale avec titre, sous-titre et image de fond',
    icon: Layout,
    color: 'bg-blue-500'
  },
  {
    id: 'categories',
    name: 'Grille de Catégories',
    description: 'Affichage des catégories principales sous forme de grille',
    icon: Layout,
    color: 'bg-green-500'
  },
  {
    id: 'collection',
    name: 'Collection Vedette',
    description: 'Mise en avant d\'une collection spécifique',
    icon: ImageIcon,
    color: 'bg-purple-500'
  },
  {
    id: 'advantages',
    name: 'Nos Avantages',
    description: 'Points forts et avantages de votre boutique',
    icon: Settings,
    color: 'bg-orange-500'
  },
  {
    id: 'new-products',
    name: 'Nouveautés',
    description: 'Derniers produits ajoutés au catalogue',
    icon: Plus,
    color: 'bg-pink-500'
  },
  {
    id: 'custom',
    name: 'Section Personnalisée',
    description: 'Créez votre propre section avec du contenu personnalisé',
    icon: Code,
    color: 'bg-gray-500'
  }
]

const NewSectionPage = () => {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isVisible: true,
    content: {}
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/content/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          type: selectedType
        })
      })

      const result = await response.json()
      
      if (result.success) {
        router.push('/content')
      } else {
        console.error('Erreur:', result.error)
        // Gérer l'erreur (afficher une notification, etc.)
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderSectionForm = () => {
    const selectedTypeData = sectionTypes.find(type => type.id === selectedType)
    
    if (!selectedTypeData) return null

    return (
      <div className=\"space-y-6\">
        {/* Info sur le type sélectionné */}
        <div className=\"bg-gray-50 rounded-lg p-4 border\">
          <div className=\"flex items-center space-x-3\">
            <div className={cn(\"w-10 h-10 rounded-lg flex items-center justify-center\", selectedTypeData.color)}>
              <selectedTypeData.icon className=\"w-5 h-5 text-white\" />
            </div>
            <div>
              <h3 className=\"font-medium text-gray-900\">{selectedTypeData.name}</h3>
              <p className=\"text-sm text-gray-600\">{selectedTypeData.description}</p>
            </div>
          </div>
        </div>

        {/* Formulaire général */}
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
          <div className=\"space-y-4\">
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Titre de la section *
              </label>
              <input
                type=\"text\"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent\"
                placeholder=\"Entrez le titre de la section\"
                required
              />
            </div>

            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent\"
                placeholder=\"Description de la section (optionnel)\"
              />
            </div>

            <div className=\"flex items-center space-x-3\">
              <input
                type=\"checkbox\"
                id=\"isVisible\"
                checked={formData.isVisible}
                onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
                className=\"w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary\"
              />
              <label htmlFor=\"isVisible\" className=\"text-sm font-medium text-gray-700\">
                Section visible sur le site
              </label>
            </div>
          </div>

          <div className=\"space-y-4\">
            <div className=\"bg-white border border-gray-200 rounded-lg p-4\">
              <h4 className=\"font-medium text-gray-900 mb-3\">Configuration spécifique</h4>
              {renderTypeSpecificForm()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTypeSpecificForm = () => {
    switch (selectedType) {
      case 'hero':
        return (
          <div className=\"space-y-4\">
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Image de fond
              </label>
              <div className=\"border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors\">
                <Upload className=\"w-8 h-8 text-gray-400 mx-auto mb-2\" />
                <p className=\"text-sm text-gray-600\">Cliquez pour uploader une image</p>
              </div>
            </div>
            
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Titre principal
              </label>
              <input
                type=\"text\"
                className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent\"
                placeholder=\"Bienvenue chez BirkShoes\"
              />
            </div>
            
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Sous-titre
              </label>
              <textarea
                rows={2}
                className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent\"
                placeholder=\"Découvrez notre collection de chaussures...\"
              />
            </div>
          </div>
        )
      
      case 'categories':
        return (
          <div className=\"space-y-4\">
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Nombre de catégories à afficher
              </label>
              <select className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent\">
                <option value=\"4\">4 catégories</option>
                <option value=\"6\">6 catégories</option>
                <option value=\"8\">8 catégories</option>
              </select>
            </div>
            
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Style d'affichage
              </label>
              <select className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent\">
                <option value=\"grid\">Grille</option>
                <option value=\"carousel\">Carrousel</option>
              </select>
            </div>
          </div>
        )
      
      case 'collection':
        return (
          <div className=\"space-y-4\">
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Collection à mettre en avant
              </label>
              <select className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent\">
                <option value=\"\">Sélectionner une collection</option>
                <option value=\"new\">Nouveautés</option>
                <option value=\"featured\">Sélection</option>
                <option value=\"bestsellers\">Meilleures ventes</option>
              </select>
            </div>
            
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Nombre de produits à afficher
              </label>
              <select className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent\">
                <option value=\"4\">4 produits</option>
                <option value=\"6\">6 produits</option>
                <option value=\"8\">8 produits</option>
              </select>
            </div>
          </div>
        )
      
      default:
        return (
          <p className=\"text-sm text-gray-600 italic\">
            Configuration spécifique sera disponible après sélection du type
          </p>
        )
    }
  }

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div className=\"flex items-center space-x-4\">
          <button
            onClick={() => router.back()}
            className=\"flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors\"
          >
            <ArrowLeft className=\"w-4 h-4 mr-2\" />
            Retour
          </button>
          <div>
            <h1 className=\"text-3xl font-bold text-gray-900\">Nouvelle Section</h1>
            <p className=\"text-gray-600 mt-1\">Créez une nouvelle section pour votre page d'accueil</p>
          </div>
        </div>
        
        <div className=\"flex items-center space-x-3\">
          <button className=\"flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors\">
            <Eye className=\"w-4 h-4 mr-2\" />
            Aperçu
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedType || !formData.title || isLoading}
            className={cn(
              \"flex items-center px-4 py-2 rounded-lg transition-colors\",
              selectedType && formData.title && !isLoading
                ? \"bg-primary text-white hover:bg-primary/90\"
                : \"bg-gray-300 text-gray-500 cursor-not-allowed\"
            )}
          >
            <Save className=\"w-4 h-4 mr-2\" />
            {isLoading ? 'Création...' : 'Créer la section'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className=\"bg-white rounded-lg border border-gray-200\">
        {!selectedType ? (
          <div className=\"p-6\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">Choisissez le type de section</h2>
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
              {sectionTypes.map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type.id)}
                  className=\"p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:shadow-md transition-all\"
                >
                  <div className=\"flex items-start space-x-3\">
                    <div className={cn(\"w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0\", type.color)}>
                      <type.icon className=\"w-5 h-5 text-white\" />
                    </div>
                    <div className=\"flex-1 min-w-0\">
                      <h3 className=\"font-medium text-gray-900 mb-1\">{type.name}</h3>
                      <p className=\"text-sm text-gray-600 leading-relaxed\">{type.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className=\"p-6\">
            <div className=\"flex items-center justify-between mb-6\">
              <h2 className=\"text-xl font-semibold text-gray-900\">Configuration de la section</h2>
              <button
                onClick={() => setSelectedType('')}
                className=\"text-sm text-gray-600 hover:text-gray-900 transition-colors\"
              >
                Changer de type
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {renderSectionForm()}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewSectionPage