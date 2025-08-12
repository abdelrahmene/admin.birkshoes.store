import { prisma } from '@/lib/prisma'
import { recalculateProductStock } from '@/lib/stock-utils'

/**
 * Script de migration pour corriger la logique des stocks
 * Exécuter une seule fois après le déploiement
 */
async function migrateStocks() {
  console.log('🚀 Début de la migration des stocks...')
  
  try {
    // Récupérer tous les produits avec leurs variantes
    const products = await prisma.product.findMany({
      include: {
        variants: {
          select: { id: true, stock: true }
        }
      }
    })

    console.log(`📦 ${products.length} produits trouvés`)

    let updatedProducts = 0
    let productsWithVariants = 0
    let productsWithoutVariants = 0

    for (const product of products) {
      if (product.variants.length > 0) {
        // Produit avec variantes : stock principal = 0
        const variantsTotalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
        
        if (product.stock !== 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: 0 }
          })
          updatedProducts++
          console.log(`✅ ${product.name}: stock ${product.stock} → 0 (variantes: ${variantsTotalStock})`)
        }
        
        productsWithVariants++
      } else {
        // Produit sans variantes : garder le stock principal
        productsWithoutVariants++
        console.log(`ℹ️  ${product.name}: stock ${product.stock} (pas de variantes)`)
      }
    }

    console.log(`\n📊 RÉSULTATS:`)
    console.log(`   • Produits avec variantes: ${productsWithVariants}`)
    console.log(`   • Produits sans variantes: ${productsWithoutVariants}`)
    console.log(`   • Produits mis à jour: ${updatedProducts}`)
    console.log(`\n✅ Migration terminée avec succès !`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration si ce fichier est appelé directement
if (require.main === module) {
  migrateStocks().catch(console.error)
}

export { migrateStocks }