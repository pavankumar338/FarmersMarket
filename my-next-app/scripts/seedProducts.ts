/**
 * Seed Script for Products Database
 * 
 * This script populates the Firebase Realtime Database with sample products.
 * Run this after setting up your Firebase configuration.
 * 
 * Usage: node scripts/seedProducts.js
 */

import { adminDb } from '../src/lib/firebaseAdmin.js'
import { CreateProductInput } from '../src/types/product.js'
import { Product } from '../src/types/product.js'

const sampleProducts: CreateProductInput[] = [
  // Fruits
  { 
    name: "Fresh Apples", 
    category: "Fruits" as const, 
    price: 120, 
    unit: "kg", 
    image: "🍎", 
    stock: 500, 
    description: "Crisp and sweet farm-fresh apples",
    farmerId: "farmer1",
    farmerName: "Ram Kumar"
  },
  { 
    name: "Bananas", 
    category: "Fruits" as const, 
    price: 40, 
    unit: "dozen", 
    image: "🍌", 
    stock: 800, 
    description: "Ripe yellow bananas rich in potassium",
    farmerId: "farmer1",
    farmerName: "Ram Kumar"
  },
  { 
    name: "Oranges", 
    category: "Fruits" as const, 
    price: 80, 
    unit: "kg", 
    image: "🍊", 
    stock: 600, 
    description: "Juicy oranges packed with Vitamin C",
    farmerId: "farmer2",
    farmerName: "Priya Sharma"
  },
  { 
    name: "Grapes", 
    category: "Fruits" as const, 
    price: 150, 
    unit: "kg", 
    image: "🍇", 
    stock: 300, 
    description: "Sweet seedless grapes",
    farmerId: "farmer2",
    farmerName: "Priya Sharma"
  },
  
  // Vegetables
  { 
    name: "Tomatoes", 
    category: "Vegetables" as const, 
    price: 30, 
    unit: "kg", 
    image: "🍅", 
    stock: 1000, 
    description: "Fresh red tomatoes for salads and cooking",
    farmerId: "farmer3",
    farmerName: "Suresh Patel"
  },
  { 
    name: "Carrots", 
    category: "Vegetables" as const, 
    price: 25, 
    unit: "kg", 
    image: "🥕", 
    stock: 700, 
    description: "Crunchy organic carrots",
    farmerId: "farmer3",
    farmerName: "Suresh Patel"
  },
  { 
    name: "Potatoes", 
    category: "Vegetables" as const, 
    price: 20, 
    unit: "kg", 
    image: "🥔", 
    stock: 1500, 
    description: "Fresh potatoes ideal for all dishes",
    farmerId: "farmer1",
    farmerName: "Ram Kumar"
  },
  { 
    name: "Onions", 
    category: "Vegetables" as const, 
    price: 25, 
    unit: "kg", 
    image: "🧅", 
    stock: 900, 
    description: "High-quality onions",
    farmerId: "farmer2",
    farmerName: "Priya Sharma"
  },
  { 
    name: "Broccoli", 
    category: "Vegetables" as const, 
    price: 60, 
    unit: "kg", 
    image: "🥦", 
    stock: 400, 
    description: "Nutritious green broccoli",
    farmerId: "farmer3",
    farmerName: "Suresh Patel"
  },
  
  // Grains
  { 
    name: "Rice (Basmati)", 
    category: "Grains" as const, 
    price: 70, 
    unit: "kg", 
    image: "🌾", 
    stock: 2000, 
    description: "Premium basmati rice",
    farmerId: "farmer1",
    farmerName: "Ram Kumar"
  },
  { 
    name: "Wheat Flour", 
    category: "Grains" as const, 
    price: 40, 
    unit: "kg", 
    image: "🌾", 
    stock: 1800, 
    description: "Fresh ground wheat flour",
    farmerId: "farmer2",
    farmerName: "Priya Sharma"
  },
  { 
    name: "Lentils (Dal)", 
    category: "Grains" as const, 
    price: 100, 
    unit: "kg", 
    image: "🌾", 
    stock: 1200, 
    description: "Protein-rich lentils",
    farmerId: "farmer3",
    farmerName: "Suresh Patel"
  },
  
  // Dairy
  { 
    name: "Fresh Milk", 
    category: "Dairy" as const, 
    price: 50, 
    unit: "litre", 
    image: "🥛", 
    stock: 500, 
    description: "Pure farm-fresh milk",
    farmerId: "farmer1",
    farmerName: "Ram Kumar"
  },
  { 
    name: "Paneer", 
    category: "Dairy" as const, 
    price: 200, 
    unit: "kg", 
    image: "🧈", 
    stock: 200, 
    description: "Fresh homemade paneer",
    farmerId: "farmer2",
    farmerName: "Priya Sharma"
  },
  { 
    name: "Yogurt", 
    category: "Dairy" as const, 
    price: 60, 
    unit: "kg", 
    image: "🥛", 
    stock: 400, 
    description: "Creamy fresh yogurt",
    farmerId: "farmer3",
    farmerName: "Suresh Patel"
  },
]

async function seedProducts() {
  console.log('🌱 Starting to seed products...')
  
  if (!adminDb) {
    console.error('❌ Firebase Admin not initialized. Check your environment variables.')
    console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL')
    process.exit(1)
  }
  
  let successCount = 0
  let errorCount = 0

  const productsRef = adminDb.ref('products')

  for (const product of sampleProducts) {
    try {
      const newProductRef = productsRef.push()
      const productId = newProductRef.key

      if (!productId) {
        throw new Error('Failed to generate product ID')
      }

      const productWithMetadata: Product = {
        id: productId,
        ...product,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        description: product.description || "",
      }

      await newProductRef.set(productWithMetadata)
      console.log(`✅ Created: ${product.name} (ID: ${productId})`)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to create: ${product.name}`, error)
      errorCount++
    }
  }

  console.log('\n📊 Seeding Summary:')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)
  console.log(`   📦 Total: ${sampleProducts.length}`)
}

// Run the seed function
seedProducts()
  .then(() => {
    console.log('\n✨ Seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error)
    process.exit(1)
  })
