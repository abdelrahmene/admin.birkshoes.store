import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createDefaultHomeSections = async () => {
  try {
    console.log('🔄 Vérification des sections existantes...')
    
    const existingSections = await prisma.homeSection.findMany()
    console.log(`📊 Sections existantes: ${existingSections.length}`)
    
    if (existingSections.length === 0) {
      console.log('➕ Création des sections par défaut...')
      
      const defaultSections = [
        {
          title: 'Hero Principal',
          description: 'Section hero avec slider d\'images',
          type: 'hero',
          content: JSON.stringify({
            slides: [
              {
                title: 'Nouvelle Collection',
                subtitle: 'Découvrez nos dernières chaussures',
                image: '/images/hero-1.jpg',
                cta: {
                  text: 'Découvrir',
                  link: '/collections'
                }
              }
            ]
          }),
          isVisible: true,
          order: 1
        },
        {
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
          title: 'Nos Avantages',
          description: 'Section présentant les avantages de la boutique',
          type: 'advantages',
          content: JSON.stringify({
            advantages: [
              {
                title: 'Livraison Gratuite',
                description: 'Livraison gratuite partout en Algérie',
                icon: 'truck'
              },
              {
                title: 'Paiement Sécurisé',
                description: 'Paiement à la livraison',
                icon: 'shield'
              },
              {
                title: 'Retour Gratuit',
                description: 'Retour sous 7 jours',
                icon: 'refresh'
              }
            ]
          }),
          isVisible: true,
          order: 4
        },
        {
          title: 'Nouveaux Produits',
          description: 'Section affichant les derniers produits ajoutés',
          type: 'new-products',
          content: JSON.stringify({
            title: 'Nouveautés',
            subtitle: 'Découvrez nos derniers arrivages',
            limit: 8
          }),
          isVisible: true,
          order: 5
        }
      ]
      
      for (const section of defaultSections) {
        await prisma.homeSection.create({
          data: section
        })
        console.log(`✅ Section "${section.title}" créée`)
      }
      
      console.log('🎉 Toutes les sections par défaut ont été créées !')
    } else {
      console.log('ℹ️ Des sections existent déjà')
      existingSections.forEach(section => {
        console.log(`  - ${section.title} (${section.type}) - ${section.isVisible ? 'Visible' : 'Masqué'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultHomeSections()
