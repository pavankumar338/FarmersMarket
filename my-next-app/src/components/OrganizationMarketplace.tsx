import React, { useState } from 'react';
import Link from 'next/link';

// Removed demo farmers. Farmers are now derived from Firebase products data.

// Removed local Product type and dummy productsByFarmer. Use imported Product type and real data.
import { getAllProducts } from '@/lib/productService';
import { Product } from '@/types/product';

export default function OrganizationMarketplace() {
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [productsByFarmer, setProductsByFarmer] = useState<{ [farmerId: string]: Product[] }>({});
  const [farmers, setFarmers] = useState<{ id: string; name: string; avatar?: string }[]>([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  // Fetch products and group by farmer using productService
  React.useEffect(() => {
    setLoadingFarmers(true);
    getAllProducts().then((products) => {
      const grouped: { [farmerId: string]: Product[] } = {};
      const farmerMap: { [farmerId: string]: { id: string; name: string; avatar?: string } } = {};
      const avatarPool = ['/avatar.svg'];
      products.forEach((product, idx) => {
        if (product.isActive === false) return;
        if (!grouped[product.farmerId]) grouped[product.farmerId] = [];
        grouped[product.farmerId].push(product);
        if (!farmerMap[product.farmerId]) {
          const avatar = product.image && product.image.length > 0
            ? product.image
            : avatarPool[Math.floor(Math.random() * avatarPool.length)];
          farmerMap[product.farmerId] = {
            id: product.farmerId,
            name: product.farmerName || 'Unknown Farmer',
            avatar,
          };
        }
      });
      setProductsByFarmer(grouped);
      setFarmers(Object.values(farmerMap));
      setLoadingFarmers(false);
    });
  }, []);

  // Only allow cart from one farmer at a time
  const handleAddToCart = (product: { id: string; name: string; price: number }) => {
    if (
      cart.length > 0 &&
      selectedFarmer &&
      !productsByFarmer[selectedFarmer]?.find((p: Product) => p.id === cart[0].id)
    ) {
      alert('You can only order products from one farmer at a time.');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const handlePlaceOrder = () => {
    // Implement order logic here
    alert('Order placed!');
    setCart([]);
  };

  return (
    <div className="org-marketplace-container" style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
  <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Select a Farmer to View Products</h2>
      {loadingFarmers ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <span className="animate-spin" style={{ fontSize: 32 }}>🌾</span>
          <div style={{ marginTop: 12, color: '#888' }}>Loading farmers...</div>
        </div>
      ) : (
        <div className="farmer-list" style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {farmers.map(farmer => (
            <div
              key={farmer.id}
              onClick={() => { setSelectedFarmer(farmer.id); setCart([]); }}
              style={{
                cursor: 'pointer',
                border: selectedFarmer === farmer.id ? '2px solid #0070f3' : '1px solid #eee',
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
                background: selectedFarmer === farmer.id ? '#e6f7ff' : '#fff',
                boxShadow: selectedFarmer === farmer.id ? '0 4px 16px rgba(0,112,243,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                minWidth: 140,
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <img
                  src={farmer.avatar && farmer.avatar.length > 0 ? farmer.avatar : '/avatar.svg'}
                  alt={farmer.name}
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee', background: '#f9f9f9' }}
                  onError={e => { (e.target as HTMLImageElement).src = '/avatar.svg'; }}
                />
                {selectedFarmer === farmer.id && (
                  <span style={{ position: 'absolute', top: 0, right: 0, fontSize: 18, color: '#0070f3' }}>✔️</span>
                )}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{farmer.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>ID: {farmer.id}</div>
              <Link
                href={`/organization/dashboard/farmer/${farmer.id}/products`}
                style={{ display: 'inline-block', marginTop: 10, padding: '6px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 14, boxShadow: '0 1px 4px rgba(0,112,243,0.08)', textDecoration: 'none' }}
              >View Products</Link>
            </div>
          ))}
        </div>
      )}

      {selectedFarmer && productsByFarmer[selectedFarmer] && (
        <>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            Products from {farmers.find(f => f.id === selectedFarmer)?.name}
          </h3>
          <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28, marginBottom: 32 }}>
            {productsByFarmer[selectedFarmer].map((product: Product) => (
              <div key={product.id} style={{ border: '1px solid #eee', borderRadius: 14, padding: 18, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s', position: 'relative' }}>
                <img
                  src={product.image || '/product.svg'}
                  alt={product.name}
                  style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10, background: '#f9f9f9', marginBottom: 8 }}
                  onError={e => { (e.target as HTMLImageElement).src = '/product.svg'; }}
                />
                <div style={{ fontWeight: 600, fontSize: 17 }}>{product.name}</div>
                <div style={{ color: '#0070f3', fontWeight: 700, fontSize: 16, marginTop: 2 }}>₹{product.price}</div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{product.stock} {product.unit} available</div>
                {product.description && (
                  <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{product.description}</div>
                )}
                <button
                  style={{ marginTop: 12, padding: '8px 18px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px rgba(0,112,243,0.08)' }}
                  onClick={() => handleAddToCart(product)}
                >Add to Cart</button>
              </div>
            ))}
          </div>
        </>
      )}

      {cart.length > 0 && (
  <div className="cart-section" style={{ border: '1px solid #0070f3', borderRadius: 10, padding: 20, background: '#f9f9ff', marginTop: 24, color: 'var(--foreground)' }}>
          <h3>Bulk Order Cart</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cart.map(item => (
              <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span>₹{item.price}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  style={{ width: 50 }}
                  onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                />
                <button
                  style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                  onClick={() => handleRemoveFromCart(item.id)}
                >Remove</button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16, fontWeight: 600 }}>
            Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
          </div>
          <button
            style={{ marginTop: 16, padding: '8px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}
            onClick={handlePlaceOrder}
          >Place Bulk Order</button>
        </div>
      )}
    </div>
  );
}
