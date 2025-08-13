import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        collection: {
          select: {
            id: true,
            name: true
          }
        },
        variants: true,
        _count: {
          select: {
            variants: true,
            orderItems: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse images, tags and variants from JSON string
    const productWithParsedData = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      variants: product.variants?.map(variant => ({
        ...variant,
        options: variant.options ? JSON.parse(variant.options) : {}
      })) || []
    }

    return NextResponse.json(productWithParsedData)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    
    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      comparePrice,
      cost,
      sku,
      barcode,
      trackStock,
      stock,
      lowStock,
      weight,
      status,
      isActive,
      isFeatured,
      tags,
      seoTitle,
      seoDesc,
      images,
      categoryId,
      collectionId,
      hasVariants,
      variants
    } = body

    // Convert numeric fields
    const updateData: any = {
      name,
      slug,
      description,
      shortDesc,
      price: price ? parseFloat(price) : 0,
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      cost: cost ? parseFloat(cost) : null,
      sku,
      barcode,
      trackStock: trackStock ?? true,
      stock: stock ? parseInt(stock) : 0,
      lowStock: lowStock ? parseInt(lowStock) : 5,
      weight: weight ? parseFloat(weight) : null,
      status,
      isActive: isActive ?? false,
      isFeatured: isFeatured ?? false,
      seoTitle,
      seoDesc,
      categoryId: categoryId || null,
      collectionId: collectionId || null
    }

    // Handle JSON fields
    if (tags) updateData.tags = JSON.stringify(tags)
    if (images) updateData.images = JSON.stringify(images)

    // Use transaction to update product and variants
    const result = await prisma.$transaction(async (tx) => {
      // Handle variants first to calculate total stock
      let calculatedStock = updateData.stock || 0
      
      if (hasVariants && variants && Array.isArray(variants)) {
        // Delete existing variants
        await tx.productVariant.deleteMany({
          where: { productId: params.id }
        })

        // Create new variants if any and calculate total stock
        if (variants.length > 0) {
          const variantData = variants.map((variant: any) => ({
            productId: params.id,
            name: variant.name,
            sku: variant.sku || null,
            price: variant.price ? parseFloat(variant.price) : null,
            stock: parseInt(variant.stock) || 0,
            options: JSON.stringify(variant.options || {})
          }))

          await tx.productVariant.createMany({
            data: variantData
          })
          
          // FORCER le calcul automatique - ignorer le stock envoyé par le frontend
          calculatedStock = variantData.reduce((sum, v) => sum + v.stock, 0)
          console.log(`🔄 API: Stock recalculé depuis ${variantData.length} variantes = ${calculatedStock} unités`)
        } else {
          calculatedStock = 0
          console.log('🚨 API: Produit avec variantes mais aucune variante définie - stock = 0')
        }
      } else if (!hasVariants) {
        // If hasVariants is false, remove all variants and utiliser le stock manuel
        await tx.productVariant.deleteMany({
          where: { productId: params.id }
        })
        console.log(`📝 API: Produit simple - stock manuel = ${calculatedStock} unités`)
      }
      
      // TOUJOURS écraser le stock avec la valeur calculée
      updateData.stock = calculatedStock

      // Update the product
      const product = await tx.product.update({
        where: { id: params.id },
        data: updateData
      })

      // Return updated product with relations
      return await tx.product.findUnique({
        where: { id: params.id },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          collection: {
            select: {
              id: true,
              name: true
            }
          },
          variants: true
        }
      })
    })

    // Parse images, tags, and variants back for response
    const productWithParsedData = {
      ...result,
      images: result!.images ? JSON.parse(result!.images) : [],
      tags: result!.tags ? JSON.parse(result!.tags) : [],
      variants: result!.variants?.map(variant => ({
        ...variant,
        options: variant.options ? JSON.parse(variant.options) : {}
      })) || []
    }

    return NextResponse.json(productWithParsedData)
  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Un produit avec ce SKU ou slug existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if product has any orders
    const ordersCount = await prisma.orderItem.count({
      where: { productId: params.id }
    })

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders. Archive it instead.' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
