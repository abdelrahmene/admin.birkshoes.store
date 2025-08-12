import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: params.id
      },
      include: {
        orders: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: true,
                    price: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { message: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Calculate total spent
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)

    return NextResponse.json({
      ...customer,
      totalSpent
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du client' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      wilaya,
      commune,
      address
    } = body

    const customer = await prisma.customer.update({
      where: {
        id: params.id
      },
      data: {
        firstName,
        lastName,
        email,
        phone,
        wilaya,
        commune,
        address
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          select: {
            total: true
          }
        }
      }
    })

    // Calculate total spent
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)

    return NextResponse.json({
      ...customer,
      totalSpent
    })
  } catch (error: any) {
    console.error('Error updating customer:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Client non trouvé' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Un client avec cet email existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if customer has orders
    const customerWithOrders = await prisma.customer.findUnique({
      where: {
        id: params.id
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!customerWithOrders) {
      return NextResponse.json(
        { message: 'Client non trouvé' },
        { status: 404 }
      )
    }

    if (customerWithOrders._count.orders > 0) {
      return NextResponse.json(
        {
          message: `Impossible de supprimer ce client car il a ${customerWithOrders._count.orders} commandes.`
        },
        { status: 400 }
      )
    }

    await prisma.customer.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({
      message: 'Client supprimé avec succès'
    })
  } catch (error: any) {
    console.error('Error deleting customer:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Client non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la suppression du client' },
      { status: 500 }
    )
  }
}
