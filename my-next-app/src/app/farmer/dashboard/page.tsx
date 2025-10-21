"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { auth, database } from "@/lib/firebase"
import { ref, onValue, push, set, update, remove } from "firebase/database"
import { signInAnonymously, signInWithCustomToken } from "firebase/auth"
import RoleGuard from "@/components/RoleGuard"
import { 
  Package, ShoppingCart, TrendingUp, Users, Plus, Upload, Edit2, Trash2, 
  Check, X, Truck, CheckCircle, Clock, AlertCircle, Search, Download,
  BarChart3, Calendar, DollarSign, Leaf, Filter, Eye
} from "lucide-react"

function FarmerDashboardContent() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const userName = session?.user?.name || "Farmer"
  const userImage = (session?.user as any)?.image as string | undefined
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "analytics">("products")
  const [errorMsg, setErrorMsg] = useState<string>("")

  type Product = { id: string; name: string; category: string; price: number; stock: number; unit: string }
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")

  useEffect(() => {
    async function ensureFirebaseAuth() {
      try {
        if (auth.currentUser?.uid === userId) return
        if (!userId) return
        const res = await fetch("/api/auth/firebase-custom-token")
        if (!res.ok) throw new Error("Failed to get custom token")
        const { token } = await res.json()
        await signInWithCustomToken(auth, token)
      } catch (e) {
        if (!auth.currentUser) {
          try { await signInAnonymously(auth) } catch { /* noop */ }
        }
      }
    }
    ensureFirebaseAuth()

    const productsRef = ref(database, `products`)
    const unsub = onValue(productsRef, (snap) => {
      const val = (snap.val() || {}) as Record<string, any>
      const list: Product[] = Object.entries(val)
        .filter(([_, value]) => value.farmerId === userId)
        .map(([key, value]) => ({ id: key, ...value }))
      setProducts(list)
      setFilteredProducts(list)
    })
    return () => unsub()
  }, [userId])

  useEffect(() => {
    let result = products
    if (categoryFilter !== "All") {
      result = result.filter(p => p.category === categoryFilter)
    }
    if (productSearchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
      )
    }
    setFilteredProducts(result)
  }, [products, categoryFilter, productSearchTerm])

  type FarmerOrder = { 
    id: string
    organizationName?: string
    organization?: string
    organizationId?: string
    productName?: string
    items?: string
    quantity?: number
    pricePerUnit?: number
    totalAmount?: number
    total?: number
    unit?: string
    status: string
    requestDate?: number
    date?: string
    deliveryDate?: number | null
    notes?: string
    type?: string
  }
  const [orders, setOrders] = useState<FarmerOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<FarmerOrder[]>([])
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("All")

  useEffect(() => {
    if (!userId) return
    const ordersRef = ref(database, `farmers/${userId}/orders`)
    const off = onValue(ordersRef, (snap) => {
      const v = (snap.val() || {}) as Record<string, Omit<FarmerOrder, "id">>
      const list: FarmerOrder[] = Object.entries(v).map(([k, val]) => ({ id: k, ...val }))
        .sort((a, b) => (b.requestDate || 0) - (a.requestDate || 0))
      setOrders(list)
      setFilteredOrders(list)
    })
    return () => off()
  }, [userId])

  useEffect(() => {
    let result = orders
    if (orderStatusFilter !== "All") {
      result = result.filter(o => o.status.toLowerCase() === orderStatusFilter.toLowerCase())
    }
    if (orderSearchTerm) {
      result = result.filter(o => 
        (o.organizationName || o.organization || "").toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        (o.productName || o.items || "").toLowerCase().includes(orderSearchTerm.toLowerCase())
      )
    }
    setFilteredOrders(result)
  }, [orders, orderStatusFilter, orderSearchTerm])

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Fruits",
    price: 0,
    stock: 0,
    unit: "kg"
  })

  const [csvUploading, setCsvUploading] = useState(false)
  const [csvError, setCsvError] = useState("")
  const [csvSuccess, setCsvSuccess] = useState("")

  function parseCSV(text: string) {
    const lines = text.trim().split(/\r?\n/)
    const headers = lines[0].split(",").map(h => h.trim())
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim())
      const obj: any = {}
      headers.forEach((h, i) => { obj[h] = values[i] })
      return obj
    })
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setCsvError(""); setCsvSuccess("")
    const file = e.target.files?.[0]
    if (!file) return
    setCsvUploading(true)
    try {
      const text = await file.text()
      const products = parseCSV(text)
      if (!userId) throw new Error("User not authenticated")
      const listRef = ref(database, `products`)
      await Promise.all(products.map(async (p) => {
        const r = push(listRef)
        await set(r, {
          name: p.name,
          category: p.category || "Fruits",
          price: Number(p.price) || 0,
          stock: Number(p.stock) || 0,
          unit: p.unit || "kg",
          description: p.description || "",
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          farmerId: userId,
          farmerName: userName,
        })
      }))
      setCsvSuccess(`Successfully uploaded ${products.length} products!`)
    } catch (err: any) {
      setCsvError("Failed to upload CSV: " + err.message)
    }
    setCsvUploading(false)
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState({
    name: "",
    category: "Fruits",
    price: 0,
    stock: 0,
    unit: "kg",
  })

  const updateOrderStatus = async (order: FarmerOrder, newStatus: string) => {
    try {
      const farmerOrderRef = ref(database, `farmers/${userId}/orders/${order.id}`)
      await update(farmerOrderRef, { status: newStatus })
    } catch (error) {
      console.error("Error updating farmer order status:", error)
      setErrorMsg("Failed to update order status. Please try again.")
      return
    }

    try {
      if (order.organizationId) {
        const orgOrderRef = ref(database, `organizations/${order.organizationId}/orders/${order.id}`)
        await update(orgOrderRef, { status: newStatus })
      }
    } catch (error) {
      console.warn("Warning: failed to sync status to organization order:", error)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    const listRef = ref(database, `products`)
    const newRef = push(listRef)
    try {
      await set(newRef, {
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock,
        unit: newProduct.unit,
        description: "",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        farmerId: userId,
      })
      setErrorMsg("")
    } catch (err) {
      setErrorMsg("Failed to save product. Check Firebase Database rules and connectivity.")
      return
    }
    setNewProduct({ name: "", category: "Fruits", price: 0, stock: 0, unit: "kg" })
    setShowAddProduct(false)
  }

  const startEdit = (p: { id: string; name: string; category: string; price: number; stock: number; unit: string }) => {
    setEditingId(p.id)
    setEditProduct({ name: p.name, category: p.category, price: p.price, stock: p.stock, unit: p.unit })
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !editingId) return
    const productRef = ref(database, `products/${editingId}`)
    try {
      await update(productRef, {
        name: editProduct.name,
        category: editProduct.category,
        price: editProduct.price,
        stock: editProduct.stock,
        unit: editProduct.unit,
        updatedAt: Date.now(),
        farmerId: userId,
      })
      setErrorMsg("")
    } catch (err) {
      setErrorMsg("Failed to update product. Check Firebase Database rules and connectivity.")
      return
    }
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const deleteProduct = async (id: string) => {
    if (!userId) return
    if (!confirm("Are you sure you want to delete this product?")) return
    const productRef = ref(database, `products/${id}`)
    try {
      await remove(productRef)
      setErrorMsg("")
    } catch (err) {
      setErrorMsg("Failed to delete product. Check Firebase Database rules and connectivity.")
    }
  }

  const seedProducts = async () => {
    if (!userId) return
    const listRef = ref(database, `products`)
    const samples = [
      { name: "Fresh Apples", category: "Fruits", price: 120, stock: 200, unit: "kg" },
      { name: "Tomatoes", category: "Vegetables", price: 30, stock: 500, unit: "kg" },
      { name: "Basmati Rice", category: "Grains", price: 70, stock: 1000, unit: "kg" },
    ]
    try {
      await Promise.all(samples.map(async (p) => {
        const r = push(listRef)
        await set(r, { ...p, createdAt: Date.now(), farmerId: userId })
      }))
      setErrorMsg("")
    } catch (e) {
      setErrorMsg("Failed to seed products. Check Firebase Database rules and connectivity.")
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount || o.total) || 0), 0)
  const activeOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "delivered").length
  const uniqueCustomers = new Set(orders.map(o => o.organizationName || o.organization)).size

  const categories = ["All", "Fruits", "Vegetables", "Grains", "Dairy"]
  const orderStatuses = ["All", "pending", "confirmed", "in_transit", "delivered", "rejected"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Enhanced Navigation */}
      <nav className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-xl border-b-4 border-green-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Farmer Dashboard</h1>
                <p className="text-green-100 text-sm">Manage your agricultural business</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {userImage && (
                <img src={userImage} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white/50 shadow-lg" />
              )}
              <div className="text-right">
                <div className="font-semibold">{userName}</div>
                <div className="text-green-100 text-xs">Farmer Account</div>
              </div>
              <Link href="/" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-sm">
                Home
              </Link>
              <button 
                className="px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg transition font-semibold" 
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {status === "loading" && (
          <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6 mb-6 shadow-md flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Loading your dashboard...</span>
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg p-6 mb-6 shadow-md flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        
        {status === "unauthenticated" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-lg p-6 mb-6 shadow-md">
            You are not signed in. Please <Link href="/auth/signin" className="underline font-semibold">sign in</Link> to manage your products.
          </div>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-green-100 text-sm font-medium mb-1">Total Products</div>
                <div className="text-4xl font-bold">{products.length}</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="text-green-100 text-xs">Active inventory items</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-blue-100 text-sm font-medium mb-1">Active Orders</div>
                <div className="text-4xl font-bold">{activeOrders}</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
            <div className="text-blue-100 text-xs">Pending & in progress</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-purple-100 text-sm font-medium mb-1">Total Revenue</div>
                <div className="text-4xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="text-purple-100 text-xs">From {orders.length} orders</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-orange-100 text-sm font-medium mb-1">Customers</div>
                <div className="text-4xl font-bold">{uniqueCustomers}</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="text-orange-100 text-xs">Unique organizations</div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === "products"
                  ? "text-green-600 border-b-3 border-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              <Package className="w-5 h-5" />
              <span>My Products</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === "orders"
                  ? "text-green-600 border-b-3 border-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Orders</span>
              {activeOrders > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{activeOrders}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === "analytics"
                  ? "text-green-600 border-b-3 border-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </div>

          <div className="p-8">
            {/* Enhanced Products Tab */}
            {activeTab === "products" && (
              <div>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                    <Leaf className="w-8 h-8 text-green-600" />
                    <span>My Products</span>
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-md flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Product</span>
                    </button>
                    <label className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition cursor-pointer shadow-md flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>{csvUploading ? "Uploading..." : "Upload CSV"}</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        disabled={csvUploading}
                      />
                    </label>
                  </div>
                </div>

                {(csvError || csvSuccess) && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${csvError ? 'bg-red-50 border-l-4 border-red-500 text-red-700' : 'bg-green-50 border-l-4 border-green-500 text-green-700'}`}>
                    {csvError ? <AlertCircle className="w-5 h-5 mt-0.5" /> : <CheckCircle className="w-5 h-5 mt-0.5" />}
                    <span>{csvError || csvSuccess}</span>
                  </div>
                )}

                {/* Search and Filter */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {showAddProduct && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 mb-6 shadow-lg">
                    <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2 text-green-800">
                      <Plus className="w-6 h-6" />
                      <span>Add New Product</span>
                    </h3>
                    <form onSubmit={handleAddProduct} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                          <input
                            type="text"
                            required
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., Fresh Apples"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                          <select
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="Fruits">Fruits</option>
                            <option value="Vegetables">Vegetables</option>
                            <option value="Grains">Grains</option>
                            <option value="Dairy">Dairy</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Unit (₹)</label>
                          <input
                            type="number"
                            required
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="120"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                          <input
                            type="number"
                            required
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="500"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md flex items-center space-x-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>Add Product</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddProduct(false)}
                          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-400 transition flex items-center space-x-2"
                        >
                          <X className="w-5 h-5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:border-green-300">
                      {editingId === product.id ? (
                        <form onSubmit={saveEdit} className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                              <input
                                type="number"
                                value={editProduct.price}
                                onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                              <input
                                type="number"
                                value={editProduct.stock}
                                onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                              <input
                                type="text"
                                value={editProduct.unit}
                                onChange={(e) => setEditProduct({ ...editProduct, unit: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2">
                              <Check className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button type="button" onClick={cancelEdit} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 flex items-center space-x-2">
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              <div className="bg-green-100 p-3 rounded-lg">
                                <Package className="w-6 h-6 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-xl text-gray-900 mb-2">{product.name}</h3>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                                    {product.category}
                                  </span>
                                  <span className="text-gray-600 flex items-center">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    ₹{product.price}/{product.unit}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className={`font-bold text-2xl mb-2 ${product.stock > 100 ? 'text-green-600' : product.stock > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {product.stock} {product.unit}
                            </div>
                            <div className="text-sm text-gray-500 mb-3">Available Stock</div>
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition flex items-center space-x-1 font-semibold" 
                                onClick={() => startEdit(product)}
                              >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button 
                                className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition flex items-center space-x-1 font-semibold" 
                                onClick={() => deleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredProducts.length === 0 && products.length > 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                  {products.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center space-y-4">
                      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700">No products yet</h3>
                      <p className="text-gray-500">Start building your inventory by adding your first product</p>
                      <button
                        type="button"
                        onClick={seedProducts}
                        className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 inline-flex items-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Sample Products</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                  <span>Order Management</span>
                </h2>

                {/* Search and Filter for Orders */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by organization or product..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {orderStatuses.map(status => (
                        <option key={status} value={status}>
                          {status === "All" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  {filteredOrders.map(order => {
                    const statusConfig = {
                      pending: { bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700", icon: Clock },
                      confirmed: { bg: "bg-teal-50 border-teal-200", badge: "bg-teal-100 text-teal-700", icon: CheckCircle },
                      in_transit: { bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700", icon: Truck },
                      delivered: { bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700", icon: CheckCircle },
                      rejected: { bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", icon: X }
                    }
                    const config = statusConfig[order.status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending
                    const StatusIcon = config.icon

                    return (
                      <div key={order.id} className={`border-2 ${config.bg} rounded-xl p-6 hover:shadow-xl transition-all`}>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-gray-900 mb-1">
                                {order.organizationName || order.organization || "Unknown Organization"}
                              </h3>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                    ID: {order.id.substring(0, 12)}...
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {order.requestDate 
                                      ? new Date(order.requestDate).toLocaleDateString('en-IN', { 
                                          year: 'numeric', 
                                          month: 'long', 
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : order.date || "No date"
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <StatusIcon className="w-5 h-5 text-gray-600" />
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${config.badge}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-200">
                          <div className="grid md:grid-cols-4 gap-6">
                            <div>
                              <p className="text-sm text-gray-500 mb-2 font-semibold">Product</p>
                              <p className="font-bold text-gray-900 text-lg">{order.productName || order.items || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-2 font-semibold">Quantity</p>
                              <p className="font-bold text-gray-900 text-lg">{order.quantity || "N/A"} {order.unit || ""}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-2 font-semibold">Price per Unit</p>
                              <p className="font-bold text-gray-900 text-lg">₹{order.pricePerUnit || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-2 font-semibold">Total Amount</p>
                              <p className="font-bold text-green-600 text-2xl">₹{(order.totalAmount || order.total || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          {order.deliveryDate && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <p className="text-sm text-gray-500 mb-2 font-semibold flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>Preferred Delivery Date</span>
                              </p>
                              <p className="font-bold text-gray-900">
                                {new Date(order.deliveryDate).toLocaleDateString('en-IN', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                          
                          {order.notes && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <p className="text-sm text-gray-500 mb-2 font-semibold">Notes from Organization</p>
                              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg italic">{order.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          {order.status === "pending" && (
                            <>
                              <button 
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-md flex items-center justify-center space-x-2"
                                onClick={() => updateOrderStatus(order, "confirmed")}
                              >
                                <Check className="w-5 h-5" />
                                <span>Accept Order</span>
                              </button>
                              <button 
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition shadow-md flex items-center justify-center space-x-2"
                                onClick={() => updateOrderStatus(order, "rejected")}
                              >
                                <X className="w-5 h-5" />
                                <span>Reject Order</span>
                              </button>
                            </>
                          )}
                          {order.status === "confirmed" && (
                            <button 
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-md flex items-center justify-center space-x-2"
                              onClick={() => updateOrderStatus(order, "in_transit")}
                            >
                              <Truck className="w-5 h-5" />
                              <span>Mark as In Transit</span>
                            </button>
                          )}
                          {order.status === "in_transit" && (
                            <button 
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-md flex items-center justify-center space-x-2"
                              onClick={() => updateOrderStatus(order, "delivered")}
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span>Mark as Delivered</span>
                            </button>
                          )}
                          <button className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center space-x-2">
                            <Eye className="w-5 h-5" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {filteredOrders.length === 0 && orders.length > 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                  {orders.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">
                      <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-12 h-12 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-3">No Order Requests Yet</h3>
                      <p className="text-gray-500 text-lg">
                        When organizations request orders for your products, they will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <span>Sales Analytics</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 shadow-lg">
                    <h3 className="font-bold text-xl mb-6 flex items-center space-x-2 text-purple-900">
                      <TrendingUp className="w-6 h-6" />
                      <span>Top Products by Stock</span>
                    </h3>
                    {products.length > 0 ? (
                      <div className="space-y-4">
                        {products
                          .slice()
                          .sort((a, b) => b.stock - a.stock)
                          .slice(0, 5)
                          .map((product, index) => (
                            <div key={product.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500">{product.category}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-xl text-green-600">{product.stock}</div>
                                  <div className="text-sm text-gray-500">{product.unit} available</div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No products yet to analyze</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 shadow-lg">
                    <h3 className="font-bold text-xl mb-6 flex items-center space-x-2 text-green-900">
                      <DollarSign className="w-6 h-6" />
                      <span>Revenue Overview</span>
                    </h3>
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="text-sm text-gray-500 mb-2">Total Revenue</div>
                        <div className="text-5xl font-bold text-green-600 mb-2">₹{totalRevenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">From {orders.length} total order(s)</div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="text-sm text-gray-500 mb-4">Order Status Breakdown</div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Delivered</span>
                            <span className="font-bold text-green-600">
                              {orders.filter(o => o.status.toLowerCase() === "delivered").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">In Transit</span>
                            <span className="font-bold text-blue-600">
                              {orders.filter(o => o.status.toLowerCase() === "in_transit").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Confirmed</span>
                            <span className="font-bold text-teal-600">
                              {orders.filter(o => o.status.toLowerCase() === "confirmed").length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Pending</span>
                            <span className="font-bold text-yellow-600">
                              {orders.filter(o => o.status.toLowerCase() === "pending").length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="text-sm text-gray-500 mb-2">Average Order Value</div>
                        <div className="text-3xl font-bold text-purple-600">
                          ₹{orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FarmerDashboard() {
  return (
    <RoleGuard allowedRoles={["farmer"]}>
      <FarmerDashboardContent />
    </RoleGuard>
  )
}