'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  TrendingUp,
  Truck,
  FolderOpen,
  Tag,
  Bell,
  Search,
  Menu,
  X,
  Warehouse,
  ArrowUpDown,
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  FileText
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type NavigationItem = {
  name: string
  href: string
  icon: any
  subItems?: {
    name: string
    href: string
    icon: any
  }[]
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Commandes', href: '/orders', icon: ShoppingBag },
  { name: 'Produits', href: '/products', icon: Package },
  { 
    name: 'Inventaire', 
    href: '/inventory', 
    icon: Warehouse,
    subItems: [
      { name: 'Vue d\'ensemble', href: '/inventory', icon: Warehouse },
      { name: 'Mouvements', href: '/inventory/movements', icon: ArrowUpDown },
      { name: 'Ajustements', href: '/inventory/adjustments', icon: TrendingDown },
      { name: 'Alertes Stock', href: '/inventory/alerts', icon: AlertTriangle },
    ]
  },
  { name: 'Collections', href: '/collections', icon: FolderOpen },
  { name: 'Catégories', href: '/categories', icon: Tag },
  { name: 'Gestion de Contenu', href: '/content', icon: FileText },
  { name: 'Clients', href: '/customers', icon: Users },
  { name: 'Yalidine', href: '/yalidine', icon: Truck },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">BirkShoes Admin</h1>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl">
            <SidebarContent pathname={pathname} onNavigate={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex-1 bg-white shadow-sm border-r">
            <SidebarContent pathname={pathname} />
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex-1">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

function SidebarContent({ pathname, onNavigate }: { pathname: string, onNavigate?: () => void }) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inventaire'])
  
  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BS</span>
          </div>
          <span className="text-xl font-bold text-gray-900">BirkShoes</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-1">
        {navigation.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isExpanded = expandedItems.includes(item.name)
          const isMainActive = pathname === item.href
          const isSubActive = hasSubItems && item.subItems.some(subItem => pathname === subItem.href)
          const isActive = isMainActive || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <div key={item.name} className="space-y-1">
              {/* Main navigation item */}
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={cn(
                    "w-full relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700"
                    )}
                    size={18}
                  />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon 
                    className={cn(
                      "relative z-10 mr-3 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                    )}
                    size={18}
                  />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )}
              
              {/* Sub navigation items */}
              {hasSubItems && isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-6 space-y-1 border-l border-gray-200 pl-4"
                >
                  {item.subItems.map((subItem) => {
                    const isSubItemActive = pathname === subItem.href
                    
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={onNavigate}
                        className={cn(
                          "relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                          isSubItemActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {isSubItemActive && (
                          <motion.div
                            layoutId="activeSubTab"
                            className="absolute inset-0 bg-primary rounded-lg"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        <subItem.icon 
                          className={cn(
                            "relative z-10 mr-3 flex-shrink-0 transition-colors",
                            isSubItemActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                          )}
                          size={16}
                        />
                        <span className="relative z-10">{subItem.name}</span>
                      </Link>
                    )
                  })}
                </motion.div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User info */}
      <div className="px-6 py-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">AF</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">admin@birkshoes.store</p>
          </div>
          <Bell className="text-gray-400 hover:text-gray-600 cursor-pointer" size={18} />
        </div>
      </div>
    </div>
  )
}
