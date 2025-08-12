'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Truck,
  Download,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'

// Données fictives pour les commandes
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-240811-001',
    customer: {
      firstName: 'Ahmed',
      lastName: 'Benali',
      phone: '0555123456',
      wilaya: 'Alger',
      commune: 'Bab Ezzouar'
    },
    total: 8500,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    createdAt: new Date('2024-08-11T10:30:00'),
    items: [
      { productName: 'Sneakers Classic', quantity: 1, unitPrice: 8500 }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-240811-002',
    customer: {
      firstName: 'Fatima',
      lastName: 'Khaled',
      phone: '0666789123',
      wilaya: 'Oran',
      commune: 'Bir El Djir'
    },
    total: 12300,
    status: 'CONFIRMED',
    paymentStatus: 'PENDING',
    createdAt: new Date('2024-08-11T09:15:00'),
    items: [
      { productName: 'Boots Leather', quantity: 1, unitPrice: 12300 }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-240810-045',
    customer: {
      firstName: 'Mohamed',
      lastName: 'Saidi',
      phone: '0777456789',
      wilaya: 'Constantine',
      commune: 'El Khroub'
    },
    total: 6750,
    status: 'SHIPPED',
    paymentStatus: 'PENDING',
    createdAt: new Date('2024-08-10T16:20:00'),
    items: [
      { productName: 'Sandales d\'été', quantity: 1, unitPrice: 6750 }
    ]
  }
]

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'PROCESSING', label: 'En traitement' },
  { value: 'SHIPPED', label: 'Expédiées' },
  { value: 'DELIVERED', label: 'Livrées' },
  { value: 'CANCELLED', label: 'Annulées' },
]

function getStatusText(status: string) {
  const statusMap = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PROCESSING: 'En traitement',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
    RETURNED: 'Retournée'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
            <p className="text-gray-600 mt-1">
              Gérez toutes vos commandes en un seul endroit
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download size={16} />
              <span>Exporter</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Plus size={16} />
              <span>Nouvelle commande</span>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Rechercher par numéro, nom du client, téléphone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsLoading(!isLoading)}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  <span>Actualiser</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Liste des commandes ({filteredOrders.length})</span>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Filter size={16} />
                  <span>Filtré sur {statusFilter === 'all' ? 'tous' : statusFilter}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Commande</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Client</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Total</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Statut</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length} article{order.items.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.customer.firstName} {order.customer.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer.phone}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer.wilaya}, {order.customer.commune}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {formatPrice(order.total)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={getOrderStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-primary"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-primary"
                            >
                              <Edit size={16} />
                            </Button>
                            {order.status === 'CONFIRMED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-primary"
                              >
                                <Truck size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune commande trouvée
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Essayez de modifier vos critères de recherche'
                        : 'Commencez par créer votre première commande'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Sidebar>
  )
}
