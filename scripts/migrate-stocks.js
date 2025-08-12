const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

    // PREVIEW MODE - Afficher ce qui sera fait SANS rien modifier
    console.log('\n🔍 PREVIEW - Ce qui sera modifié:')
    console.log('================================================')

    for (const product of products) {
      if (product.variants.length > 0) {
        // Produit avec variantes : stock principal = 0
        const variantsTotalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
        
        productsWithVariants++
        
        if (product.stock !== 0) {
          console.log(`📝 ${product.name}:`)
          console.log(`   • Stock actuel: ${product.stock}`)
          console.log(`   • Nouveau stock: 0 (sera mis à 0)`)
          console.log(`   • Stock des variantes: ${variantsTotalStock}`)
          console.log(`   • Total affiché sera: ${variantsTotalStock}`)
          updatedProducts++
        } else {
          console.log(`✅ ${product.name}: déjà correct (stock=0, variantes=${variantsTotalStock})`)
        }
      } else {
        // Produit sans variantes : garder le stock principal
        productsWithoutVariants++
        console.log(`ℹ️  ${product.name}: stock ${product.stock} (pas de variantes - pas de changement)`)
      }
    }

    console.log('\n================================================')
    console.log(`📊 RÉSUMÉ:`)
    console.log(`   • Produits avec variantes: ${productsWithVariants}`)
    console.log(`   • Produits sans variantes: ${productsWithoutVariants}`)
    console.log(`   • Produits qui seront mis à jour: ${updatedProducts}`)
    
    if (updatedProducts === 0) {
      console.log(`\n✅ Aucune correction nécessaire ! Votre base est déjà correcte.`)
      return
    }

    // Demander confirmation (en mode interactif)
    console.log(`\n⚠️  VOULEZ-VOUS APPLIQUER CES CHANGEMENTS ?`)
    console.log(`   Tapez "npm run migrate:apply" pour appliquer les changements`)
    console.log(`   Ou modifiez ce script pour forcer l'application`)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function applyMigration() {
  console.log('🚀 Application de la migration des stocks...')
  
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          select: { id: true, stock: true }
        }
      }
    })

    let updatedProducts = 0

    for (const product of products) {
      if (product.variants.length > 0 && product.stock !== 0) {
        const variantsTotalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
        
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: 0 }
        })
        
        updatedProducts++
        console.log(`✅ ${product.name}: stock ${product.stock} → 0 (variantes: ${variantsTotalStock})`)
      }
    }

    console.log(`\n🎉 Migration terminée avec succès !`)
    console.log(`   • ${updatedProducts} produits mis à jour`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2)
if (args.includes('--apply')) {
  applyMigration().catch(console.error)
} else {
  migrateStocks().catch(console.error)
}

module.exports = { migrateStocks, applyMigration }