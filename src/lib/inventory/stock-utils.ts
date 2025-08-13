// ================================================
// 📦 SYSTÈME D'INVENTAIRE UNIFIÉ - BIRKSHOES ADMIN
// ================================================
// Cette fonction centralise TOUTE la logique de calcul des stocks
// pour éviter les incohérences entre les différentes pages et APIs

export interface ProductWithVariants {
  id: string
  name: string
  stock: number
  lowStock: number
  price: number
  cost?: number | null
  trackStock: boolean
  variants: {
    id: string
    name: string
    stock: number
    sku?: string | null
  }[]
}

export interface StockCalculationResult {
  totalStock: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  stockValue: number
  hasVariants: boolean
  variantStockSum: number
}

/**
 * 🎯 RÈGLE UNIQUE DE CALCUL DU STOCK
 * ================================
 * 
 * Produit AVEC variantes → Stock total = Somme des stocks des variantes (ignorer product.stock)
 * Produit SANS variantes → Stock total = product.stock
 * 
 * Cette règle doit être appliquée PARTOUT dans l'application
 */
export function calculateProductStock(product: ProductWithVariants): StockCalculationResult {
  const hasVariants = product.variants.length > 0
  const variantStockSum = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
  
  // 🔥 LOGIQUE PRINCIPALE
  const totalStock = hasVariants ? variantStockSum : product.stock
  
  // Calculer le statut du stock
  let status: 'in_stock' | 'low_stock' | 'out_of_stock'
  if (totalStock === 0) {
    status = 'out_of_stock'
  } else if (totalStock <= product.lowStock) {
    status = 'low_stock'
  } else {
    status = 'in_stock'
  }
  
  // Calculer la valeur du stock
  const stockValue = totalStock * (product.cost || product.price)
  
  return {
    totalStock,
    status,
    stockValue,
    hasVariants,
    variantStockSum
  }
}

/**
 * 📊 Calculer les statistiques globales d'inventaire
 */
export function calculateInventoryStats(products: ProductWithVariants[]) {
  const results = products.map(product => calculateProductStock(product))
  
  const stats = {
    totalProducts: products.length,
    totalStock: results.reduce((sum, result) => sum + result.totalStock, 0),
    totalValue: results.reduce((sum, result) => sum + result.stockValue, 0),
    lowStockProducts: results.filter(r => r.status === 'low_stock').length,
    outOfStockProducts: results.filter(r => r.status === 'out_of_stock').length,
    inStockProducts: results.filter(r => r.status === 'in_stock').length,
    productsWithVariants: results.filter(r => r.hasVariants).length,
    productsWithoutVariants: results.filter(r => !r.hasVariants).length
  }
  
  return stats
}

/**
 * 🎨 Obtenir la couleur et le badge du statut de stock
 */
export function getStockStatusDisplay(status: 'in_stock' | 'low_stock' | 'out_of_stock') {
  switch (status) {
    case 'in_stock':
      return {
        label: 'En stock',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        badgeClass: 'bg-green-100 text-green-800'
      }
    case 'low_stock':
      return {
        label: 'Stock faible',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        badgeClass: 'bg-orange-100 text-orange-800'
      }
    case 'out_of_stock':
      return {
        label: 'Rupture',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        badgeClass: 'bg-red-100 text-red-800'
      }
  }
}

/**
 * 🔄 Synchroniser le stock principal avec les variantes
 * (Pour les produits avec variantes uniquement)
 */
export function shouldUpdateProductStock(product: ProductWithVariants): {
  shouldUpdate: boolean
  newStock: number
  reason?: string
} {
  if (product.variants.length === 0) {
    return { shouldUpdate: false, newStock: product.stock }
  }
  
  const variantStockSum = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
  
  if (product.stock !== 0) {
    // Le produit a des variantes mais son stock principal n'est pas à 0
    return {
      shouldUpdate: true,
      newStock: 0,
      reason: `Produit avec variantes - stock principal mis à 0 (stock réel: ${variantStockSum} depuis les variantes)`
    }
  }
  
  return { shouldUpdate: false, newStock: 0 }
}

/**
 * 💰 Formater le prix en devise algérienne
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * 📈 Obtenir l'icône de mouvement de stock
 */
export function getStockMovementIcon(type: 'IN' | 'OUT' | 'ADJUSTMENT') {
  switch (type) {
    case 'IN':
      return { icon: 'TrendingUp', color: 'text-green-600' }
    case 'OUT':
      return { icon: 'TrendingDown', color: 'text-red-600' }
    case 'ADJUSTMENT':
      return { icon: 'RefreshCw', color: 'text-blue-600' }
  }
}
