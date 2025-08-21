export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  description: string
  price?: string
  image?: string
  accent: string
  textColor: string
  buttonColor: string
  isLoyaltyCard: boolean
  stampCount?: number
}

export interface SliderConfig {
  autoplay: boolean
  interval: number
  loyaltyCardInterval: number
  showArrows: boolean
  showDots: boolean
  pauseOnHover: boolean
}

export interface LoyaltyCard {
  enabled: boolean
  stampCount: number
  title: string
  subtitle: string
  description: string
  position: number
  reward: string
  accentColor: string
  textColor: string
}

export interface HeroContent {
  type: string
  mode: string
  sliderConfig: SliderConfig
  slides: HeroSlide[]
  loyaltyCard: LoyaltyCard
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
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

export const COLOR_PALETTES: ColorPalette[] = [
  { 
    name: 'Bleu Océan', 
    accent: 'from-blue-600 to-indigo-900', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-blue-600 hover:bg-blue-50' 
  },
  { 
    name: 'Rouge Passion', 
    accent: 'from-red-600 to-pink-900', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-red-600 hover:bg-red-50' 
  },
  { 
    name: 'Violet Mystique', 
    accent: 'from-purple-600 to-indigo-900', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-purple-600 hover:bg-purple-50' 
  },
  { 
    name: 'Vert Nature', 
    accent: 'from-green-600 to-teal-900', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-green-600 hover:bg-green-50' 
  },
  { 
    name: 'Orange Énergique', 
    accent: 'from-orange-600 to-red-900', 
    textColor: 'text-white', 
    buttonColor: 'bg-white text-orange-600 hover:bg-orange-50' 
  },
  { 
    name: 'Fidélité', 
    accent: 'from-blue-900 via-indigo-800 to-indigo-900', 
    textColor: 'text-white', 
    buttonColor: 'bg-gradient-to-r from-indigo-200/20 to-indigo-400/20' 
  }
]

// Default values
export const DEFAULT_SLIDER_CONFIG: SliderConfig = {
  autoplay: true,
  interval: 5000,
  loyaltyCardInterval: 12000,
  showArrows: true,
  showDots: false,
  pauseOnHover: true
}

export const DEFAULT_LOYALTY_CARD: LoyaltyCard = {
  enabled: true,
  stampCount: 6,
  title: 'Programme Fidélité',
  subtitle: 'Exclusif Birk&Shoes',
  description: '6 achetées = 7ème gratuite!',
  position: 2,
  reward: 'Paire gratuite',
  accentColor: 'from-yellow-400 to-orange-500',
  textColor: 'text-white'
}

export const DEFAULT_HERO_SLIDE: Omit<HeroSlide, 'id'> = {
  title: 'Nouveau Produit',
  subtitle: 'Collection Été 2025',
  description: 'Description du produit',
  price: '99.99',
  accent: 'from-blue-600 to-indigo-900',
  textColor: 'text-white',
  buttonColor: 'bg-white text-blue-600 hover:bg-blue-50',
  isLoyaltyCard: false
}