import { apiClient } from '@/lib/api'

/**
 * Recalcule automatiquement le stock d'un produit basé sur ses variantes
 * Si le produit a des variantes, product.stock = 0 (le stock total = somme des variantes)
 * Si le produit n'a pas de variantes, product.stock reste inchangé
 */
export async function recalculateProductStock(productId: string) {
  try {
    // Appeler l'API backend pour recalculer le stock
    const result = await apiClient.post('/inventory/recalculate-stock', {
      productId
    })

    return result
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