import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))

    // Requêtes parallèles pour les statistiques
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      todayOrders,
      weekOrders,
      monthRevenue,
      recentOrders
    ] = await Promise.all([
      // Total des commandes
      prisma.order.count(),
      
      // Chiffre d'affaires total
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ['CANCELLED'] } }
      }),
      
      // Commandes en attente
      prisma.order.count({
        where: { status: 'PENDING' }
      }),
      
      // Produits avec stock faible
      prisma.product.count({
        where: {
          stock: { lte: prisma.product.fields.lowStock }
        }
      }),
      
      // Commandes aujourd'hui
      prisma.order.count({
        where: { createdAt: { gte: startOfDay } }
      }),
      
      // Commandes cette semaine
      prisma.order.count({
        where: { createdAt: { gte: startOfWeek } }
      }),
      
      // Chiffre d'affaires du mois
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfMonth },
          status: { notIn: ['CANCELLED'] }
        }
      }),
      
      // Commandes récentes
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true
        }
      })
    ])

    // Graphique des ventes des 30 derniers jours
    const salesData = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND status NOT IN ('CANCELLED')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Produits les plus vendus
    const topProducts = await prisma.$queryRaw`
      SELECT 
        p.name,
        p.id,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('CANCELLED')
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      lowStockProducts,
      todayOrders,
      weekOrders,
      monthRevenue: monthRevenue._sum.total || 0,
      conversionRate: totalOrders > 0 ? ((totalOrders - pendingOrders) / totalOrders * 100) : 0
    }

    return NextResponse.json({
      stats,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      })),
      salesData,
      topProducts
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
