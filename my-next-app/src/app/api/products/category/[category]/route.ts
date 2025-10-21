import { NextRequest, NextResponse } from 'next/server'
import { getProductsByCategory } from '@/lib/productService'

/**
 * GET /api/products/category/[category]
 * Get products by category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category: categoryParam } = await params
    const category = decodeURIComponent(categoryParam)
    const products = await getProductsByCategory(category)

    return NextResponse.json({
      success: true,
      category,
      products,
    })
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products by category' },
      { status: 500 }
    )
  }
}
