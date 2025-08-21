export interface CollectionItem {
  id: string
  title: string
  subtitle?: string
  description: string
  image?: string
  link: string
  accent: string
  textColor: string
  buttonColor: string
  ctaText: string
  order: number
  imageOpacity?: number
}

export interface CarouselConfig {
  autoplay: boolean
  interval: number
  pauseOnHover: boolean
  showArrows: boolean
  showDots: boolean
  itemsVisible: {
    desktop: number
    tablet: number
    mobile: number
  }
  animationDuration: number
  scale: number
  gap: number
}

export interface CollectionContent {
  type: 'collection'
  title: string
  description: string
  collectionId: string
  displayType: 'carousel' | 'grid'
  productsCount: number
  showPrice: boolean
  showDescription: boolean
  ctaText: string
  carouselConfig: CarouselConfig
  items: CollectionItem[]
}

export interface MediaFile {
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

export interface ColorPalette {
  name: string
  accent: string
  textColor: string
  buttonColor: string
}

export const COLLECTION_COLOR_PALETTES: ColorPalette[] = [
  { 
    name: 'Rose Passion', 
    accent: 'from-pink-800 to-pink-950', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-black hover:bg-gray-100' 
  },
  { 
    name: 'Violet Mystique', 
    accent: 'from-purple-800 to-purple-950', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-black hover:bg-gray-100' 
  },
  { 
    name: 'Bleu Profond', 
    accent: 'from-blue-800 to-blue-950', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-black hover:bg-gray-100' 
  },
  { 
    name: 'Vert Émeraude', 
    accent: 'from-emerald-800 to-emerald-950', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-black hover:bg-gray-100' 
  },
  { 
    name: 'Rouge Intense', 
    accent: 'from-red-800 to-red-950', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-black hover:bg-gray-100' 
  },
  { 
    name: 'Orange Vibrant', 
    accent: 'from-orange-800 to-orange-950', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-black hover:bg-gray-100' 
  }
]

// Default values
export const DEFAULT_CAROUSEL_CONFIG: CarouselConfig = {
  autoplay: true,
  interval: 4000,
  pauseOnHover: true,
  showArrows: true,
  showDots: true,
  itemsVisible: {
    desktop: 1,
    tablet: 1,
    mobile: 1
  },
  animationDuration: 800,
  scale: 0.88,
  gap: 32
}

export const DEFAULT_COLLECTION_ITEM: Omit<CollectionItem, 'id'> = {
  title: 'Nouvelle Collection',
  subtitle: '',
  description: 'Les dernières tendances',
  link: '/collections/new',
  accent: 'from-pink-800 to-pink-950',
  textColor: 'text-white',
  buttonColor: 'bg-white text-black hover:bg-gray-100',
  ctaText: 'Découvrir',
  order: 0
}

export const DEFAULT_COLLECTION_CONTENT: CollectionContent = {
  type: 'collection',
  title: 'Nouveau Produit',
  description: 'Section présentant les derniers arrivages',
  collectionId: 'new-arrivals',
  displayType: 'carousel',
  productsCount: 8,
  showPrice: true,
  showDescription: false,
  ctaText: 'Découvrir',
  carouselConfig: DEFAULT_CAROUSEL_CONFIG,
  items: []
}