// Script de test de connexion DB et API
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('🔍 Test de connexion à la base de données...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion DB réussie')
    
    // Vérifier les sections existantes
    const sections = await prisma.homeSection.findMany()
    console.log(`📊 Sections existantes: ${sections.length}`)
    
    if (sections.length === 0) {
      console.log('🔄 Insertion des sections de base...')
      
      const baseSections = [
        {
          id: 'hero-section',
          title: 'Section Hero',
          type: 'hero',
          content: JSON.stringify({ title: 'Bienvenue' }),
          order: 1
        },
        {
          id: 'categories-section',
          title: 'Nos Catégories',
          type: 'categories',
          content: JSON.stringify({ categories: [] }),
          order: 2
        },
        {
          id: 'featured-section',
          title: 'Produits en Vedette',
          type: 'featured',
          content: JSON.stringify({ products: [] }),
          order: 3
        },
        {
          id: 'advantages-section',
          title: 'Nos Avantages',
          type: 'advantages',
          content: JSON.stringify({ advantages: [] }),
          order: 4
        }
      ]
      
      for (const section of baseSections) {
        await prisma.homeSection.create({ data: section })
        console.log(`✅ Section créée: ${section.title}`)
      }
    } else {
      console.log('📝 Sections existantes:')
      sections.forEach(s => console.log(`  - ${s.title} (${s.type})`))
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
