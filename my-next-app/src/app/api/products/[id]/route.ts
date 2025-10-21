import { NextRequest, NextResponse } from 'next/server'
import { getProduct, updateProduct, deleteProduct } from '@/lib/productService'
import { UpdateProductInput } from '@/types/product'

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const product = await getProduct(productId)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/products/[id]
 * Update a product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const body = await request.json()

    const updates: UpdateProductInput = {}
    
    if (body.name !== undefined) updates.name = body.name
    if (body.category !== undefined) updates.category = body.category
    if (body.price !== undefined) updates.price = Number(body.price)
    if (body.unit !== undefined) updates.unit = body.unit
    if (body.stock !== undefined) updates.stock = Number(body.stock)
    if (body.description !== undefined) updates.description = body.description
    if (body.image !== undefined) updates.image = body.image
    if (body.isActive !== undefined) updates.isActive = body.isActive

    await updateProduct(productId, updates)

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product (soft delete by default)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    await deleteProduct(productId, hardDelete)

    return NextResponse.json({
      success: true,
      message: `Product ${hardDelete ? 'deleted' : 'deactivated'} successfully`,
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
