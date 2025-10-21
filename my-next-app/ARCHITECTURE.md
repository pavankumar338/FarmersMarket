# Product Database System Architecture

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Next.js)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ ProductsWithDB   │  │ AddProductForm   │  │ FarmerProducts│ │
│  │  Component       │  │   Component      │  │  List Component│ │
│  │                  │  │                  │  │                │ │
│  │ - Display all    │  │ - Add new        │  │ - Manage own  │ │
│  │ - Filter by cat. │  │ - Validation     │  │ - Update stock│ │
│  │ - Add to cart    │  │ - Submit form    │  │ - Toggle active│ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬───────┘ │
│           │                     │                      │         │
│           └─────────────────────┼──────────────────────┘         │
│                                 │                                │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                                  │ HTTP Requests
                                  │
┌─────────────────────────────────┼────────────────────────────────┐
│                                 ▼                                │
│                    API ROUTES (Next.js API)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /api/products/                                                 │
│  ├── GET    → Get all products (with ?active=true filter)      │
│  └── POST   → Create new product                               │
│                                                                 │
│  /api/products/[id]/                                           │
│  ├── GET    → Get single product                               │
│  ├── PUT    → Update product                                   │
│  └── DELETE → Delete/deactivate product                        │
│                                                                 │
│  /api/products/category/[category]/                            │
│  └── GET    → Get products by category                         │
│                                                                 │
│  /api/products/farmer/[farmerId]/                              │
│  └── GET    → Get products by farmer                           │
│                                                                 │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                                  │ Function Calls
                                  │
┌─────────────────────────────────┼────────────────────────────────┐
│                                 ▼                                │
│                    SERVICE LAYER (productService.ts)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Business Logic Functions:                                      │
│  ├── createProduct(productData)                                │
│  ├── getProduct(productId)                                     │
│  ├── getAllProducts()                                          │
│  ├── getActiveProducts()                                       │
│  ├── getProductsByCategory(category)                           │
│  ├── getProductsByFarmer(farmerId)                             │
│  ├── updateProduct(productId, updates)                         │
│  ├── deleteProduct(productId, hardDelete)                      │
│  └── updateProductStock(productId, newStock)                   │
│                                                                 │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                                  │ Firebase SDK Calls
                                  │
┌─────────────────────────────────┼────────────────────────────────┐
│                                 ▼                                │
│                FIREBASE REALTIME DATABASE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /products/                                                     │
│    ├── {productId1}/                                           │
│    │   ├── id: "abc123"                                        │
│    │   ├── name: "Fresh Apples"                                │
│    │   ├── category: "Fruits"                                  │
│    │   ├── price: 120                                          │
│    │   ├── unit: "kg"                                          │
│    │   ├── stock: 500                                          │
│    │   ├── description: "..."                                  │
│    │   ├── farmerId: "farmer1"                                 │
│    │   ├── farmerName: "John"                                  │
│    │   ├── image: "🍎"                                         │
│    │   ├── createdAt: 1698765432000                            │
│    │   ├── updatedAt: 1698765432000                            │
│    │   └── isActive: true                                      │
│    │                                                            │
│    ├── {productId2}/                                           │
│    │   └── ...                                                 │
│    │                                                            │
│    └── {productId3}/                                           │
│        └── ...                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### 1️⃣ Displaying Products (Read Operation)

```
User visits /products
        ↓
ProductsWithDatabase component mounts
        ↓
useEffect() → fetch('/api/products?active=true')
        ↓
API Route: GET /api/products/route.ts
        ↓
Service: getActiveProducts()
        ↓
Firebase: query(ref(database, 'products'), orderByChild('isActive'), equalTo(true))
        ↓
Firebase returns product data
        ↓
Service returns Product[]
        ↓
API returns JSON response
        ↓
Component updates state
        ↓
UI displays products
```

### 2️⃣ Adding a Product (Create Operation)

```
Farmer fills form in AddProductForm
        ↓
Clicks "Add Product"
        ↓
handleSubmit() → fetch('/api/products', { method: 'POST', body: {...} })
        ↓
API Route: POST /api/products/route.ts
        ↓
Validates required fields
        ↓
Service: createProduct(productData)
        ↓
Firebase: push(ref(database, 'products'))
        ↓
Firebase: set(newProductRef, product)
        ↓
Firebase generates ID and stores data
        ↓
Service returns productId
        ↓
API returns success response
        ↓
Form shows success message
        ↓
Redirects to products page
```

### 3️⃣ Updating Product Stock (Update Operation)

```
Farmer clicks "Update Stock" in dashboard
        ↓
Enters new stock quantity in prompt
        ↓
fetch('/api/products/[id]', { method: 'PUT', body: { stock: 150 } })
        ↓
API Route: PUT /api/products/[id]/route.ts
        ↓
Service: updateProduct(productId, { stock: 150 })
        ↓
Firebase: update(ref(database, 'products/{id}'), { stock: 150, updatedAt: now })
        ↓
Firebase updates the record
        ↓
Service completes successfully
        ↓
API returns success response
        ↓
Component updates local state
        ↓
UI reflects new stock value
```

## 🔄 State Management

```
┌─────────────────────────────────────────┐
│         Component State                 │
├─────────────────────────────────────────┤
│  const [products, setProducts]          │
│  const [loading, setLoading]            │
│  const [error, setError]                │
│  const [cart, setCart]                  │
│  const [selectedCategory, setCategory]  │
└─────────────────────────────────────────┘
                    ↕
        Local State Updates
                    ↕
┌─────────────────────────────────────────┐
│         Firebase Database               │
├─────────────────────────────────────────┤
│  Real-time data synchronization         │
│  Persistent storage                     │
│  Query capabilities                     │
└─────────────────────────────────────────┘
```

## 🎯 Component Hierarchy

```
App
└── SessionProvider
    └── Layout
        ├── Products Page
        │   └── ProductsWithDatabase
        │       ├── Category Filters
        │       ├── Product Grid
        │       │   └── Product Cards
        │       └── Shopping Cart Summary
        │
        ├── Farmer Dashboard
        │   └── FarmerProductsList
        │       ├── Stats Summary
        │       ├── Action Buttons
        │       └── Products Table
        │           └── Product Rows
        │
        └── Add Product Page
            └── AddProductForm
                ├── Input Fields
                ├── Validation
                └── Submit Handler
```

## 🔐 Security & Permissions

```
┌──────────────────────────────────────────────────────┐
│              Firebase Database Rules                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  products/                                           │
│    .read: true              ← Anyone can read        │
│    $productId/                                       │
│      .write: "auth != null" ← Only auth users write  │
│      .validate: [required fields check]              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 📦 Type System

```
┌────────────────────────────────────────┐
│        TypeScript Types                │
├────────────────────────────────────────┤
│                                        │
│  Product (Full object)                 │
│    ↓                                   │
│  CreateProductInput (For creation)     │
│    ↓                                   │
│  UpdateProductInput (For updates)      │
│                                        │
│  Type safety throughout the stack      │
│                                        │
└────────────────────────────────────────┘
```

## 🚀 Request/Response Flow Example

### GET Request
```
GET /api/products?active=true

Response:
{
  "success": true,
  "products": [
    {
      "id": "abc123",
      "name": "Fresh Apples",
      "category": "Fruits",
      "price": 120,
      "unit": "kg",
      "stock": 500,
      ...
    }
  ]
}
```

### POST Request
```
POST /api/products
Content-Type: application/json

{
  "name": "Fresh Apples",
  "category": "Fruits",
  "price": 120,
  "unit": "kg",
  "stock": 500,
  "description": "Crisp and sweet",
  "farmerId": "farmer123",
  "farmerName": "John Doe",
  "image": "🍎"
}

Response:
{
  "success": true,
  "productId": "abc123",
  "message": "Product created successfully"
}
```

## 🎨 UI Components Structure

```
ProductsWithDatabase
├── Header Section
│   ├── Title
│   └── Description
├── Cart Summary (conditional)
│   ├── Item count
│   ├── Total price
│   └── Checkout button
├── Category Filters
│   └── Filter buttons
└── Products Grid
    └── Product Cards (map)
        ├── Image
        ├── Name & Category
        ├── Description
        ├── Price & Unit
        ├── Stock info
        └── Add to Cart button
```

---

This architecture provides:
- ✅ **Separation of Concerns**: UI → API → Service → Database
- ✅ **Type Safety**: TypeScript throughout
- ✅ **Scalability**: Easy to add new features
- ✅ **Maintainability**: Clear structure and organization
- ✅ **Security**: Firebase rules for access control
- ✅ **Real-time Capability**: Firebase Realtime Database
- ✅ **RESTful Design**: Standard HTTP methods
