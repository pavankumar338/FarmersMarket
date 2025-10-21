import { database } from './firebase'
import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database'
import { Product, CreateProductInput, UpdateProductInput } from '@/types/product'

const PRODUCTS_PATH = 'products'

/**
 * Create a new product in the database
 */
export async function createProduct(productData: CreateProductInput): Promise<string> {
  try {
    const productsRef = ref(database, PRODUCTS_PATH)
    const newProductRef = push(productsRef)
    const productId = newProductRef.key

    if (!productId) {
      throw new Error('Failed to generate product ID')
    }

    const product: Product = {
      id: productId,
      ...productData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
      description: productData.description ?? "",
    }

    await set(newProductRef, product)
    return productId
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const productRef = ref(database, `${PRODUCTS_PATH}/${productId}`)
    const snapshot = await get(productRef)

    if (snapshot.exists()) {
      return snapshot.val() as Product
    }
    return null
  } catch (error) {
    console.error('Error getting product:', error)
    throw error
  }
}

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = ref(database, PRODUCTS_PATH)
    const snapshot = await get(productsRef)

    if (snapshot.exists()) {
      const productsData = snapshot.val()
      return Object.values(productsData) as Product[]
    }
    return []
  } catch (error) {
    console.error('Error getting products:', error)
    throw error
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const productsRef = ref(database, PRODUCTS_PATH)
    const categoryQuery = query(productsRef, orderByChild('category'), equalTo(category))
    const snapshot = await get(categoryQuery)

    if (snapshot.exists()) {
      const productsData = snapshot.val()
      return Object.values(productsData) as Product[]
    }
    return []
  } catch (error) {
    console.error('Error getting products by category:', error)
    throw error
  }
}

/**
 * Get products by farmer ID
 */
export async function getProductsByFarmer(farmerId: string): Promise<Product[]> {
  try {
    const productsRef = ref(database, PRODUCTS_PATH)
    const farmerQuery = query(productsRef, orderByChild('farmerId'), equalTo(farmerId))
    const snapshot = await get(farmerQuery)

    if (snapshot.exists()) {
      const productsData = snapshot.val()
      return Object.values(productsData) as Product[]
    }
    return []
  } catch (error) {
    console.error('Error getting products by farmer:', error)
    throw error
  }
}

/**
 * Update a product
 */
export async function updateProduct(productId: string, updates: UpdateProductInput): Promise<void> {
  try {
    const productRef = ref(database, `${PRODUCTS_PATH}/${productId}`)
    
    const updateData = {
      ...updates,
      updatedAt: Date.now(),
    }

    await update(productRef, updateData)
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

/**
 * Delete a product (soft delete by setting isActive to false)
 */
export async function deleteProduct(productId: string, hardDelete: boolean = false): Promise<void> {
  try {
    const productRef = ref(database, `${PRODUCTS_PATH}/${productId}`)
    
    if (hardDelete) {
      await remove(productRef)
    } else {
      // Soft delete
      await update(productRef, {
        isActive: false,
        updatedAt: Date.now(),
      })
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

/**
 * Update product stock
 */
export async function updateProductStock(productId: string, newStock: number): Promise<void> {
  try {
    const productRef = ref(database, `${PRODUCTS_PATH}/${productId}`)
    await update(productRef, {
      stock: newStock,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Error updating product stock:', error)
    throw error
  }
}

/**
 * Get active products only
 */
export async function getActiveProducts(): Promise<Product[]> {
  try {
    const productsRef = ref(database, PRODUCTS_PATH)
    const activeQuery = query(productsRef, orderByChild('isActive'), equalTo(true))
    const snapshot = await get(activeQuery)

    if (snapshot.exists()) {
      const productsData = snapshot.val()
      return Object.values(productsData) as Product[]
    }
    return []
  } catch (error) {
    console.error('Error getting active products:', error)
    throw error
  }
}
