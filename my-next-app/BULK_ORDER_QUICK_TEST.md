# Quick Test Guide for Bulk Order Feature

## Prerequisites
- ✅ Firebase configured and running
- ✅ At least one farmer account with products
- ✅ At least one organization account
- ✅ Products have `farmerId` field populated

## Step-by-Step Test

### 1. Prepare Test Data

**Option A: Use existing farmers**
- Check your Firebase Realtime Database for existing farmers
- Note down a farmerId

**Option B: Create test farmer**
```bash
# Register as farmer through /auth/register
# Or use existing farmer credentials
```

### 2. Add Products for Farmer

**If no products exist, add some:**
1. Sign in as farmer
2. Go to `/farmer/dashboard`
3. Click "Add Product" or "Upload CSV"
4. Add at least 2-3 products with stock > 0

### 3. Test Organization Flow

**Step 3.1: Sign in as Organization**
```
1. Sign out if logged in as farmer
2. Navigate to /auth/signin
3. Sign in with organization credentials
4. Should redirect to /organization/dashboard
```

**Step 3.2: Browse Farmer Products**
```
1. From organization dashboard, find farmer list
2. Click on a farmer to view their products
3. URL should be: /organization/dashboard/farmer/{farmerId}/products
4. Should see ProductsWithDatabase component with farmer's products
```

**Step 3.3: Add Items to Cart**
```
1. Click "Add to Cart" on 2-3 different products
2. Cart icon should appear in bottom-right with item count
3. Item count should increase with each addition
4. Multiple clicks on same product increase quantity
```

**Step 3.4: Review Cart**
```
1. Click the floating cart button (bottom-right)
2. Cart sidebar should slide in from right
3. Verify:
   ✓ All added products are listed
   ✓ Quantities are correct
   ✓ Prices are displayed
   ✓ Total is calculated correctly
   ✓ Plus/minus buttons work
   ✓ Text is readable (dark on light background)
```

**Step 3.5: Place Order**
```
1. In cart sidebar, click "Place Bulk Order"
2. Button should show loading spinner
3. After 1-2 seconds, should see green success message
4. Cart should clear automatically
5. Cart sidebar should close after 2 seconds
```

### 4. Verify Farmer Dashboard

**Step 4.1: Switch to Farmer Account**
```
1. Sign out from organization account
2. Sign in as the farmer whose products were ordered
3. Navigate to /farmer/dashboard
```

**Step 4.2: Check Orders Tab**
```
1. Click on "Orders" tab
2. Should see the new order(s) at the top
3. Verify order details:
   ✓ Organization name is correct
   ✓ Product names match what was ordered
   ✓ Quantities are correct
   ✓ Price per unit is correct
   ✓ Total amount = quantity × price per unit
   ✓ Status shows "Pending"
   ✓ Request date is recent
```

**Step 4.3: Test Status Update**
```
1. Find the pending order
2. Click "Accept Order" button
3. Status should change to "Confirmed"
4. Click "Mark as In Transit"
5. Status should change to "In Transit"
6. Click "Mark as Delivered"
7. Status should change to "Delivered"
```

### 5. Verify Organization Dashboard

**Step 5.1: Return to Organization Account**
```
1. Sign out from farmer account
2. Sign in as organization
3. Navigate to organization dashboard
```

**Step 5.2: Check Order Status**
```
1. Find orders section in organization dashboard
2. Locate the order that was placed
3. Verify status matches what farmer set
4. Should show "Delivered" if all steps completed
```

## Expected Results

### ✅ Success Indicators
- [x] Products load correctly with farmerId
- [x] Cart icon appears when items added
- [x] Cart total calculates correctly
- [x] Order placement succeeds without errors
- [x] Success message displays in green
- [x] Order appears in farmer dashboard immediately
- [x] Order details are accurate
- [x] Status updates work in both directions
- [x] All text is readable (proper contrast)

### ❌ Common Issues

**Issue: "Please sign in to place order"**
- Solution: Make sure you're signed in as organization
- Check browser console for session errors

**Issue: Order not appearing in farmer dashboard**
- Check: Did products have farmerId set?
- Check: Firebase console - is order data written?
- Check: Firebase rules allow write access?

**Issue: Cart button missing/not working**
- Clear browser cache
- Check browser console for JavaScript errors
- Verify ProductsWithDatabase component loaded

**Issue: Text not visible in product cards**
- This was fixed - text should be dark gray (#222, #333)
- If still an issue, check browser dev tools for CSS conflicts

**Issue: Status update doesn't sync**
- Check Firebase rules
- Check browser console for errors
- Verify both farmer and org order records exist

## Debug Checklist

If something doesn't work:

1. **Check Browser Console**
   ```
   F12 → Console tab → Look for red errors
   ```

2. **Check Firebase Console**
   ```
   - Go to Firebase Console
   - Select your project
   - Navigate to Realtime Database
   - Check paths:
     - farmers/{farmerId}/orders/
     - organizations/{orgId}/orders/
     - products/
   ```

3. **Check Network Tab**
   ```
   F12 → Network tab → Look for failed requests
   ```

4. **Verify Authentication**
   ```javascript
   // In browser console:
   console.log(session) // Should show user data
   ```

5. **Check Product Data**
   ```javascript
   // Verify products have farmerId:
   // In Firebase console, check any product node
   // Should have: farmerId, farmerName, price, stock, etc.
   ```

## Quick Fixes

### Reset Cart
```javascript
// In browser console:
localStorage.clear()
// Then refresh page
```

### Check Session
```javascript
// In browser console:
console.log(sessionStorage)
console.log(localStorage)
```

### Force Re-render
```
Ctrl + F5 (hard refresh)
```

## Performance Check

Time each step to ensure responsiveness:
- Product load: < 2 seconds
- Add to cart: Instant
- Open cart: Instant
- Place order: < 3 seconds
- Order appears in dashboard: < 2 seconds (with refresh)

## Success Metrics

All features working if:
1. ✅ Order flow completes end-to-end
2. ✅ No console errors
3. ✅ Data persists across page refreshes
4. ✅ Status updates sync bidirectionally
5. ✅ UI is responsive and user-friendly
6. ✅ Text is clearly visible throughout

## Next Steps After Testing

If all tests pass:
- Test with multiple products from different farmers
- Test edge cases (empty cart, network offline)
- Test with large quantities
- Test concurrent orders
- Add error recovery features
- Implement notifications
- Add delivery date picker
- Add order notes field
