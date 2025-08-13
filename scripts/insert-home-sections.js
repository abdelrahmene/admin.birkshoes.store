const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const homeSections = [
  {
    id: 'hero-section-1',
    title: 'Hero Principal',
    description: 'Section hero avec slider d\'images',
    type: 'hero',
    content: JSON.stringify({
      slides: [{
        title: 'Nouvelle Collection',
        subtitle: 'Découvrez nos dernières chaussures',
        image: '/images/hero-1.jpg',
        cta: {
          text: 'Découvrir',
          link: '/collections'
        }
      }]
    }),
    isVisible: true,
    order: 1
  },
  {
    id: 'categories-section',
    title: 'Nos Catégories',
    description: 'Section présentant les principales catégories',
    type: 'categories',
    content: JSON.stringify({
      categories: [
        { name: 'Homme', slug: 'men', image: '/images/cat-men.jpg' },
        { name: 'Femme', slug: 'women', image: '/images/cat-women.jpg' },
        { name: 'Enfant', slug: 'kids', image: '/images/cat-kids.jpg' }
      ]
    }),
    isVisible: true,
    order: 2
  },
  {
    id: 'collection-featured',
    title: 'Collection en Vedette',
    description: 'Section mettant en avant une collection spécifique',
    type: 'collection',
    content: JSON.stringify({
      collection: {
        name: 'Nouvelle Collection',
        description: 'Les dernières tendances',
        image: '/images/collection-featured.jpg',
        link: '/collection/nouvelle-collection'
      }
    }),
    isVisible: true,
    order: 3
  },
  {
    id: 'advantages-section',
    title: 'Nos Avantages',
    description: 'Section présentant les avantages de la boutique',
    type: 'advantages',
    content: JSON.stringify({
      advantages: [
        { title: 'Livraison Gratuite', description: 'Livraison gratuite partout en Algérie', icon: 'truck' },
        { title: 'Paiement Sécurisé', description: 'Paiement à la livraison', icon: 'shield' },
        { title: 'Retour Gratuit', description: 'Retour sous 7 jours', icon: 'refresh' }
      ]
    }),
    isVisible: true,
    order: 4
  }
]

async function insertHomeSections() {
  try {
    console.log('🚀 Insertion des sections de la page d\'accueil...')
    
    // Vérifier si des sections existent déjà
    const existingSections = await prisma.homeSection.findMany()
    
    if (existingSections.length > 0) {
      console.log('⚠️ Des sections existent déjà:', existingSections.length)
      console.log('Sections existantes:', existingSections.map(s => s.title))
      return
    }
    
    // Insérer les sections
    for (const section of homeSections) {
      await prisma.homeSection.create({
        data: section
      })
      console.log(`✅ Section créée: ${section.title}`)
    }
    
    console.log('🎉 Toutes les sections ont été créées avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des sections:', error)
  } finally {
    await prisma.$disconnect()
  }
}

insertHomeSections()
