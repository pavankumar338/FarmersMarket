"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ShoppingCart, X, Plus, Minus, Search, Leaf, CheckCircle, AlertCircle } from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, push, set } from "firebase/database"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  unit: string
  image?: string
  farmerName?: string
  farmerId?: string
}

interface ProductsWithDatabaseProps {
  farmerId?: string
}

export default function ProductsWithDatabase({ farmerId }: ProductsWithDatabaseProps) {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<{[key: string]: number}>({})
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  const categories = ["All", "Fruits", "Vegetables", "Grains", "Dairy"]

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        let url = '/api/products?active=true'
        if (farmerId) {
          url += `&farmerId=${encodeURIComponent(farmerId)}`
        }
        const response = await fetch(url)
        const data = await response.json()
        if (data.success) {
          // Ensure each product has farmerId
          const productsWithFarmerId = data.products.map((p: Product) => ({
            ...p,
            farmerId: p.farmerId || farmerId // Use the prop farmerId as fallback
          }))
          setProducts(productsWithFarmerId)
        } else {
          setError('Failed to load products')
        }
      } catch (err) {
        setError('Error fetching products')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [farmerId])

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] > 1) {
        newCart[productId]--
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  const cartTotal = Object.keys(cart).reduce((total, productId) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      return total + (product.price * cart[productId])
    }
    return total
  }, 0)

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  const placeBulkOrder = async () => {
    if (!session?.user?.id) {
      setOrderError("Please sign in to place an order")
      return
    }

    if (Object.keys(cart).length === 0) {
      setOrderError("Your cart is empty")
      return
    }

    setOrderLoading(true)
    setOrderError(null)
    setOrderSuccess(false)

    try {
      // Group cart items by farmer
      const ordersByFarmer: { [farmerId: string]: Array<{ product: Product; quantity: number }> } = {}
      
      for (const [productId, quantity] of Object.entries(cart)) {
        const product = products.find(p => p.id === productId)
        if (product && product.farmerId) {
          if (!ordersByFarmer[product.farmerId]) {
            ordersByFarmer[product.farmerId] = []
          }
          ordersByFarmer[product.farmerId].push({ product, quantity })
        }
      }

      // Create orders for each farmer
      for (const [farmerId, items] of Object.entries(ordersByFarmer)) {
        for (const { product, quantity } of items) {
          const orderData = {
            organizationId: session.user.id,
            organizationName: session.user.name || "Unknown Organization",
            productId: product.id,
            productName: product.name,
            quantity: quantity,
            pricePerUnit: product.price,
            unit: product.unit,
            totalAmount: product.price * quantity,
            status: "pending",
            requestDate: Date.now(),
            type: "bulk"
          }

          // Add to farmer's orders
          const farmerOrderRef = ref(database, `farmers/${farmerId}/orders`)
          const newFarmerOrderRef = push(farmerOrderRef)
          await set(newFarmerOrderRef, orderData)

          // Add to organization's orders
          const orgOrderRef = ref(database, `organizations/${session.user.id}/orders`)
          const newOrgOrderRef = push(orgOrderRef)
          await set(newOrgOrderRef, {
            ...orderData,
            farmerId: farmerId,
            farmerName: product.farmerName || "Unknown Farmer"
          })
        }
      }

      setOrderSuccess(true)
      setCart({})
      setTimeout(() => {
        setShowCart(false)
        setOrderSuccess(false)
      }, 2000)
    } catch (err) {
      console.error("Error placing order:", err)
      setOrderError("Failed to place order. Please try again.")
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading fresh products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium transition-all transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all transform hover:scale-110"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {cartItemCount}
          </span>
        </button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="hover:bg-white/20 p-2 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {Object.entries(cart).map(([productId, qty]) => {
                const product = products.find(p => p.id === productId)
                if (!product) return null
                return (
                  <div key={productId} className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{product.image || "📦"}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-700 font-medium">₹{product.price} per {product.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-300">
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="p-2 hover:bg-gray-100 rounded-l-lg transition text-gray-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold min-w-[2rem] text-center text-gray-900">{qty}</span>
                        <button
                          onClick={() => addToCart(productId)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg transition text-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-green-600">₹{(product.price * qty).toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
              
              <div className="border-t-2 border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">₹{cartTotal.toFixed(2)}</span>
                </div>

                {orderSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">Order Placed Successfully!</p>
                      <p className="text-sm text-green-700">The farmer will review your order soon.</p>
                    </div>
                  </div>
                )}

                {orderError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">Error</p>
                      <p className="text-sm text-red-700">{orderError}</p>
                    </div>
                  </div>
                )}

                {!session?.user ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">Please sign in to place an order</p>
                  </div>
                ) : null}

                <button
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform shadow-lg ${
                    orderLoading || !session?.user
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-105"
                  }`}
                  onClick={placeBulkOrder}
                  disabled={orderLoading || !session?.user}
                >
                  {orderLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Placing Order...</span>
                    </span>
                  ) : (
                    "Place Bulk Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-12 h-12 text-green-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Fresh Farm Products
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Direct from farmers to your doorstep 🌾
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-lg transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Count */}
        <p className="text-center text-gray-600 mb-8 text-lg font-medium">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
        </p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <p className="text-gray-500 text-xl font-medium">No products found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="h-56 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 flex items-center justify-center relative overflow-hidden">
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                    {product.image || "📦"}
                  </span>
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                    {product.description || "Fresh farm product"}
                  </p>

                  {product.farmerName && (
                    <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                      <span className="text-green-600">👨‍🌾</span>
                      <span className="text-gray-700">By {product.farmerName}</span>
                    </p>
                  )}

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-3xl font-bold text-green-600">
                        ₹{product.price}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">per {product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        product.stock > 10 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Out of Stock'}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">available</p>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all transform ${
                      product.stock === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {product.stock === 0 ? "Out of Stock" : cart[product.id] ? `In Cart (${cart[product.id]})` : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}