import { prisma } from '@/lib/prisma'

/**
 * Recalcule automatiquement le stock d'un produit basé sur ses variantes
 * Si le produit a des variantes, product.stock = 0 (le stock total = somme des variantes)
 * Si le produit n'a pas de variantes, product.stock reste inchangé
 */
export async function recalculateProductStock(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          select: { stock: true }
        }
      }
    })

    if (!product) {
      throw new Error(`Produit ${productId} non trouvé`)
    }

    // Si le produit a des variantes, le stock principal = 0
    if (product.variants.length > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: 0 }
      })
    }
    // Si le produit n'a pas de variantes, on laisse le stock principal tel quel

    return {
      productId,
      hasVariants: product.variants.length > 0,
      variantsTotalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      productStock: product.variants.length > 0 ? 0 : product.stock
    }
  } catch (error) {
    console.error('Erreur lors du recalcul du stock:', error)
    throw error
  }
}

/**
 * Calcule le stock total effectif d'un produit (pour l'affichage)
 */
export function calculateTotalStock(product: { stock: number, variants?: { stock: number }[] }) {
  if (product.variants && product.variants.length > 0) {
    // Si le produit a des variantes, le stock total = somme des variantes
    return product.variants.reduce((sum, variant) => sum + variant.stock, 0)
  } else {
    // Si pas de variantes, utiliser le stock du produit principal
    return product.stock
  }
}

/**
 * Détermine le statut de stock d'un produit
 */
export function getStockStatus(
  totalStock: number, 
  lowStockThreshold: number = 5
): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (totalStock === 0) {
    return 'out_of_stock'
  } else if (totalStock <= lowStockThreshold) {
    return 'low_stock'
  } else {
    return 'in_stock'
  }
}