// Script de test pour diagnostiquer l'API des collections
const { PrismaClient } = require('@prisma/client')

async function testCollectionAPI() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Test de connexion à la base de données...')
    
    // Test 1: Vérifier la connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')
    
    // Test 2: Lister toutes les collections
    console.log('\n📋 Liste des collections:')
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true
      }
    })
    console.log('Collections trouvées:', collections.length)
    collections.forEach(c => console.log(`  - ${c.id}: ${c.name} (category: ${c.categoryId || 'none'})`))
    
    if (collections.length > 0) {
      const testId = collections[0].id
      console.log(`\n🔍 Test de récupération de la collection ${testId}...`)
      
      // Test 3: Récupérer une collection spécifique avec relations
      try {
        const collection = await prisma.collection.findUnique({
          where: {
            id: testId
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            products: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                isActive: true
              }
            },
            _count: {
              select: {
                products: true
              }
            }
          }
        })
        
        if (collection) {
          console.log('✅ Collection récupérée avec succès:')
          console.log('  - Nom:', collection.name)
          console.log('  - Catégorie:', collection.category?.name || 'Aucune')
          console.log('  - Nombre de produits:', collection._count.products)
          console.log('  - Produits:', collection.products.length)
        } else {
          console.log('❌ Collection non trouvée')
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération de la collection:', error.message)
        console.error('Code d\'erreur:', error.code)
        console.error('Stack:', error.stack)
      }
    }
    
    // Test 4: Vérifier la structure de la table collections
    console.log('\n📊 Vérification de la structure de la table collections...')
    const tableInfo = await prisma.$queryRaw`DESCRIBE collections`
    console.log('Colonnes de la table collections:')
    console.table(tableInfo)
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    console.error('Code:', error.code)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testCollectionAPI().catch(console.error)
