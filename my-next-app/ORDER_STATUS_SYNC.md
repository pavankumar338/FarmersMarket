# Order Status Synchronization

## How It Works

When a farmer updates an order status (Accept, Reject, In Transit, Delivered), the system now updates the order in **both locations**:

1. **Farmer's Orders**: `farmers/{farmerId}/orders/{orderId}`
2. **Organization's Orders**: `organizations/{organizationId}/orders/{orderId}`

This ensures that both the farmer and the organization see the same, up-to-date order status.

## Order Status Flow

### From Organization's Perspective:

```
Organization Dashboard → Orders Tab → Filter by Status
├── All (2)              → View all orders
├── Pending (2)          → Orders waiting for farmer approval
├── Confirmed (0)        → Orders accepted by farmer
├── In Transit (0)       → Orders being delivered
└── Delivered (0)        → Completed orders (order history)
```

### From Farmer's Perspective:

```
Farmer Dashboard → Orders Tab
├── Pending    → [✓ Accept Order] [✗ Reject]
├── Confirmed  → [📦 Mark as In Transit]
├── In Transit → [✓ Mark as Delivered]
└── Delivered  → Order completed
```

## Status Update Process

### When Farmer Clicks "✓ Accept Order":
1. Status changes from `pending` → `confirmed`
2. Updates in `farmers/{farmerId}/orders/{orderId}`
3. Updates in `organizations/{organizationId}/orders/{orderId}`
4. Organization sees order move to "Confirmed" filter

### When Farmer Clicks "📦 Mark as In Transit":
1. Status changes from `confirmed` → `in_transit`
2. Updates both locations
3. Organization sees order move to "In Transit" filter

### When Farmer Clicks "✓ Mark as Delivered":
1. Status changes from `in_transit` → `delivered`
2. Updates both locations
3. Organization sees order move to "Delivered" filter
4. Organization sees:
   - ✓ Order Completed button (green)
   - Reorder button
   - Download Invoice button

## Database Structure

```json
{
  "farmers": {
    "{farmerId}": {
      "orders": {
        "{orderId}": {
          "id": "orderId",
          "productName": "Fresh Apples",
          "quantity": 13,
          "pricePerUnit": 120,
          "totalAmount": 1560,
          "unit": "kg",
          "organizationId": "orgUserId",     ← Important!
          "organizationName": "Some Org",
          "status": "delivered",              ← Synced!
          "requestDate": 1729339200000,
          "deliveryDate": 1729598400000,
          "notes": "..."
        }
      }
    }
  },
  "organizations": {
    "{organizationId}": {
      "orders": {
        "{orderId}": {
          "id": "orderId",
          "productName": "Fresh Apples",
          "quantity": 13,
          "pricePerUnit": 120,
          "totalAmount": 1560,
          "unit": "kg",
          "farmerId": "farmerUserId",
          "farmerName": "pavan kode",
          "status": "delivered",              ← Synced!
          "requestDate": 1729339200000,
          "deliveryDate": 1729598400000,
          "notes": "..."
        }
      }
    }
  }
}
```

## Code Implementation

### Farmer Dashboard (`src/app/farmer/dashboard/page.tsx`)

```typescript
// Helper function to update order status in both locations
const updateOrderStatus = async (order: FarmerOrder, newStatus: string) => {
  try {
    // Update in farmer's orders
    const farmerOrderRef = ref(database, `farmers/${userId}/orders/${order.id}`)
    await update(farmerOrderRef, { status: newStatus })

    // Also update in organization's orders
    if (order.organizationId) {
      const orgOrderRef = ref(database, `organizations/${order.organizationId}/orders/${order.id}`)
      await update(orgOrderRef, { status: newStatus })
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    setErrorMsg("Failed to update order status. Please try again.")
  }
}
```

### Usage in Buttons:

```typescript
// Accept Order
<button onClick={() => updateOrderStatus(order, "confirmed")}>
  ✓ Accept Order
</button>

// Mark as In Transit
<button onClick={() => updateOrderStatus(order, "in_transit")}>
  📦 Mark as In Transit
</button>

// Mark as Delivered
<button onClick={() => updateOrderStatus(order, "delivered")}>
  ✓ Mark as Delivered
</button>
```

## Testing the Flow

### Step 1: Organization Creates Order
1. Sign in as organization
2. Go to `/organization/dashboard` or `/organization/browse`
3. Click "Request Order" on any product
4. Fill details and submit
5. Status: **Pending**

### Step 2: Farmer Accepts Order
1. Sign out, sign in as farmer
2. Go to Farmer Dashboard → Orders tab
3. See the pending order
4. Click "✓ Accept Order"
5. Status changes to **Confirmed**

### Step 3: Farmer Ships Order
1. Click "📦 Mark as In Transit"
2. Status changes to **In Transit**

### Step 4: Farmer Delivers Order
1. Click "✓ Mark as Delivered"
2. Status changes to **Delivered**

### Step 5: Organization Views History
1. Sign out, sign in as organization
2. Go to Organization Dashboard → Orders tab
3. Click "Delivered (1)" filter
4. See completed order with:
   - ✓ Order Completed
   - Reorder button
   - Download Invoice button

## Real-Time Updates

Both farmer and organization dashboards use Firebase Realtime Database's `onValue()` listener, which means:

- ✅ Changes are reflected **instantly**
- ✅ No need to refresh the page
- ✅ Both parties always see the current status
- ✅ Order history is preserved

## Benefits

1. **Transparency**: Both parties see the same information
2. **Real-Time**: Status updates appear immediately
3. **Order History**: Organizations can track all past orders
4. **Audit Trail**: Complete record of order lifecycle
5. **Better UX**: Clear status progression with filters

## Future Enhancements

- [ ] Email notifications on status change
- [ ] SMS alerts for delivery
- [ ] Order tracking with estimated delivery time
- [ ] Invoice generation (PDF download)
- [ ] Reorder functionality
- [ ] Order cancellation (before confirmed)
- [ ] Chat/messaging between farmer and organization
- [ ] Rating and review system

---

**Summary**: Order status updates are now fully synchronized between farmers and organizations, providing a seamless order management experience with complete order history! 🎉
