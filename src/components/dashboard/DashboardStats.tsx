'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Clock,
  AlertTriangle
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  description?: string
}

function StatsCard({ title, value, change, changeType = 'neutral', icon, description }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
            {title}
          </CardTitle>
          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
            {change !== undefined && (
              <div className={`flex items-center space-x-1 text-sm ${
                changeType === 'positive' ? 'text-green-600' : 
                changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {changeType === 'positive' && <TrendingUp size={16} />}
                {changeType === 'negative' && <TrendingDown size={16} />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 to-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </Card>
    </motion.div>
  )
}

export function DashboardStats() {
  // Ces données seraient récupérées via API
  const stats = {
    totalRevenue: 245680,
    totalOrders: 1234,
    pendingOrders: 23,
    lowStockProducts: 5,
    todayOrders: 47,
    weekRevenue: 45230,
    conversionRate: 3.2,
    avgOrderValue: 4560
  }

  const statsCards = [
    {
      title: "Chiffre d'affaires total",
      value: formatPrice(stats.totalRevenue),
      change: 12.5,
      changeType: 'positive' as const,
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      description: "Ce mois"
    },
    {
      title: "Commandes totales",
      value: stats.totalOrders.toLocaleString(),
      change: 8.2,
      changeType: 'positive' as const,
      icon: <ShoppingCart className="h-4 w-4 text-blue-600" />,
      description: "Toutes les commandes"
    },
    {
      title: "Commandes en attente",
      value: stats.pendingOrders,
      change: -5.1,
      changeType: 'negative' as const,
      icon: <Clock className="h-4 w-4 text-orange-600" />,
      description: "À traiter"
    },
    {
      title: "Stock faible",
      value: stats.lowStockProducts,
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
      description: "Produits à réapprovisionner"
    },
    {
      title: "Commandes aujourd'hui",
      value: stats.todayOrders,
      change: 15.3,
      changeType: 'positive' as const,
      icon: <Package className="h-4 w-4 text-purple-600" />,
      description: "Nouvelles commandes"
    },
    {
      title: "Valeur panier moyenne",
      value: formatPrice(stats.avgOrderValue),
      change: 3.7,
      changeType: 'positive' as const,
      icon: <Users className="h-4 w-4 text-indigo-600" />,
      description: "Par commande"
    }
  ]

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <StatsCard {...stat} />
        </motion.div>
      ))}
    </div>
  )
}
