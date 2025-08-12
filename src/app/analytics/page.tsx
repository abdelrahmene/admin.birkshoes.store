'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Package,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area
} from 'recharts'

// Sample data - replace with real API calls
const salesData = [
  { name: 'Jan', ventes: 4000, commandes: 24, visitors: 1200 },
  { name: 'Fév', ventes: 3000, commandes: 13, visitors: 1100 },
  { name: 'Mar', ventes: 2000, commandes: 98, visitors: 800 },
  { name: 'Avr', ventes: 2780, commandes: 39, visitors: 1300 },
  { name: 'Mai', ventes: 1890, commandes: 48, visitors: 900 },
  { name: 'Jun', ventes: 2390, commandes: 38, visitors: 1000 },
  { name: 'Jul', ventes: 3490, commandes: 43, visitors: 1200 },
]

const categoryData = [
  { name: 'Sneakers', value: 400, color: '#8884d8' },
  { name: 'Boots', value: 300, color: '#82ca9d' },
  { name: 'Sandales', value: 300, color: '#ffc658' },
  { name: 'Accessoires', value: 200, color: '#ff7c7c' },
]

const topProducts = [
  { id: 1, name: 'Nike Air Max 270', sales: 145, revenue: 21750, image: '/api/placeholder/40/40' },
  { id: 2, name: 'Adidas Ultraboost', sales: 98, revenue: 19600, image: '/api/placeholder/40/40' },
  { id: 3, name: 'Puma RS-X', sales: 87, revenue: 13050, image: '/api/placeholder/40/40' },
  { id: 4, name: 'New Balance 990', sales: 76, revenue: 15200, image: '/api/placeholder/40/40' },
  { id: 5, name: 'Converse Chuck Taylor', sales: 65, revenue: 6500, image: '/api/placeholder/40/40' },
]

const recentActivity = [
  { action: 'Nouvelle commande', details: '#CMD-2024-001', time: '2 min', type: 'order' },
  { action: 'Produit ajouté', details: 'Nike Air Force 1', time: '15 min', type: 'product' },
  { action: 'Client inscrit', details: 'Mohamed Amine', time: '1h', type: 'customer' },
  { action: 'Stock mis à jour', details: 'Adidas Stan Smith', time: '2h', type: 'inventory' },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(false)

  const stats = [
    {
      title: 'Chiffre d\'affaires',
      value: '245,870',
      unit: 'DA',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      description: 'vs mois dernier'
    },
    {
      title: 'Commandes',
      value: '1,429',
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingBag,
      color: 'from-blue-500 to-cyan-600',
      description: 'nouvelles commandes'
    },
    {
      title: 'Clients',
      value: '892',
      change: '+15.3%',
      changeType: 'positive',
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      description: 'clients actifs'
    },
    {
      title: 'Conversion',
      value: '3.24%',
      change: '-0.8%',
      changeType: 'negative',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      description: 'taux de conversion'
    }
  ]

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Analyse des performances de votre boutique
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2 bg-white rounded-lg border px-3 py-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-0 text-sm font-medium focus:outline-none"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">3 derniers mois</option>
                <option value="1y">Cette année</option>
              </select>
            </div>
            
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
            
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <div className="flex items-end space-x-1">
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      {stat.unit && (
                        <p className="text-lg text-gray-500 pb-1">{stat.unit}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <LineChart className="mr-2 h-5 w-5 text-blue-600" />
                    Évolution des ventes
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +12.5%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ventes" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                  Ventes par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Top Produits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-white transition-all duration-300 border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sales} ventes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {new Intl.NumberFormat('fr-DZ', {
                            style: 'currency',
                            currency: 'DZD',
                            maximumFractionDigits: 0
                          }).format(product.revenue)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="mr-2 h-5 w-5 text-green-600" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                        activity.type === 'order' ? 'bg-blue-500' :
                        activity.type === 'product' ? 'bg-green-500' :
                        activity.type === 'customer' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}>
                        {activity.type === 'order' ? <ShoppingBag className="h-4 w-4" /> :
                         activity.type === 'product' ? <Package className="h-4 w-4" /> :
                         activity.type === 'customer' ? <Users className="h-4 w-4" /> :
                         <Eye className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.details}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.time}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="outline" size="sm" className="w-full">
                    Voir plus d'activités
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                Insights & Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold text-blue-900">Opportunité</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Vos ventes de sneakers ont augmenté de 25% ce mois-ci. 
                    Considérez augmenter le stock de cette catégorie.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-semibold text-green-900">Performance</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Excellent travail ! Votre taux de conversion a augmenté de 8% 
                    par rapport au mois dernier.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h4 className="font-semibold text-orange-900">Attention</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    5 produits sont en rupture de stock. 
                    Pensez à les réapprovisionner rapidement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Sidebar>
  )
}
