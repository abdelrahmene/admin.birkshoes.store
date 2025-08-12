import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orders: {
          select: {
            total: true
          }
        }
      }
    })

    // Calculate total spent and order count for each customer
    const customersWithTotalSpent = customers.map(customer => ({
      ...customer,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
      _count: {
        orders: customer.orders.length
      }
    }))

    return NextResponse.json(customersWithTotalSpent)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      firstName, 
      lastName, 
      phone, 
      password,
      isActive = true,
      emailVerified = false 
    } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, prénom et nom sont requis' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un client avec cet email existe déjà' },
        { status: 400 }
      )
    }

    const customer = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        password: password || 'temp_password', // In real app, hash the password
        role: 'CUSTOMER',
        isActive,
        emailVerified
      },
      include: {
        orders: true
      }
    })

    // Don't return password in response
    const { password: _, ...customerResponse } = customer

    return NextResponse.json({
      ...customerResponse,
      totalSpent: 0,
      _count: {
        orders: 0
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating customer:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Un client avec cet email existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la création du client' },
      { status: 500 }
    )
  }
}