'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { SalesChart, TopProducts } from '@/components/dashboard/Charts'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bonjour, Admin ! 👋
              </h1>
              <p className="text-primary-foreground/80 text-lg">
                Voici un aperçu de votre boutique aujourd'hui
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-primary-foreground/80">
                Aujourd'hui
              </div>
              <div className="text-2xl font-bold">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts and Recent Orders */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          
          {/* Top Products - Takes 1 column */}
          <div className="lg:col-span-1">
            <TopProducts />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RecentOrders />
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors group">
                <div className="font-medium text-gray-900 group-hover:text-primary">
                  Ajouter un produit
                </div>
                <div className="text-sm text-gray-500">
                  Créer un nouveau produit
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
                <div className="font-medium text-gray-900 group-hover:text-green-700">
                  Traiter les commandes
                </div>
                <div className="text-sm text-gray-500">
                  23 en attente
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
                <div className="font-medium text-gray-900 group-hover:text-orange-700">
                  Stock faible
                </div>
                <div className="text-sm text-gray-500">
                  5 produits à réapprovisionner
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                <div className="font-medium text-gray-900 group-hover:text-purple-700">
                  Yalidine Sync
                </div>
                <div className="text-sm text-gray-500">
                  Synchroniser les expéditions
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Sidebar>
  )
}
