export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  todayOrders: number
  weekOrders: number
  monthRevenue: number
  conversionRate: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: Date
}

export interface TopProduct {
  id: string
  name: string
  totalSold: number
  revenue: number
  image?: string
}

export interface SalesChart {
  date: string
  orders: number
  revenue: number
}

export interface OrderWithDetails {
  id: string
  orderNumber: string
  customer: {
    firstName: string
    lastName: string
    phone: string
    wilaya: string
    commune: string
    address: string
  }
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    variantOptions?: string
  }>
  subtotal: number
  shippingCost: number
  total: number
  status: string
  paymentStatus: string
  createdAt: Date
  confirmedAt?: Date
  shippedAt?: Date
  deliveredAt?: Date
}

export interface ProductWithVariants {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  stock: number
  status: string
  images?: string[]
  category?: {
    id: string
    name: string
  }
  collection?: {
    id: string
    name: string
  }
  variants: Array<{
    id: string
    name: string
    price?: number
    stock: number
    options: Record<string, string>
  }>
  createdAt: Date
  updatedAt: Date
}

export interface YalidineParcel {
  id: string
  tracking: string
  status: string
  from_wilaya_name: string
  to_wilaya_name: string
  to_commune_name: string
  recipient_name: string
  recipient_phone: string
  product_list: string
  freeship: boolean
  is_stopdesk: boolean
  stopdesk_id?: string
  created_at: string
  last_update: string
}

export interface WilayaCommune {
  wilaya_code: string
  wilaya_name: string
  communes: Array<{
    commune_name: string
    shipping_price: number
    shipping_price_home: number
    has_stopdesk: boolean
  }>
}
