'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import {
  Search,
  Users,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Star,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Ban
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  _count: {
    orders: number
  }
  totalSpent: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Erreur lors du chargement des clients')
    } finally {
      setLoading(false)
    }
  }

  const toggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        toast.success(`Client ${!currentStatus ? 'activé' : 'désactivé'} avec succès`)
        fetchCustomers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Error toggling customer status:', error)
      toast.error('Erreur lors de la modification du statut')
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && customer.isActive) ||
      (statusFilter === 'inactive' && !customer.isActive)

    return matchesSearch && matchesStatus
  })

  const activeCustomers = customers.filter(c => c.isActive).length
  const totalOrders = customers.reduce((sum, c) => sum + c._count.orders, 0)
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Sidebar>
    )
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Gérez vos clients et leurs informations</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau client
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total clients</p>
                    <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clients actifs</p>
                    <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total commandes</p>
                    <p className="text-2xl font-bold text-purple-600">{totalOrders}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {new Intl.NumberFormat('fr-DZ', {
                        style: 'currency',
                        currency: 'DZD',
                        maximumFractionDigits: 0
                      }).format(totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Rechercher un client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-0 bg-white shadow-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                  </select>
                  
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtres
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Liste des clients ({filteredCustomers.length})
                </CardTitle>
                {selectedCustomers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {selectedCustomers.length} sélectionné{selectedCustomers.length > 1 ? 's' : ''}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Actions
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCustomers(filteredCustomers.map(c => c.id))
                            } else {
                              setSelectedCustomers([])
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commandes
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total dépensé
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-blue-50 transition-colors duration-200 ${
                          selectedCustomers.includes(customer.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCustomers([...selectedCustomers, customer.id])
                              } else {
                                setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id))
                              }
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarImage src={customer.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {customer.firstName[0]}{customer.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Inscrit le {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {customer.email}
                              {customer.emailVerified && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Vérifié
                                </Badge>
                              )}
                            </div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.address && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                {customer.address.city}, {customer.address.country}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ShoppingBag className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {customer._count.orders}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat('fr-DZ', {
                              style: 'currency',
                              currency: 'DZD',
                              maximumFractionDigits: 0
                            }).format(customer.totalSpent)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={customer.isActive ? 
                              'bg-green-100 text-green-800 border-green-200' : 
                              'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {customer.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="hover:bg-yellow-50 hover:border-yellow-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={customer.isActive ? 
                                "text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300" :
                                "text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300"
                              }
                              onClick={() => toggleCustomerStatus(customer.id, customer.isActive)}
                            >
                              {customer.isActive ? <Ban className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {filteredCustomers.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
            <p className="text-gray-500">Essayez de modifier votre recherche ou créez un nouveau client.</p>
          </motion.div>
        )}

        {customers.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun client</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par ajouter votre premier client.
            </p>
            <div className="mt-6">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Sidebar>
  )
}