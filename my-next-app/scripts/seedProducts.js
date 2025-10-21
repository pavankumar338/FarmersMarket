/**
 * Seed Script for Products Database (CommonJS Version)
 * 
 * Run with: node scripts/seedProducts.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  // Handle escaped newlines
  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin credentials!');
    console.error('Required environment variables:');
    console.error('  - FIREBASE_PROJECT_ID');
    console.error('  - FIREBASE_CLIENT_EMAIL');
    console.error('  - FIREBASE_PRIVATE_KEY');
    console.error('  - FIREBASE_DATABASE_URL');
    console.error('\nPlease see GET_FIREBASE_ADMIN_CREDENTIALS.md for setup instructions.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL,
  });

  console.log('✅ Firebase Admin initialized successfully\n');
}

const db = admin.database();

// Sample products data
const sampleProducts = [
  // Fruits
  { 
    name: "Fresh Apples", 
    category: "Fruits", 
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
    category: "Fruits", 
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
    category: "Fruits", 
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
    category: "Fruits", 
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
    category: "Vegetables", 
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
    category: "Vegetables", 
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
    category: "Vegetables", 
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
    category: "Vegetables", 
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
    category: "Vegetables", 
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
    category: "Grains", 
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
    category: "Grains", 
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
    category: "Grains", 
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
    category: "Dairy", 
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
    category: "Dairy", 
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
    category: "Dairy", 
    price: 60, 
    unit: "kg", 
    image: "🥛", 
    stock: 400, 
    description: "Creamy fresh yogurt",
    farmerId: "farmer3",
    farmerName: "Suresh Patel"
  },
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const productsRef = db.ref('products');

  for (const product of sampleProducts) {
    try {
      const newProductRef = productsRef.push();
      const productId = newProductRef.key;

      if (!productId) {
        throw new Error('Failed to generate product ID');
      }

      const productWithMetadata = {
        id: productId,
        ...product,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
      };

      await newProductRef.set(productWithMetadata);
      console.log(`✅ Created: ${product.name} (ID: ${productId})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create: ${product.name}`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📦 Total: ${sampleProducts.length}`);
}

// Run the seed function
seedProducts()
  .then(() => {
    console.log('\n✨ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
