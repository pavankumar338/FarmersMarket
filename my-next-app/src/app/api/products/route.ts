import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts, getActiveProducts, createProduct, getProductsByFarmer } from '@/lib/productService'
import type { Product } from '@/types/product';
import { CreateProductInput } from '@/types/product'

/**
 * GET /api/products
 * Get all products or active products only
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true';
    const farmerId = searchParams.get('farmerId');

    let products;
    if (farmerId) {
      products = await getProductsByFarmer(farmerId);
      if (activeOnly) {
    products = (products as Product[]).filter((p: Product) => p.isActive !== false);
      }
    } else {
      products = activeOnly ? await getActiveProducts() : await getAllProducts();
    }

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'category', 'price', 'unit', 'stock', 'description', 'farmerId']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const productData: CreateProductInput = {
      name: body.name,
      category: body.category,
      price: Number(body.price),
      unit: body.unit,
      stock: Number(body.stock),
      description: body.description,
      farmerId: body.farmerId,
      farmerName: body.farmerName,
      image: body.image,
    }

    const productId = await createProduct(productData)

    return NextResponse.json({
      success: true,
      productId,
      message: 'Product created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
