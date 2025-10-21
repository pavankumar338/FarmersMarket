# Bulk Order Implementation Guide

## Overview
The bulk order feature allows organizations to browse products from specific farmers and place orders that appear in the farmer's dashboard.

## How It Works

### 1. **Product Browsing**
- Organizations can view products from a specific farmer
- Products are displayed with cart functionality
- Users can add multiple products and quantities to cart

### 2. **Order Placement**
When an organization clicks "Place Bulk Order":
1. System checks if user is authenticated (must be signed in)
2. Cart items are grouped by farmer (supports multiple farmers in one cart)
3. For each product in cart:
   - Creates an order record in the farmer's orders: `farmers/{farmerId}/orders/{orderId}`
   - Creates a corresponding order in organization's orders: `organizations/{orgId}/orders/{orderId}`
4. Both records contain the same order ID for synchronization

### 3. **Order Data Structure**
```javascript
{
  organizationId: string,       // ID of ordering organization
  organizationName: string,     // Name of organization
  productId: string,            // Product being ordered
  productName: string,          // Name of product
  quantity: number,             // Quantity ordered
  pricePerUnit: number,         // Price per unit at time of order
  unit: string,                 // Unit of measurement (kg, liters, etc)
  totalAmount: number,          // Total cost (quantity × pricePerUnit)
  status: "pending",            // Initial status
  requestDate: number,          // Timestamp when order placed
  type: "bulk",                 // Order type
  farmerId: string,             // (in org's copy only)
  farmerName: string            // (in org's copy only)
}
```

### 4. **Order Status Flow**
Farmers can update order status through their dashboard:
- `pending` → Order placed, awaiting farmer response
- `confirmed` → Farmer accepted the order
- `in_transit` → Order is being delivered
- `delivered` → Order completed
- `rejected` → Farmer rejected the order

### 5. **Status Synchronization**
When a farmer updates order status:
1. Updates `farmers/{farmerId}/orders/{orderId}` 
2. Syncs to `organizations/{orgId}/orders/{orderId}`
This keeps both parties informed of order progress.

## Components Modified

### ProductsWithDatabase.tsx
**Location**: `src/components/ProductsWithDatabase.tsx`

**Key Features Added**:
- Session integration with `useSession()` hook
- Cart management with quantity tracking
- `placeBulkOrder()` function to handle order submission
- Real-time order status feedback (loading, success, error)
- Authentication check before order placement
- Firebase Realtime Database integration

**New State Variables**:
```typescript
const [orderLoading, setOrderLoading] = useState(false)
const [orderSuccess, setOrderSuccess] = useState(false)
const [orderError, setOrderError] = useState<string | null>(null)
```

**Cart UI Improvements**:
- Success message with green alert
- Error message with red alert
- Loading spinner during order placement
- Disabled button when not authenticated
- Button text changes based on state

### Farmer Dashboard
**Location**: `src/app/farmer/dashboard/page.tsx`

**Already Has**:
- Real-time order monitoring from Firebase
- Order status update functionality
- Bidirectional sync with organization orders
- Order filtering and search capabilities

## Database Structure

```
firebase-realtime-database/
├── farmers/
│   └── {farmerId}/
│       └── orders/
│           └── {orderId}/
│               ├── organizationId
│               ├── organizationName
│               ├── productId
│               ├── productName
│               ├── quantity
│               ├── pricePerUnit
│               ├── unit
│               ├── totalAmount
│               ├── status
│               ├── requestDate
│               └── type
│
├── organizations/
│   └── {organizationId}/
│       └── orders/
│           └── {orderId}/
│               ├── (same fields as above)
│               ├── farmerId
│               └── farmerName
│
└── products/
    └── {productId}/
        ├── id
        ├── name
        ├── description
        ├── price
        ├── category
        ├── stock
        ├── unit
        ├── farmerId
        ├── farmerName
        ├── isActive
        ├── createdAt
        └── updatedAt
```

## Usage Flow

### For Organizations:
1. Navigate to `/organization/dashboard/farmer/{farmerId}/products`
2. Browse products from specific farmer
3. Add desired products to cart with quantities
4. Click cart icon (shows item count)
5. Review cart items and total
6. Click "Place Bulk Order"
7. See confirmation message
8. Track order in organization dashboard

### For Farmers:
1. Navigate to `/farmer/dashboard`
2. Click "Orders" tab
3. See all incoming orders in real-time
4. Review order details (organization, product, quantity, amount)
5. Accept order (changes status to "confirmed")
6. Mark as "In Transit" when shipping
7. Mark as "Delivered" when complete
8. Changes sync to organization's view

## Error Handling

The system handles various error scenarios:
- **Not authenticated**: Shows warning message, disables order button
- **Empty cart**: Shows error message
- **Network failure**: Displays error with retry option
- **Firebase error**: Logs error, shows user-friendly message

## Security Considerations

1. **Authentication Required**: Users must be signed in to place orders
2. **User ID Verification**: Uses session user ID, not client-provided ID
3. **Firebase Rules**: Ensure proper read/write rules are set (see FIREBASE_RULES_README.md)

## Testing the Feature

### Prerequisites:
1. User signed in as organization
2. At least one farmer with products in database
3. Firebase Realtime Database accessible

### Steps:
1. Sign in as organization user
2. Browse farmer products
3. Add items to cart
4. Place order
5. Sign in as farmer
6. Check farmer dashboard orders tab
7. Verify order appears with correct details
8. Update order status
9. Sign back in as organization
10. Verify status updated in organization view

## Troubleshooting

### Order not appearing in farmer dashboard:
- Check Firebase console for order data
- Verify farmerId is correctly set on products
- Check Firebase database rules allow write access
- Verify user authentication is working

### Status sync not working:
- Check farmer dashboard `updateOrderStatus` function
- Verify both farmer and organization order paths are correct
- Check Firebase rules allow cross-path updates
- Review browser console for errors

### Cart total incorrect:
- Verify product prices are numbers, not strings
- Check quantity multiplication logic
- Ensure all products in cart have valid price data

## Future Enhancements

Potential improvements:
1. Order notifications (email/SMS)
2. Delivery date selection
3. Order notes/special instructions
4. Payment integration
5. Order cancellation by organization
6. Bulk order templates
7. Recurring orders
8. Invoice generation
9. Order history analytics
10. Delivery tracking

## API Endpoints Used

- `GET /api/products?active=true&farmerId={id}` - Fetch farmer's products
- Firebase Realtime Database direct writes for orders

## Related Documentation

- [Firebase Rules](./FIREBASE_RULES_README.md)
- [Architecture](./ARCHITECTURE.md)
- [RBAC Implementation](./RBAC_IMPLEMENTATION_SUMMARY.md)
- [Product Setup](./PRODUCT_SETUP_README.md)
