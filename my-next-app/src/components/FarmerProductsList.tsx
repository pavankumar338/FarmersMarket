"use client"


import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Product } from "@/types/product"
import Link from "next/link"
import { ref, onValue, update, remove } from "firebase/database"
import { database } from "@/lib/firebase"

export default function FarmerProductsList() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const farmerId = session?.user?.id || "unknown"

  useEffect(() => {
    if (!farmerId || farmerId === "unknown") return;
    setLoading(true);
    const productsRef = ref(database, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const all = snapshot.val() || {};
      const myProducts = Object.entries(all)
        .filter(([_, p]: any) => p.farmerId === farmerId)
        .map(([id, p]: any) => ({ id, ...p }));
      setProducts(myProducts);
      setLoading(false);
    }, (err) => {
      setError('Error fetching products');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [farmerId]);

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      await update(ref(database, `products/${productId}`), { isActive: !currentStatus });
      // Local state will update via onValue
    } catch (err) {
      console.error('Error toggling product status:', err);
      alert('Failed to update product status');
    }
  };

  const handleUpdateStock = async (productId: string, currentStock: number) => {
    const newStock = prompt(`Enter new stock quantity (current: ${currentStock}):`);
    if (newStock === null) return;
    const stockNumber = parseInt(newStock);
    if (isNaN(stockNumber) || stockNumber < 0) {
      alert('Please enter a valid positive number');
      return;
    }
    try {
      await update(ref(database, `products/${productId}`), { stock: stockNumber });
      // Local state will update via onValue
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }
    try {
      await remove(ref(database, `products/${productId}`));
      // Local state will update via onValue
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
        <Link
          href="/farmer/products/add"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
        >
          + Add New Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Active Products</p>
          <p className="text-3xl font-bold text-green-600">
            {products.filter(p => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600">
            {products.filter(p => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">You haven't added any products yet</p>
          <Link
            href="/farmer/products/add"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id} className={!product.isActive ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{product.image || "📦"}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                      {product.stock === 0 && (
                        <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdateStock(product.id, product.stock)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Update Stock
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
