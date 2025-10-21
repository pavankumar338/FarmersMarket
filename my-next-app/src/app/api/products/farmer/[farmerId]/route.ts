import { NextRequest, NextResponse } from 'next/server'
import { getProductsByFarmer } from '@/lib/productService'

/**
 * GET /api/products/farmer/[farmerId]
 * Get products by farmer ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { farmerId: string } }
) {
  try {
    const farmerId = params.farmerId
    const products = await getProductsByFarmer(farmerId)

    return NextResponse.json({
      success: true,
      farmerId,
      products,
    })
  } catch (error) {
    console.error('Error fetching products by farmer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products by farmer' },
      { status: 500 }
    )
  }
}
