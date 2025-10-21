export interface Product {
  id: string
  name: string
  category: 'Fruits' | 'Vegetables' | 'Grains' | 'Dairy' | 'Other'
  price: number
  unit: string
  image?: string // URL or emoji
  stock: number
  description: string
  farmerId: string // Reference to the farmer who added this product
  farmerName?: string
  createdAt: number
  updatedAt: number
  isActive: boolean
}

export interface CreateProductInput {
  name: string
  category: Product['category']
  price: number
  unit: string
  image?: string
  stock: number
  description: string
  farmerId: string
  farmerName?: string
}

export interface UpdateProductInput {
  name?: string
  category?: Product['category']
  price?: number
  unit?: string
  image?: string
  stock?: number
  description?: string
  isActive?: boolean
}
