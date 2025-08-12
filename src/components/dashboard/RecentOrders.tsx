'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Eye, Edit, Truck } from "lucide-react"
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils"
import Link from "next/link"

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: Date
}

// Données fictives - à remplacer par un appel API
const mockOrders: RecentOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-240811-001',
    customerName: 'Ahmed Benali',
    total: 8500,
    status: 'PENDING',
    createdAt: new Date('2024-08-11T10:30:00')
  },
  {
    id: '2',
    orderNumber: 'ORD-240811-002',
    customerName: 'Fatima Khaled',
    total: 12300,
    status: 'CONFIRMED',
    createdAt: new Date('2024-08-11T09:15:00')
  },
  {
    id: '3',
    orderNumber: 'ORD-240810-045',
    customerName: 'Mohamed Saidi',
    total: 6750,
    status: 'SHIPPED',
    createdAt: new Date('2024-08-10T16:20:00')
  },
  {
    id: '4',
    orderNumber: 'ORD-240810-044',
    customerName: 'Amina Boudjema',
    total: 9200,
    status: 'DELIVERED',
    createdAt: new Date('2024-08-10T14:45:00')
  },
  {
    id: '5',
    orderNumber: 'ORD-240810-043',
    customerName: 'Youcef Mammeri',
    total: 5400,
    status: 'CANCELLED',
    createdAt: new Date('2024-08-10T11:30:00')
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'SHIPPED':
      return <Truck size={14} />
    case 'DELIVERED':
      return <Eye size={14} />
    default:
      return null
  }
}

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

export function RecentOrders() {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Commandes récentes</CardTitle>
        <Link 
          href="/orders" 
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Voir toutes
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {order.orderNumber.split('-')[2]}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {order.orderNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </div>
                  <Badge 
                    className={`${getOrderStatusColor(order.status)} text-xs`}
                    variant="secondary"
                  >
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </Badge>
                </div>
                
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/orders/${order.id}`}
                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                  >
                    <Eye size={16} />
                  </Link>
                  <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {mockOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="text-gray-400" size={24} />
            </div>
            <p>Aucune commande récente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
