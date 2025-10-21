"use client"

import { useState } from "react"
import Link from "next/link"

export default function BulkOrdersPage() {
  const [orderData, setOrderData] = useState({
    deliveryFrequency: "weekly",
    startDate: "",
    institutionName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: {quantity: number, unit: string}}>({})

  const products = [
    { id: "rice", name: "Rice (Basmati)", price: 70, unit: "kg" },
    { id: "wheat", name: "Wheat Flour", price: 40, unit: "kg" },
    { id: "lentils", name: "Lentils", price: 100, unit: "kg" },
    { id: "potatoes", name: "Potatoes", price: 20, unit: "kg" },
    { id: "onions", name: "Onions", price: 25, unit: "kg" },
    { id: "tomatoes", name: "Tomatoes", price: 30, unit: "kg" },
    { id: "milk", name: "Fresh Milk", price: 50, unit: "litre" },
    { id: "apples", name: "Apples", price: 120, unit: "kg" },
    { id: "bananas", name: "Bananas", price: 40, unit: "dozen" },
  ]

  const handleProductQuantity = (productId: string, quantity: number, unit: string) => {
    if (quantity > 0) {
      setSelectedProducts({
        ...selectedProducts,
        [productId]: { quantity, unit }
      })
    } else {
      const newProducts = {...selectedProducts}
      delete newProducts[productId]
      setSelectedProducts(newProducts)
    }
  }

  const calculateTotal = () => {
    return Object.keys(selectedProducts).reduce((total, productId) => {
      const product = products.find(p => p.id === productId)
      if (product) {
        return total + (product.price * selectedProducts[productId].quantity)
      }
      return total
    }, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Order submitted successfully! Our team will contact you shortly.")
    // In production, this would send data to backend
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl">🌾</span>
            <span className="text-2xl font-bold text-green-700">FarmFresh Direct</span>
          </Link>
          <div className="flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-green-600">Home</Link>
            <Link href="/products" className="text-gray-700 hover:text-green-600">Products</Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600">Contact</Link>
            <Link href="/auth/signin" className="text-green-700 font-semibold hover:text-green-800">Sign In</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bulk Order & Subscription</h1>
            <p className="text-lg text-gray-600">
              Schedule regular deliveries for your institution
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              {/* Delivery Frequency */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Schedule</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { value: "weekly", label: "Weekly", desc: "Every week" },
                    { value: "biweekly", label: "Bi-weekly", desc: "Every 2 weeks" },
                    { value: "monthly", label: "Monthly", desc: "Once a month" }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOrderData({...orderData, deliveryFrequency: option.value})}
                      className={`p-4 rounded-lg border-2 transition ${
                        orderData.deliveryFrequency === option.value
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="font-semibold text-lg">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div className="mb-8">
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subscription Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  required
                  value={orderData.startDate}
                  onChange={(e) => setOrderData({...orderData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              {/* Institution Details */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Institution Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="institutionName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Institution Name
                    </label>
                    <input
                      id="institutionName"
                      type="text"
                      required
                      value={orderData.institutionName}
                      onChange={(e) => setOrderData({...orderData, institutionName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="ABC College"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      id="contactPerson"
                      type="text"
                      required
                      value={orderData.contactPerson}
                      onChange={(e) => setOrderData({...orderData, contactPerson: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={orderData.email}
                      onChange={(e) => setOrderData({...orderData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="contact@institution.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={orderData.phone}
                      onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="+91 1234567890"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      id="address"
                      required
                      rows={3}
                      value={orderData.address}
                      onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Full delivery address"
                    />
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Products</h2>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                      <div className="flex-1">
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-gray-600">₹{product.price} per {product.unit}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="number"
                          min="0"
                          value={selectedProducts[product.id]?.quantity || 0}
                          onChange={(e) => handleProductQuantity(product.id, parseInt(e.target.value) || 0, product.unit)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                          placeholder="0"
                        />
                        <span className="text-gray-600 w-16">{product.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="mb-8">
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={orderData.notes}
                  onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Any special requirements or delivery instructions"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  {Object.keys(selectedProducts).map(productId => {
                    const product = products.find(p => p.id === productId)
                    if (!product) return null
                    const item = selectedProducts[productId]
                    return (
                      <div key={productId} className="flex justify-between">
                        <span>{product.name} ({item.quantity} {item.unit})</span>
                        <span className="font-semibold">₹{product.price * item.quantity}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-green-300 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total per delivery:</span>
                    <span className="text-green-600">₹{calculateTotal()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Frequency: {orderData.deliveryFrequency}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition text-lg"
              >
                Submit Bulk Order Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
