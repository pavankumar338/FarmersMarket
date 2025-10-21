"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { database } from "@/lib/firebase"
import { ref, push, set } from "firebase/database"

interface Product {
  id: string
  name: string
  price: number
  unit: string
  farmerId: string
  farmerName?: string
}

interface OrderRequestModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function OrderRequestModal({ product, isOpen, onClose }: OrderRequestModalProps) {
  const { data: session } = useSession()
  const [quantity, setQuantity] = useState(1)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const totalAmount = product.price * quantity

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const organizationId = session?.user?.id
      const organizationName = session?.user?.name || "Unknown Organization"

      if (!organizationId) {
        throw new Error("Not authenticated")
      }

      // Create order request for the farmer
      const farmerOrderRef = ref(database, `farmers/${product.farmerId}/orders`)
      const newFarmerOrderRef = push(farmerOrderRef)
       const orderId = newFarmerOrderRef.key
     
       if (!orderId) {
         throw new Error("Failed to generate order ID")
       }

       const farmerOrderData = {
         id: orderId,
         productId: product.id,
         productName: product.name,
         quantity,
         pricePerUnit: product.price,
         totalAmount,
         unit: product.unit,
         organizationId,
         organizationName,
         requestDate: Date.now(),
         deliveryDate: deliveryDate ? new Date(deliveryDate).getTime() : null,
         notes,
         status: "pending",
         type: "purchase_request",
       }

       await set(newFarmerOrderRef, farmerOrderData)

       // Also create a record in organization's orders with the SAME order ID
       const orgOrderRef = ref(database, `organizations/${organizationId}/orders/${orderId}`)
       const orgOrderData = {
         ...farmerOrderData,
         farmerId: product.farmerId,
         farmerName: product.farmerName,
       }

       await set(orgOrderRef, orgOrderData)

      setSuccess(true)
      setTimeout(() => {
         onClose()
        setSuccess(false)
        setQuantity(1)
         setDeliveryDate("")
         setNotes("")
      }, 2000)
    } catch (err) {
      console.error("Error creating order request:", err)
      setError("Failed to send order request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Request Order</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
              <p className="font-semibold">✅ Order request sent successfully!</p>
              <p className="text-sm">The farmer will review and respond to your request.</p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Farmer:</span> {product.farmerName || "Unknown"}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> ₹{product.price} per {product.unit}
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Order Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity ({product.unit}) *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Delivery Date */}
                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Delivery Date
                  </label>
                  <input
                    type="date"
                    id="deliveryDate"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any special requirements or notes for the farmer..."
                  />
                </div>

                {/* Total */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Estimated Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {quantity} {product.unit} × ₹{product.price} = ₹{totalAmount}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending Request..." : "Send Order Request"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  * This is a request. The farmer will confirm availability and final price.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
