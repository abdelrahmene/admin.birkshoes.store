import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { firstName: { contains: search } } },
        { customer: { lastName: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
              productVariant: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Création du client s'il n'existe pas
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: data.customer.email },
          { phone: data.customer.phone }
        ]
      }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName: data.customer.firstName,
          lastName: data.customer.lastName,
          email: data.customer.email,
          phone: data.customer.phone,
          wilaya: data.customer.wilaya,
          commune: data.customer.commune,
          address: data.customer.address
        }
      })
    }

    // Calcul du total
    let subtotal = 0
    const items = []

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Produit non trouvé: ${item.productId}` },
          { status: 400 }
        )
      }

      let unitPrice = product.price
      let productVariant = null

      if (item.productVariantId) {
        productVariant = product.variants.find(v => v.id === item.productVariantId)
        if (productVariant && productVariant.price) {
          unitPrice = productVariant.price
        }
      }

      const totalPrice = unitPrice * item.quantity
      subtotal += totalPrice

      items.push({
        productId: item.productId,
        productVariantId: item.productVariantId || null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        productName: product.name,
        productSku: product.sku,
        variantOptions: productVariant?.options || null
      })
    }

    const total = subtotal + (data.shippingCost || 0)

    // Création de la commande
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        items: {
          create: items
        },
        subtotal,
        shippingCost: data.shippingCost || 0,
        total,
        status: 'PENDING',
        paymentMethod: data.paymentMethod || 'COD',
        paymentStatus: 'PENDING',
        notes: data.notes
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            productVariant: true
          }
        }
      }
    })

    // Mise à jour du stock
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })

      if (item.productVariantId) {
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      // Enregistrement du mouvement de stock
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: -item.quantity,
          reason: 'Commande',
          reference: order.id
        }
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}
