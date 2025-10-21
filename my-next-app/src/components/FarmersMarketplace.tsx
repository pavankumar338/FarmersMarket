"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import Link from "next/link"
import OrderRequestModal from "./OrderRequestModal"

interface Farmer {
  id: string
  name: string
  email: string
  createdAt?: number
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  unit: string
  stock: number
  description: string
  image?: string
  farmerId: string
  farmerName?: string
}

export default function FarmersMarketplace() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const categories = ["All", "Fruits", "Vegetables", "Grains", "Dairy", "Other"]

  const handleRequestOrder = (product: Product) => {
    setSelectedProduct(product)
    setOrderModalOpen(true)
  }

  useEffect(() => {
    fetchFarmersAndProducts()
  }, [])

  const fetchFarmersAndProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const farmersList: Farmer[] = []
      const productsList: Product[] = []

      // Step 1: Fetch all users with role="farmer" from /users
      const usersRef = ref(database, "users")
      const usersSnapshot = await get(usersRef)

      if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val()
        for (const userId in usersData) {
          const user = usersData[userId]
          if (user.role === "farmer") {
            farmersList.push({
              id: userId,
              name: user.name || "Unknown Farmer",
              email: user.email || "",
              createdAt: user.createdAt || Date.now(),
            })
          }
        }
      }

      console.log("Found farmers from /users:", farmersList.length)


      // No longer fetch from /farmers/{farmerId}/products
      // All products are now in /products

      // Step 3: Also check global products collection
      const globalProductsRef = ref(database, "products")
      const globalProductsSnapshot = await get(globalProductsRef)

      if (globalProductsSnapshot.exists()) {
        const globalProducts = globalProductsSnapshot.val()
        for (const productId in globalProducts) {
          const product = globalProducts[productId]
          if (product.isActive !== false) {
            // Avoid duplicates
            if (!productsList.find(p => p.id === productId)) {
              productsList.push({
                id: productId,
                ...product,
              })
            }
          }
        }
      }

      console.log("Found products from /products:", globalProductsSnapshot.exists() ? Object.keys(globalProductsSnapshot.val()).length : 0)
      console.log("Total farmers:", farmersList.length)
      console.log("Total products:", productsList.length)

      setFarmers(farmersList)
      setAllProducts(productsList)
    } catch (err) {
      console.error("Error fetching farmers and products:", err)
      setError(`Failed to load farmers and products. Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = allProducts.filter((product) => {
    const matchesFarmer = !selectedFarmer || product.farmerId === selectedFarmer
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmerName?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFarmer && matchesCategory && matchesSearch
  })

  const getProductCountByFarmer = (farmerId: string) => {
    return allProducts.filter((p) => p.farmerId === farmerId).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farmers and products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchFarmersAndProducts}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌾 Farmers Marketplace
          </h1>
          <p className="text-lg text-gray-600">
            Browse products from {farmers.length} local farmers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 font-semibold mb-2">Total Farmers</div>
            <div className="text-3xl font-bold text-blue-600">{farmers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 font-semibold mb-2">Available Products</div>
            <div className="text-3xl font-bold text-green-600">{allProducts.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 font-semibold mb-2">Categories</div>
            <div className="text-3xl font-bold text-purple-600">{categories.length - 1}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, farmer..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Farmer Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Farmer
              </label>
              <select
                value={selectedFarmer || ""}
                onChange={(e) => setSelectedFarmer(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Farmers</option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.name} ({getProductCountByFarmer(farmer.id)} products)
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* No Farmers Message */}
        {farmers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Farmers Registered Yet</h3>
            <p className="text-gray-600 mb-4">
              There are currently no farmers registered in the system.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-left max-w-md mx-auto">
              <p className="text-sm text-blue-900 mb-2">💡 <strong>To see farmers here:</strong></p>
              <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                <li>Register as a farmer at <code className="bg-white px-1 rounded">/auth/register</code></li>
                <li>Sign in as that farmer</li>
                <li>Add some products from the farmer dashboard</li>
                <li>Come back here as organization to see them</li>
              </ol>
            </div>
            <button
              onClick={fetchFarmersAndProducts}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-4">
              {allProducts.length === 0 
                ? "Farmers haven't added any products yet." 
                : "No products match your current filters."}
            </p>
            {allProducts.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-left max-w-md mx-auto">
                <p className="text-sm text-blue-900 mb-2">💡 <strong>To see products:</strong></p>
                <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                  <li>Sign in as a farmer</li>
                  <li>Go to farmer dashboard</li>
                  <li>Click "Seed Sample Products" or add products manually</li>
                  <li>Come back here to browse them</li>
                </ol>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedFarmer(null)
                  setSelectedCategory("All")
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Showing {filteredProducts.length} product(s)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-6xl">{product.image || "📦"}</span>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap ml-2">
                        {product.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">
                        👤 Farmer: <span className="font-medium">{product.farmerName}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        📦 Stock: <span className="font-medium">{product.stock} {product.unit}</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">₹{product.price}</p>
                        <p className="text-xs text-gray-500">per {product.unit}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestOrder(product)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Request Order"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Farmers List Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 All Farmers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
                    <p className="text-sm text-gray-600">{farmer.email}</p>
                  </div>
                  <span className="text-3xl">🧑‍🌾</span>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Products Available:{" "}
                    <span className="font-semibold text-gray-900">
                      {getProductCountByFarmer(farmer.id)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFarmer(farmer.id)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 font-medium transition-colors"
                >
                  View Products
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Request Modal */}
        {selectedProduct && (
          <OrderRequestModal
            product={selectedProduct}
            isOpen={orderModalOpen}
            onClose={() => {
              setOrderModalOpen(false)
              setSelectedProduct(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
