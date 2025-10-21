"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { database } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"
import Link from "next/link"

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

interface CartItem extends Product {
  quantity: number
}

export default function EnhancedOrganizationMarketplace() {
  const { data: session } = useSession()
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCart, setShowCart] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const categories = ["All", "Fruits", "Vegetables", "Grains", "Dairy", "Other"]

  useEffect(() => {
    fetchFarmersAndProducts()
  }, [])

  const fetchFarmersAndProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const farmersList: Farmer[] = []
      const productsList: Product[] = []

      // Fetch all users with role="farmer"
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

      // Fetch products from /farmers/{farmerId}/products
      const farmersRef = ref(database, "farmers")
      const farmersSnapshot = await get(farmersRef)

      if (farmersSnapshot.exists()) {
        const farmersData = farmersSnapshot.val()

        for (const farmerId in farmersData) {
          const farmerData = farmersData[farmerId]
          
          if (farmerData.products) {
            const farmerInfo = farmersList.find(f => f.id === farmerId)
            const farmerName = farmerInfo?.name || "Unknown Farmer"

            for (const productId in farmerData.products) {
              const product = farmerData.products[productId]
              productsList.push({
                id: productId,
                name: product.name || "Unnamed Product",
                category: product.category || "Other",
                price: product.price || 0,
                unit: product.unit || "unit",
                stock: product.stock || 0,
                description: product.description || "",
                image: product.image,
                farmerId: farmerId,
                farmerName: farmerName,
              })
            }
          }
        }
      }

      setFarmers(farmersList)
      setAllProducts(productsList)
    } catch (err) {
      console.error("Error fetching farmers and products:", err)
      setError(`Failed to load data. Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const getProductsByFarmer = (farmerId: string) => {
    return allProducts.filter(p => p.farmerId === farmerId)
  }

  const filteredProducts = selectedFarmer
    ? getProductsByFarmer(selectedFarmer.id).filter((product) => {
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        const matchesSearch =
          searchTerm === "" ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
      })
    : allProducts.filter((product) => {
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        const matchesSearch =
          searchTerm === "" ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.farmerName?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
      })

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const placeOrder = async () => {
    if (!session?.user?.id || cart.length === 0) return

    try {
      // Group items by farmer
      const ordersByFarmer: { [farmerId: string]: CartItem[] } = {}
      cart.forEach(item => {
        if (!ordersByFarmer[item.farmerId]) {
          ordersByFarmer[item.farmerId] = []
        }
        ordersByFarmer[item.farmerId].push(item)
      })

      // Create orders for each farmer
      for (const farmerId in ordersByFarmer) {
        const items = ordersByFarmer[farmerId]
        const orderData = {
          organizationId: session.user.id,
          organizationName: session.user.name || "Unknown Organization",
          farmerId: farmerId,
          farmerName: items[0].farmerName || "Unknown Farmer",
          items: items.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            total: item.price * item.quantity
          })),
          totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          status: "pending",
          createdAt: Date.now(),
          deliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        }

        // Save to farmer's orders
        const farmerOrderRef = ref(database, `farmers/${farmerId}/orders`)
        const newOrderRef = push(farmerOrderRef)
        await set(newOrderRef, orderData)

        // Save to organization's orders
        const orgOrderRef = ref(database, `organizations/${session.user.id}/orders`)
        const newOrgOrderRef = push(orgOrderRef)
        await set(newOrgOrderRef, orderData)
      }

      setOrderSuccess(true)
      setCart([])
      setShowCart(false)
      setTimeout(() => setOrderSuccess(false), 5000)
    } catch (err) {
      console.error("Error placing order:", err)
      alert("Failed to place order. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center max-w-md bg-white rounded-lg shadow-xl p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchFarmersAndProducts}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1">🌾 Farmers Marketplace</h1>
              <p className="text-blue-100">
                {selectedFarmer && selectedFarmer.id !== "all"
                  ? `Shopping from ${selectedFarmer.name}`
                  : selectedFarmer?.id === "all"
                  ? `Browsing all products from ${farmers.length} farmers`
                  : `Select a farmer to start shopping`
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/organization/dashboard"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                ← Dashboard
              </Link>
              <button
                onClick={() => setShowCart(true)}
                className="relative px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition shadow-lg"
              >
                🛒 Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {orderSuccess && (
          <div className="mb-6 bg-green-100 border-2 border-green-500 text-green-800 px-6 py-4 rounded-lg shadow-md animate-fade-in">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <p className="font-bold">Order Placed Successfully!</p>
                <p className="text-sm">Farmers will receive your order request shortly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Farmers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedFarmer && selectedFarmer.id !== "all" ? "Farmer Profile" : "Select a Farmer"}
            </h2>
            {selectedFarmer && selectedFarmer.id !== "all" && (
              <button
                onClick={() => setSelectedFarmer(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                ← Back to All Farmers
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* All Farmers Option */}
            <button
              onClick={() => setSelectedFarmer({ id: "all", name: "All Farmers", email: "" })}
              className={`p-6 rounded-lg transition-all ${
                selectedFarmer?.id === "all"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl scale-105"
                  : "bg-white hover:bg-blue-50 text-gray-900 shadow-md hover:shadow-lg"
              }`}
            >
              <div className="text-4xl mb-2">🌾</div>
              <p className="font-bold text-lg">All Farmers</p>
              <p className={`text-sm mt-1 ${selectedFarmer?.id === "all" ? "text-blue-100" : "text-gray-600"}`}>
                {allProducts.length} products total
              </p>
            </button>

            {/* Individual Farmers */}
            {farmers.map((farmer) => {
              const productCount = getProductsByFarmer(farmer.id).length
              return (
                <button
                  key={farmer.id}
                  onClick={() => setSelectedFarmer(farmer)}
                  className={`p-6 rounded-lg transition-all ${
                    selectedFarmer?.id === farmer.id
                      ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-xl scale-105"
                      : "bg-white hover:bg-green-50 text-gray-900 shadow-md hover:shadow-lg"
                  }`}
                >
                  <div className="text-4xl mb-2">👨‍🌾</div>
                  <p className="font-bold text-lg truncate">{farmer.name}</p>
                  <p className={`text-xs mt-1 truncate ${selectedFarmer?.id === farmer.id ? "text-green-100" : "text-gray-500"}`}>
                    {farmer.email}
                  </p>
                  <p className={`text-sm mt-2 font-semibold ${selectedFarmer?.id === farmer.id ? "text-white" : "text-green-600"}`}>
                    📦 {productCount} products
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search and Filter */}
        {(selectedFarmer || allProducts.length > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔍 Search Products
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid - Show ONLY when farmer is selected */}
        {selectedFarmer === null ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">👨‍🌾</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Select a Farmer to Browse Products</h3>
            <p className="text-lg text-gray-600 mb-2">Choose a farmer from the cards above to see their available products</p>
            <p className="text-sm text-gray-500">You can also select &quot;All Farmers&quot; to browse all products at once</p>
          </div>
        ) : selectedFarmer.id === "all" ? (
          <div className="space-y-8">
            {farmers.map((farmer) => {
              const products = getProductsByFarmer(farmer.id).filter((product) => {
                const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
                const matchesSearch =
                  searchTerm === "" ||
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.description.toLowerCase().includes(searchTerm.toLowerCase())
                return matchesCategory && matchesSearch
              })
              
              if (products.length === 0) return null

              return (
                <div key={farmer.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👨‍🌾</span>
                      <div>
                        <h3 className="font-bold text-xl text-blue-700">{farmer.name}</h3>
                        <p className="text-sm text-gray-500">{farmer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">📦 {products.length} products available</p>
                      <button
                        onClick={() => setSelectedFarmer(farmer)}
                        className="mt-1 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View only this farmer →
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group border border-gray-100"
                      >
                        <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <span className="text-6xl">{product.image || "🥬"}</span>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 flex-1">
                              {product.name}
                            </h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap ml-2 font-semibold">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <p className="text-2xl font-bold text-green-600">₹{product.price}</p>
                              <p className="text-xs text-gray-500">per {product.unit}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-semibold ${product.stock > 10 ? "text-green-600" : "text-orange-600"}`}>
                                {product.stock} {product.unit}
                              </p>
                              <p className="text-xs text-gray-500">in stock</p>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className={`w-full py-3 rounded-lg font-semibold transition-all ${
                              product.stock === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
                            }`}
                          >
                            {product.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-700 font-medium">
                Showing {filteredProducts.length} product(s)
                {selectedFarmer && ` from ${selectedFarmer.name}`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-6xl">{product.image || "🥬"}</span>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 flex-1">
                        {product.name}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap ml-2 font-semibold">
                        {product.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
                      {product.description}
                    </p>

                    {!selectedFarmer && (
                      <p className="text-xs text-gray-500 mb-2">
                        👨‍🌾 <span className="font-medium">{product.farmerName}</span>
                      </p>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-green-600">₹{product.price}</p>
                        <p className="text-xs text-gray-500">per {product.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${product.stock > 10 ? "text-green-600" : "text-orange-600"}`}>
                          {product.stock} {product.unit}
                        </p>
                        <p className="text-xs text-gray-500">in stock</p>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        product.stock === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {product.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">🛒 Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Cart Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-2">Add some products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">{item.image || "🥬"}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-500">From: {item.farmerName}</p>
                        <p className="text-sm text-gray-700 mt-1">₹{item.price} per {item.unit}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full font-bold"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, Math.min(item.quantity + 1, item.stock))}
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold"
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-600 hover:text-red-700 font-semibold text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total Items:</span>
                  <span className="text-lg font-bold text-gray-900">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-3xl font-bold text-green-600">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
