# Product Database Setup - Quick Start Guide

This guide will help you set up and use the product database for the Farmers Product marketplace.

## 📋 What's Been Created

### 1. Type Definitions
- **`src/types/product.ts`** - Product interfaces and types

### 2. Database Service
- **`src/lib/productService.ts`** - All database operations for products

### 3. API Routes
- **`src/app/api/products/route.ts`** - GET all products, POST new product
- **`src/app/api/products/[id]/route.ts`** - GET, PUT, DELETE single product
- **`src/app/api/products/category/[category]/route.ts`** - GET products by category
- **`src/app/api/products/farmer/[farmerId]/route.ts`** - GET products by farmer

### 4. Components
- **`src/components/ProductsWithDatabase.tsx`** - Display products from database
- **`src/components/AddProductForm.tsx`** - Form to add new products

### 5. Utilities
- **`scripts/seedProducts.ts`** - Script to seed sample products

### 6. Documentation
- **`PRODUCTS_DATABASE.md`** - Complete API documentation

## 🚀 Quick Start

### Step 1: Ensure Firebase is Configured

Make sure your `.env.local` file has the Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
```

### Step 2: Set Up Firebase Realtime Database Rules

Go to your Firebase Console → Realtime Database → Rules and add:

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

### Step 3: Use the Components

#### Display Products Page

Update `src/app/products/page.tsx`:

```tsx
import ProductsWithDatabase from "@/components/ProductsWithDatabase"

export default function ProductsPage() {
  return <ProductsWithDatabase />
}
```

#### Add Product Page (for Farmers)

Create `src/app/farmer/products/add/page.tsx`:

```tsx
"use client"

import { useSession } from "next-auth/react"
import AddProductForm from "@/components/AddProductForm"
import { redirect } from "next/navigation"

export default function AddProductPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Assuming user ID and name are in the session
  const farmerId = session.user.id || "unknown"
  const farmerName = session.user.name || undefined

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <AddProductForm 
        farmerId={farmerId} 
        farmerName={farmerName} 
      />
    </div>
  )
}
```

## 📚 API Usage Examples

### Fetch All Active Products

```typescript
const response = await fetch('/api/products?active=true')
const data = await response.json()
console.log(data.products)
```

### Fetch Products by Category

```typescript
const response = await fetch('/api/products/category/Fruits')
const data = await response.json()
console.log(data.products)
```

### Add a New Product

```typescript
const newProduct = {
  name: "Fresh Mangoes",
  category: "Fruits",
  price: 200,
  unit: "kg",
  stock: 100,
  description: "Sweet Alphonso mangoes",
  farmerId: "farmer123",
  farmerName: "John Doe",
  image: "🥭"
}

const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newProduct)
})

const data = await response.json()
console.log(data.productId) // New product ID
```

### Update a Product

```typescript
const response = await fetch('/api/products/abc123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    price: 220,
    stock: 150
  })
})

const data = await response.json()
```

### Delete a Product (Soft Delete)

```typescript
const response = await fetch('/api/products/abc123', {
  method: 'DELETE'
})

const data = await response.json()
```

## 🌱 Seeding Sample Data (Optional)

If you want to populate your database with sample products:

### Option 1: Using the API

You can call the API from a client-side script or manually post products using Postman or similar tools.

### Option 2: Direct Database Write

Use the `productService` functions directly in a server-side script:

```typescript
import { createProduct } from '@/lib/productService'

const product = await createProduct({
  name: "Fresh Apples",
  category: "Fruits",
  price: 120,
  unit: "kg",
  stock: 500,
  description: "Crisp and sweet farm-fresh apples",
  farmerId: "farmer1",
  farmerName: "Ram Kumar",
  image: "🍎"
})
```

## 🔧 Service Functions Available

From `productService.ts`:

- `createProduct(productData)` - Create a new product
- `getProduct(productId)` - Get a single product
- `getAllProducts()` - Get all products
- `getActiveProducts()` - Get only active products
- `getProductsByCategory(category)` - Get products by category
- `getProductsByFarmer(farmerId)` - Get products by farmer
- `updateProduct(productId, updates)` - Update a product
- `deleteProduct(productId, hardDelete)` - Delete/deactivate a product
- `updateProductStock(productId, newStock)` - Update stock quantity

## 📊 Database Structure

Products are stored in Firebase Realtime Database at:

```
/products
  /{productId}
    - id: string
    - name: string
    - category: string
    - price: number
    - unit: string
    - image: string
    - stock: number
    - description: string
    - farmerId: string
    - farmerName: string
    - createdAt: number
    - updatedAt: number
    - isActive: boolean
```

## 🎨 Customization

### Add More Categories

Edit `src/types/product.ts`:

```typescript
export interface Product {
  category: 'Fruits' | 'Vegetables' | 'Grains' | 'Dairy' | 'Meat' | 'Spices' | 'Other'
  // ... rest of the fields
}
```

### Add Product Reviews

Extend the Product interface:

```typescript
export interface Product {
  // ... existing fields
  reviews?: Review[]
  rating?: number
}

interface Review {
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: number
}
```

### Add Image Upload

You can integrate Firebase Storage for actual image uploads:

1. Update the form to handle file uploads
2. Upload to Firebase Storage
3. Store the download URL in the `image` field

## 🐛 Troubleshooting

### Products Not Loading

1. Check Firebase configuration in `.env.local`
2. Verify Firebase Realtime Database is enabled
3. Check database rules allow reading
4. Open browser console for error messages

### Can't Add Products

1. Ensure user is authenticated
2. Check database rules allow writing
3. Verify all required fields are provided
4. Check Firebase Console → Realtime Database → Data

### TypeScript Errors

Make sure to import types correctly:

```typescript
import { Product } from "@/types/product"
```

## 📖 Further Reading

- See `PRODUCTS_DATABASE.md` for complete API documentation
- Check Firebase Realtime Database docs: https://firebase.google.com/docs/database
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

## ✅ Next Steps

1. ✅ Set up Firebase configuration
2. ✅ Update database rules
3. ✅ Test fetching products
4. ✅ Test adding products
5. ✅ Integrate with farmer dashboard
6. ✅ Add to organization/buyer views
7. ✅ Implement shopping cart functionality
8. ✅ Add order management

Happy coding! 🚀
