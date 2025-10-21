"use client"

import { useEffect, useState } from "react"
import OrganizationMarketplace from "@/components/OrganizationMarketplace"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { auth, database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { signInAnonymously, signInWithCustomToken } from "firebase/auth"
import RoleGuard from "@/components/RoleGuard"
import OrderRequestModal from "@/components/OrderRequestModal"

function OrganizationDashboardContent() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const userName = session?.user?.name || "Farmer"
  const userImage = (session?.user as any)?.image as string | undefined
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "analytics">("products")
  const [errorMsg, setErrorMsg] = useState<string>("")

  type Product = { 
    id: string; 
    name: string; 
    category: string; 
    price: number; 
    stock: number; 
    unit: string; 
    farmerId?: string;
    farmerName?: string;
    farmerEmail?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
  }
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const productsByFarmer = products.reduce((acc, p) => {
    const farmerId = p.farmerId || "Unknown"
    if (!acc[farmerId]) acc[farmerId] = { products: [], name: p.farmerName || "Unknown Farmer", email: p.farmerEmail || "" }
    acc[farmerId].products.push(p)
    if (p.farmerName) acc[farmerId].name = p.farmerName
    if (p.farmerEmail) acc[farmerId].email = p.farmerEmail
    return acc
  }, {} as Record<string, { products: Product[]; name: string; email: string }>);

  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

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
        .filter(([_, value]) => value.isActive !== false)
        .map(([key, value]) => ({ id: key, ...value }))
      setProducts(list)
    })
    return () => unsub()
  }, [userId])

  type FarmerOrder = { 
    id: string
    organizationName?: string
    organization?: string
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
    farmerId?: string
    farmerName?: string
  }
  const [orders, setOrders] = useState<FarmerOrder[]>([])
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "confirmed" | "in_transit" | "delivered" | "rejected">("all")

  useEffect(() => {
    if (!userId) return
    const ordersRef = ref(database, `organizations/${userId}/orders`)
    const off = onValue(ordersRef, (snap) => {
      const v = (snap.val() || {}) as Record<string, Omit<FarmerOrder, "id">>
      const list: FarmerOrder[] = Object.entries(v).map(([k, val]) => ({ id: k, ...val }))
        .sort((a, b) => (b.requestDate || 0) - (a.requestDate || 0))
      setOrders(list)
    })
    return () => off()
  }, [userId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Navigation */}
      <nav className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-2xl border-b border-white/20">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <span className="text-4xl">🏢</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">Organization Portal</div>
                <div className="text-sm text-blue-100 font-medium">Wholesale & Bulk Procurement</div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                {userImage && (
                  <img src={userImage} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-lg" />
                )}
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{userName}</div>
                  <div className="text-xs text-blue-200">Organization Account</div>
                </div>
              </div>
              <Link href="/" className="text-sm text-white/90 hover:text-white font-medium transition-all hover:scale-105">
                Home
              </Link>
              <button 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 border border-white/30"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        {status === "loading" && (
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Loading your dashboard...</span>
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚠️</span>
              <span className="text-red-700 font-medium">{errorMsg}</span>
            </div>
          </div>
        )}
        {status === "unauthenticated" && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔒</span>
              <span className="text-amber-800">
                You are not signed in. Please <Link href="/auth/signin" className="underline font-bold hover:text-amber-900">sign in</Link> to access your dashboard.
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="group bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white text-sm font-bold uppercase tracking-wide">Products</div>
              <div className="text-5xl group-hover:scale-110 transition-transform">🛒</div>
            </div>
            <div className="text-5xl font-black text-white mb-2">{products.length}</div>
            <div className="text-emerald-100 text-sm font-medium">Available to order</div>
          </div>

          <div className="group bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white text-sm font-bold uppercase tracking-wide">Active Orders</div>
              <div className="text-5xl group-hover:scale-110 transition-transform">📦</div>
            </div>
            <div className="text-5xl font-black text-white mb-2">
              {orders.filter(o => o.status !== "delivered" && o.status !== "Delivered" && o.status !== "rejected").length}
            </div>
            <div className="text-blue-100 text-sm font-medium">In progress</div>
          </div>

          <div className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white text-sm font-bold uppercase tracking-wide">Total Spend</div>
              <div className="text-5xl group-hover:scale-110 transition-transform">💰</div>
            </div>
            <div className="text-5xl font-black text-white mb-2">
              ₹{orders.reduce((sum, o) => sum + (Number(o.totalAmount || o.total) || 0), 0).toLocaleString()}
            </div>
            <div className="text-purple-100 text-sm font-medium">All-time spending</div>
          </div>

          <div className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white text-sm font-bold uppercase tracking-wide">Suppliers</div>
              <div className="text-5xl group-hover:scale-110 transition-transform">🌾</div>
            </div>
            <div className="text-5xl font-black text-white mb-2">
              {new Set(products.map(p => (p as any).farmerId || "")).size}
            </div>
            <div className="text-orange-100 text-sm font-medium">Active farmers</div>
          </div>
        </div>

        {/* Farmer Selection Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-10 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl">
              <span className="text-3xl">👨‍🌾</span>
            </div>
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Our Suppliers
              </h2>
              <p className="text-gray-600 text-sm">Browse products from verified farmers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(productsByFarmer).map(([farmerId, info]) => (
              <div key={farmerId} className="group bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-105 hover:border-blue-400">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl text-gray-900">{info.name}</div>
                    <div className="text-sm text-gray-600">{info.email}</div>
                  </div>
                </div>
                <div className="bg-blue-100 rounded-xl p-3 mb-4">
                  <div className="text-sm text-blue-700 font-semibold">📦 {info.products.length} products available</div>
                </div>
                <Link 
                  href={`/organization/dashboard/farmer/${farmerId}/products`} 
                  className="block text-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  View Products →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="flex border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-5 px-8 font-bold text-lg transition-all relative ${
                activeTab === "products"
                  ? "text-blue-700 bg-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
              }`}
            >
              {activeTab === "products" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              )}
              <span className="text-2xl mr-2">🛒</span>
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-5 px-8 font-bold text-lg transition-all relative ${
                activeTab === "orders"
                  ? "text-blue-700 bg-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
              }`}
            >
              {activeTab === "orders" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              )}
              <span className="text-2xl mr-2">📦</span>
              Orders
              {orders.filter(o => o.status === "pending").length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {orders.filter(o => o.status === "pending").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-5 px-8 font-bold text-lg transition-all relative ${
                activeTab === "analytics"
                  ? "text-blue-700 bg-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
              }`}
            >
              {activeTab === "analytics" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              )}
              <span className="text-2xl mr-2">📊</span>
              Analytics
            </button>
          </div>

          <div className="p-8">
            {activeTab === "products" && <OrganizationMarketplace />}

            {activeTab === "orders" && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Order Management
                    </h2>
                    <p className="text-gray-600 mt-1">Track and manage all your orders</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { key: "all", label: "All", color: "blue" },
                      { key: "pending", label: "Pending", color: "yellow" },
                      { key: "confirmed", label: "Confirmed", color: "teal" },
                      { key: "in_transit", label: "In Transit", color: "indigo" },
                      { key: "delivered", label: "Delivered", color: "green" }
                    ].map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => setOrderFilter(key as any)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                          orderFilter === key
                            ? `bg-gradient-to-r from-${color}-600 to-${color}-700 text-white shadow-lg`
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {label} ({orders.filter(o => key === "all" || o.status === key).length})
                      </button>
                    ))}
                  </div>
                </div>
                
                {orders.filter(o => orderFilter === "all" || o.status === orderFilter).length > 0 ? (
                  <div className="space-y-5">
                    {orders.filter(o => orderFilter === "all" || o.status === orderFilter).map(order => (
                      <div key={order.id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-7 hover:shadow-2xl transition-all hover:scale-[1.01]">
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="font-black text-2xl text-gray-900">
                                {order.productName || order.items || "Unknown Product"}
                              </h3>
                              <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide shadow-md ${
                                order.status === "delivered" ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" :
                                order.status === "in_transit" ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white" :
                                order.status === "confirmed" ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-white" :
                                order.status === "rejected" ? "bg-gradient-to-r from-red-400 to-pink-500 text-white" :
                                "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                              }`}>
                                {order.status === "in_transit" ? "In Transit" : 
                                 order.status === "delivered" ? "Delivered" :
                                 order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <span>📦</span>
                                <span className="font-semibold">#{order.id.slice(0, 8)}...</span>
                              </span>
                              <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <span>📅</span>
                                <span className="font-semibold">
                                  {order.requestDate 
                                    ? new Date(order.requestDate).toLocaleDateString('en-IN', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric'
                                      })
                                    : order.date || "No date"
                                  }
                                </span>
                              </span>
                              {order.farmerName && (
                                <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                  <span>🧑‍🌾</span>
                                  <span className="font-semibold">{order.farmerName}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              ₹{Number(order.totalAmount || order.total || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-5 border border-blue-200">
                          <div className="grid grid-cols-2 gap-5">
                            {order.quantity && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1 font-semibold">Quantity</p>
                                <p className="font-black text-gray-900 text-lg">{order.quantity} {order.unit || ""}</p>
                              </div>
                            )}
                            {order.pricePerUnit && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1 font-semibold">Price per Unit</p>
                                <p className="font-black text-gray-900 text-lg">₹{order.pricePerUnit}</p>
                              </div>
                            )}
                            {order.deliveryDate && (
                              <div className="col-span-2">
                                <p className="text-sm text-gray-600 mb-1 font-semibold">
                                  {order.status === "delivered" ? "Delivered on" : "Expected Delivery"}
                                </p>
                                <p className="font-black text-gray-900 text-lg">
                                  {new Date(order.deliveryDate).toLocaleDateString('en-IN', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}
                            {order.notes && (
                              <div className="col-span-2">
                                <p className="text-sm text-gray-600 mb-1 font-semibold">Notes</p>
                                <p className="text-gray-900">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {order.status === "delivered" ? (
                            <>
                              <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg">
                                ✓ Order Completed
                              </button>
                              <button className="px-5 py-3 border-2 border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                                Reorder
                              </button>
                              <button className="px-5 py-3 border-2 border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                                Invoice
                              </button>
                            </>
                          ) : order.status === "rejected" ? (
                            <>
                              <button className="flex-1 bg-red-100 text-red-700 px-5 py-3 rounded-xl text-sm font-bold cursor-not-allowed" disabled>
                                ✗ Order Rejected
                              </button>
                              <button className="px-5 py-3 border-2 border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                                Contact Farmer
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                                View Details
                              </button>
                              <button className="px-5 py-3 border-2 border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                                Track
                              </button>
                              <button className="px-5 py-3 border-2 border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                                Contact
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-3xl p-16 text-center">
                    <div className="text-8xl mb-6">
                      {orderFilter === "delivered" ? "📋" : "📦"}
                    </div>
                    <h3 className="text-3xl font-black text-gray-700 mb-3">
                      {orderFilter === "all" ? "No orders yet" : 
                       orderFilter === "delivered" ? "No delivered orders" :
                       `No ${orderFilter} orders`}
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      {orderFilter === "all" 
                        ? "Start by browsing the marketplace"
                        : orderFilter === "delivered"
                        ? "Completed orders will appear here"
                        : `Orders with status "${orderFilter}" will appear here`
                      }
                    </p>
                    {orderFilter === "all" ? (
                      <Link href="/organization/browse" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl transform hover:scale-105">
                        Browse Products →
                      </Link>
                    ) : (
                      <button 
                        onClick={() => setOrderFilter("all")}
                        className="inline-block bg-gray-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-700 transition-all shadow-xl transform hover:scale-105"
                      >
                        View All Orders
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Analytics & Insights
                  </h2>
                  <p className="text-gray-600 mt-1">Track your procurement performance</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-green-200 rounded-2xl p-7 shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl">
                        <span className="text-3xl">📈</span>
                      </div>
                      <h3 className="font-black text-2xl text-green-900">Popular Categories</h3>
                    </div>
                    {products.length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(
                          products.reduce((acc, p) => {
                            acc[p.category] = (acc[p.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 4)
                          .map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">
                                  {category === "Fruits" ? "🍎" : 
                                   category === "Vegetables" ? "🥬" : 
                                   category === "Grains" ? "🌾" : 
                                   category === "Dairy" ? "🥛" : "🌱"}
                                </span>
                                <span className="font-bold text-gray-900 text-lg">{category}</span>
                              </div>
                              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-black shadow-md">
                                {count} items
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-600 py-12 bg-white rounded-xl">
                        <div className="text-5xl mb-3">📊</div>
                        <p className="font-semibold">No data available yet</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-2xl p-7 shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl">
                        <span className="text-3xl">💰</span>
                      </div>
                      <h3 className="font-black text-2xl text-purple-900">Spending Overview</h3>
                    </div>
                    <div className="bg-white rounded-xl p-8 text-center shadow-lg">
                      <div className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                        ₹{orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold mb-6">Total Spend</div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                          <div className="text-3xl font-black text-purple-700">{orders.length}</div>
                          <div className="text-xs text-gray-600 font-semibold mt-1">Total Orders</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                          <div className="text-3xl font-black text-purple-700">
                            {orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) / orders.length).toLocaleString() : 0}
                          </div>
                          <div className="text-xs text-gray-600 font-semibold mt-1">Avg. Order</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200 rounded-2xl p-7 shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-2xl">
                        <span className="text-3xl">🌾</span>
                      </div>
                      <h3 className="font-black text-2xl text-blue-900">Top Suppliers</h3>
                    </div>
                    {products.length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(
                          products.reduce((acc, p) => {
                            const farmer = (p as any).farmerName || "Unknown Farmer";
                            acc[farmer] = (acc[farmer] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([farmer, count], index) => (
                            <div key={farmer} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                              <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-md">
                                  {index + 1}
                                </div>
                                <span className="font-bold text-gray-900">{farmer}</span>
                              </div>
                              <span className="text-sm text-gray-600 font-semibold bg-blue-50 px-3 py-1 rounded-lg">
                                {count} products
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-600 py-12 bg-white rounded-xl">
                        <div className="text-5xl mb-3">🧑‍🌾</div>
                        <p className="font-semibold">No suppliers yet</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-200 rounded-2xl p-7 shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl">
                        <span className="text-3xl">📊</span>
                      </div>
                      <h3 className="font-black text-2xl text-orange-900">Order Status</h3>
                    </div>
                    <div className="space-y-3">
                      {["Pending", "In Transit", "Delivered"].map((status) => {
                        const count = orders.filter(o => o.status === status).length;
                        const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                        return (
                          <div key={status} className="bg-white rounded-xl p-4 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-gray-900">{status}</span>
                              <span className="text-sm font-black bg-orange-100 text-orange-700 px-3 py-1 rounded-lg">
                                {count}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full transition-all duration-500 shadow-inner"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <OrderRequestModal
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            unit: selectedProduct.unit,
            farmerId: selectedProduct.farmerId || '',
            farmerName: selectedProduct.farmerName,
          }}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

export default function OrganizationDashboard() {
  return (
    <RoleGuard allowedRoles={["organization"]}>
      <OrganizationDashboardContent />
    </RoleGuard>
  )
}