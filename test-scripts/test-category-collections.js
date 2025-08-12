const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCategoryAPI() {
  try {
    console.log('🔍 Test de l\'API des catégories...')
    
    // Test 1: Récupération de toutes les catégories
    console.log('\n1️⃣ Test: Récupération de toutes les catégories')
    try {
      const categories = await prisma.category.findMany({
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              products: true,
              collections: true
            }
          }
        }
      })
      console.log(`✅ Récupération réussie: ${categories.length} catégories trouvées`)
      console.log('Categories:', categories.map(c => `${c.name} (${c._count.products} produits, ${c._count.collections} collections)`))
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories:', error.message)
    }

    // Test 2: Test de la relation categoryId dans les collections
    console.log('\n2️⃣ Test: Vérification de la relation Category-Collection')
    try {
      const collectionsWithCategory = await prisma.collection.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        take: 5
      })
      console.log(`✅ Relations Collection-Category: ${collectionsWithCategory.length} collections trouvées`)
      collectionsWithCategory.forEach(collection => {
        console.log(`- ${collection.name} → ${collection.category?.name || 'Aucune catégorie'}`)
      })
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des relations:', error.message)
      console.log('💡 Il semble que la colonne categoryId manque. Exécutez: npx prisma db push')
    }

    // Test 3: Test de récupération d'une catégorie avec ses collections
    console.log('\n3️⃣ Test: Récupération d\'une catégorie avec ses collections')
    try {
      const firstCategory = await prisma.category.findFirst()
      if (firstCategory) {
        const categoryWithCollections = await prisma.category.findUnique({
          where: { id: firstCategory.id },
          include: {
            collections: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
                _count: {
                  select: {
                    products: true
                  }
                }
              }
            },
            _count: {
              select: {
                products: true,
                collections: true
              }
            }
          }
        })
        console.log(`✅ Catégorie "${categoryWithCollections.name}" avec ${categoryWithCollections.collections.length} collections`)
      } else {
        console.log('⚠️ Aucune catégorie trouvée pour le test')
      }
    } catch (error) {
      console.error('❌ Erreur lors du test de récupération:', error.message)
    }

    // Test 4: Vérification du schéma de base de données
    console.log('\n4️⃣ Test: Vérification de l\'existence des tables')
    try {
      const categories = await prisma.$queryRaw`SHOW TABLES LIKE 'Category'`
      const collections = await prisma.$queryRaw`SHOW TABLES LIKE 'Collection'`
      console.log('✅ Tables vérifiées:')
      console.log('- Category:', categories.length > 0 ? '✓' : '✗')
      console.log('- Collection:', collections.length > 0 ? '✓' : '✗')

      // Vérifier les colonnes de la table Collection
      const collectionColumns = await prisma.$queryRaw`DESCRIBE Collection`
      const hasCategoryId = collectionColumns.some(col => col.Field === 'categoryId')
      console.log('- Collection.categoryId:', hasCategoryId ? '✓' : '✗')
      
      if (!hasCategoryId) {
        console.log('\n🚨 PROBLÈME DÉTECTÉ:')
        console.log('La colonne categoryId manque dans la table Collection.')
        console.log('Solutions:')
        console.log('1. Exécutez: npx prisma db push')
        console.log('2. Ou: npx prisma migrate dev --name add-collection-category-relation')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du schéma:', error.message)
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testCategoryAPI()
  .then(() => {
    console.log('\n✅ Tests terminés!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
