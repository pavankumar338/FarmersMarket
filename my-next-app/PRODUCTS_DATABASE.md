# Product Database Documentation

## Overview
This document describes the product database structure and API endpoints for the Farmers Product marketplace application.

## Database Structure

### Firebase Realtime Database Path
```
/products
  /{productId}
    - id: string
    - name: string
    - category: 'Fruits' | 'Vegetables' | 'Grains' | 'Dairy' | 'Other'
    - price: number
    - unit: string
    - image: string (URL or emoji)
    - stock: number
    - description: string
    - farmerId: string
    - farmerName: string
    - createdAt: number (timestamp)
    - updatedAt: number (timestamp)
    - isActive: boolean
```

### Product Interface
```typescript
interface Product {
  id: string
  name: string
  category: 'Fruits' | 'Vegetables' | 'Grains' | 'Dairy' | 'Other'
  price: number
  unit: string
  image?: string
  stock: number
  description: string
  farmerId: string
  farmerName?: string
  createdAt: number
  updatedAt: number
  isActive: boolean
}
```

## API Endpoints

### 1. Get All Products
**Endpoint:** `GET /api/products`

**Query Parameters:**
- `active` (optional): Set to `true` to get only active products

**Response:**
```json
{
  "success": true,
  "products": [...]
}
```

### 2. Get Single Product
**Endpoint:** `GET /api/products/[id]`

**Response:**
```json
{
  "success": true,
  "product": {...}
}
```

### 3. Create Product
**Endpoint:** `POST /api/products`

**Request Body:**
```json
{
  "name": "Fresh Apples",
  "category": "Fruits",
  "price": 120,
  "unit": "kg",
  "stock": 500,
  "description": "Crisp and sweet farm-fresh apples",
  "farmerId": "farmer123",
  "farmerName": "John Doe",
  "image": "🍎"
}
```

**Response:**
```json
{
  "success": true,
  "productId": "abc123",
  "message": "Product created successfully"
}
```

### 4. Update Product
**Endpoint:** `PUT /api/products/[id]`

**Request Body:**
```json
{
  "price": 130,
  "stock": 450,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

### 5. Delete Product
**Endpoint:** `DELETE /api/products/[id]`

**Query Parameters:**
- `hard` (optional): Set to `true` for permanent deletion (default is soft delete)

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 6. Get Products by Category
**Endpoint:** `GET /api/products/category/[category]`

**Example:** `/api/products/category/Fruits`

**Response:**
```json
{
  "success": true,
  "category": "Fruits",
  "products": [...]
}
```

### 7. Get Products by Farmer
**Endpoint:** `GET /api/products/farmer/[farmerId]`

**Response:**
```json
{
  "success": true,
  "farmerId": "farmer123",
  "products": [...]
}
```

## Product Service Functions

The `productService.ts` file provides the following functions:

### Basic CRUD Operations
- `createProduct(productData)` - Create a new product
- `getProduct(productId)` - Get a single product by ID
- `getAllProducts()` - Get all products
- `updateProduct(productId, updates)` - Update a product
- `deleteProduct(productId, hardDelete)` - Delete or deactivate a product

### Query Functions
- `getProductsByCategory(category)` - Get products by category
- `getProductsByFarmer(farmerId)` - Get products by farmer ID
- `getActiveProducts()` - Get only active products
- `updateProductStock(productId, newStock)` - Update product stock

## Usage Examples

### Creating a Product (Client-side)
```typescript
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Fresh Mangoes',
    category: 'Fruits',
    price: 200,
    unit: 'kg',
    stock: 100,
    description: 'Sweet Alphonso mangoes',
    farmerId: 'farmer123',
    farmerName: 'Farmer Joe'
  })
})

const data = await response.json()
```

### Fetching Products (Client-side)
```typescript
// Get all active products
const response = await fetch('/api/products?active=true')
const data = await response.json()
const products = data.products

// Get products by category
const response = await fetch('/api/products/category/Fruits')
const data = await response.json()
const fruitProducts = data.products
```

### Using Product Service (Server-side)
```typescript
import { createProduct, getAllProducts } from '@/lib/productService'

// Create a product
const productId = await createProduct({
  name: 'Fresh Mangoes',
  category: 'Fruits',
  price: 200,
  unit: 'kg',
  stock: 100,
  description: 'Sweet Alphonso mangoes',
  farmerId: 'farmer123'
})

// Get all products
const products = await getAllProducts()
```

## Firebase Security Rules

Add these rules to your Firebase Realtime Database:

```json
{
  "rules": {
    "products": {
      ".read": true,
      "$productId": {
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['name', 'category', 'price', 'unit', 'stock', 'description', 'farmerId', 'isActive'])"
      }
    }
  }
}
```

## Seeding Sample Data

To populate your database with sample products, run:

```bash
npm run seed:products
```

Or manually using Node.js:

```bash
node scripts/seedProducts.js
```

## Categories

The following product categories are supported:
- Fruits
- Vegetables
- Grains
- Dairy
- Other

## Notes

1. **Soft Delete**: By default, deleting a product sets `isActive` to `false` rather than removing it from the database. This preserves historical data and order references.

2. **Timestamps**: All timestamps are stored as Unix timestamps (milliseconds since epoch).

3. **Stock Management**: The `stock` field represents the available quantity. Consider implementing inventory tracking for orders.

4. **Farmer Association**: Each product is associated with a farmer via `farmerId`. Ensure this references a valid user in your authentication system.

5. **Images**: The `image` field can store either URLs (for uploaded images) or emoji characters for quick prototyping.

## Future Enhancements

Consider adding:
- Product ratings and reviews
- Image upload functionality
- Inventory management system
- Price history tracking
- Product variants (sizes, types)
- Bulk pricing options
- Seasonal availability flags
