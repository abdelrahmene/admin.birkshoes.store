import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateProductStock } from '@/lib/inventory/stock-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const status = searchParams.get('status')
    
    // Construire les conditions de filtrage
    const where: any = {}
    
    if (status === 'active') {
      where.isActive = true
      where.status = 'ACTIVE'
    }
    
    const products = await prisma.product.findMany({
      where,
      take: limit,
      include: {
        category: {
          select: {
            name: true
          }
        },
        collection: {
          select: {
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Parse images from JSON string
    const productsWithImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      variants: product.variants?.map(variant => ({
        ...variant,
        options: variant.options ? JSON.parse(variant.options) : {}
      })) || []
    }))

    return NextResponse.json(productsWithImages)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Use Prisma transaction to create product and variants together
    const result = await prisma.$transaction(async (tx) => {
      // 🎯 LOGIQUE STOCK UNIFIÉE - CORRECTION MAJEURE
      let productStock = 0
      if (hasVariants && variants && Array.isArray(variants) && variants.length > 0) {
        // 🔥 PRODUIT AVEC VARIANTES: Stock principal = 0 (stock réel dans les variantes)
        productStock = 0
        const variantStockSum = variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0)
        console.log(`🎆 API CREATE: Produit avec ${variants.length} variantes - Stock principal=0, Stock réel=${variantStockSum} depuis variantes`)
      } else {
        // 📦 PRODUIT SIMPLE: Utiliser le stock envoyé
        productStock = parseInt(stock) || 0
        console.log(`📦 API CREATE: Produit simple - Stock=${productStock} unités`)
      }

      // Create the product first
      const product = await tx.product.create({
        data: {
          name,
          slug: productSlug,
          description,
          shortDesc,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          cost: cost ? parseFloat(cost) : null,
          sku,
          barcode,
          trackStock: trackStock ?? true,
          stock: productStock,
          lowStock: parseInt(lowStock) || 5,
          weight: weight ? parseFloat(weight) : null,
          status: status || 'DRAFT',
          isActive: isActive ?? false,
          isFeatured: isFeatured ?? false,
          tags: tags ? JSON.stringify(tags) : null,
          seoTitle,
          seoDesc,
          images: images ? JSON.stringify(images) : null,
          categoryId: categoryId || null,
          collectionId: collectionId || null
        }
      })

      // Create variants if provided
      if (hasVariants && variants && Array.isArray(variants) && variants.length > 0) {
        const variantData = variants.map((variant: any) => ({
          productId: product.id,
          name: variant.name,
          sku: variant.sku || null,
          price: variant.price ? parseFloat(variant.price) : null,
          stock: parseInt(variant.stock) || 0,
          options: JSON.stringify(variant.options || {})
        }))

        await tx.productVariant.createMany({
          data: variantData
        })
      }

      // Return the complete product with variants
      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: {
            select: {
              name: true
            }
          },
          collection: {
            select: {
              name: true
            }
          },
          variants: true
        }
      })
    })

    // Parse images and tags back for response
    const productWithParsedData = {
      ...result,
      images: result!.images ? JSON.parse(result!.images) : [],
      tags: result!.tags ? JSON.parse(result!.tags) : [],
      variants: result!.variants?.map(variant => ({
        ...variant,
        options: variant.options ? JSON.parse(variant.options) : {}
      })) || []
    }

    return NextResponse.json(productWithParsedData, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Un produit avec ce SKU ou slug existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, variants: newVariants, hasVariants, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price)
    if (updateData.comparePrice) updateData.comparePrice = parseFloat(updateData.comparePrice)
    if (updateData.cost) updateData.cost = parseFloat(updateData.cost)
    if (updateData.stock) updateData.stock = parseInt(updateData.stock)
    if (updateData.lowStock) updateData.lowStock = parseInt(updateData.lowStock)
    if (updateData.weight) updateData.weight = parseFloat(updateData.weight)

    // Handle JSON fields
    if (updateData.tags) updateData.tags = JSON.stringify(updateData.tags)
    if (updateData.images) updateData.images = JSON.stringify(updateData.images)

    // Use transaction to update product and handle variants
    const result = await prisma.$transaction(async (tx) => {
      // 🎯 LOGIQUE STOCK UNIFIÉE POUR LA MISE À JOUR
      if (hasVariants && newVariants && Array.isArray(newVariants) && newVariants.length > 0) {
        // 🔥 PRODUIT AVEC VARIANTES: Stock principal = 0 (stock réel dans les variantes)
        updateData.stock = 0
        const variantStockSum = newVariants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0)
        console.log(`🎆 API UPDATE: Produit avec ${newVariants.length} variantes - Stock principal=0, Stock réel=${variantStockSum}`)
      } else if (hasVariants === false) {
        // 📦 CONVERSION VERS PRODUIT SIMPLE: Garder le stock envoyé
        console.log(`📦 API UPDATE: Conversion vers produit simple - Stock=${updateData.stock || 0}`)
      }

      // Update the product
      const product = await tx.product.update({
        where: { id },
        data: updateData
      })

      // Handle variants
      if (hasVariants && newVariants && Array.isArray(newVariants)) {
        // Delete existing variants
        await tx.productVariant.deleteMany({
          where: { productId: id }
        })

        // Create new variants if provided
        if (newVariants.length > 0) {
          const variantData = newVariants.map((variant: any) => ({
            productId: id,
            name: variant.name,
            sku: variant.sku || null,
            price: variant.price ? parseFloat(variant.price) : null,
            stock: parseInt(variant.stock) || 0,
            options: JSON.stringify(variant.options || {})
          }))

          await tx.productVariant.createMany({
            data: variantData
          })
        }
      } else if (hasVariants === false) {
        // If hasVariants is explicitly set to false, delete all variants
        await tx.productVariant.deleteMany({
          where: { productId: id }
        })
      }

      // Return the updated product with variants
      return await tx.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              name: true
            }
          },
          collection: {
            select: {
              name: true
            }
          },
          variants: true
        }
      })
    })

    // Parse images and tags back for response
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
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product has any orders
    const ordersCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders. Archive it instead.' },
        { status: 400 }
      )
    }

    // Delete product (variants will be deleted automatically due to cascade)
    await prisma.product.delete({
      where: { id }
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
