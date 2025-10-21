# Firebase Realtime Database Rules Setup Guide

## 🔥 Quick Setup Instructions

### Step 1: Copy the Rules
The complete Firebase Realtime Database rules are in the file `firebase.rules.json`

### Step 2: Apply to Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project
3. Navigate to: **Build** → **Realtime Database** → **Rules**
4. Copy the entire contents of `firebase.rules.json`
5. Paste into the Firebase Console Rules editor
6. Click **Publish**

### Step 3: Enable Anonymous Authentication
1. In Firebase Console: **Build** → **Authentication** → **Sign-in method**
2. Enable **Anonymous** provider
3. Save

---

## 📋 What These Rules Do

### ✅ Users Collection
- Users can read their own data
- Organizations can view all users (to see farmers)
- Users can only write their own data

### ✅ Farmers Collection
- **Everyone** (authenticated) can read farmer profiles and products (public marketplace)
- **Farmers** can only write their own data
- **Organizations** can view all farmers and products to place orders

### ✅ Organizations Collection
- **Organizations** can read and write their own data
- Other users cannot access organization data

### ✅ Products Collection (Global)
- **Everyone** (authenticated) can read all products
- Only the **product owner** (farmer) can update/delete their products
- Validates required fields on write

### ✅ Orders Collection
- Users can read their own orders
- Users can create orders

---

## 🔒 Security Features

1. **Role-based Access**: Different permissions for farmers vs organizations
2. **Data Isolation**: Users can only modify their own data
3. **Public Marketplace**: Products are visible to all authenticated users
4. **Validation**: Ensures required fields are present
5. **Anonymous Auth**: Allows temporary access for browsing

---

## 🚨 Important Notes

### For Development
The current rules allow anonymous authentication which is useful for testing. This lets you:
- Browse products without signing in
- Test the app quickly
- Sign in anonymously for Firebase operations

### For Production
Consider tightening the rules:
1. Remove anonymous authentication if not needed
2. Add more specific validation rules
3. Add rate limiting via Firebase App Check
4. Implement field-level validation

---

## 🧪 Testing the Rules

### Test 1: Farmer Can Add Products
```javascript
// As a farmer (auth.uid = "farmer123")
// Try to write to /farmers/farmer123/products/product1
// Expected: ✅ SUCCESS
```

### Test 2: Farmer Cannot Modify Other Farmer's Products
```javascript
// As a farmer (auth.uid = "farmer123")
// Try to write to /farmers/farmer456/products/product1
// Expected: ❌ PERMISSION DENIED
```

### Test 3: Organization Can View All Farmers
```javascript
// As an organization (auth.uid = "org123")
// Try to read /farmers
// Expected: ✅ SUCCESS
```

### Test 4: Anyone Can View Products
```javascript
// As any authenticated user
// Try to read /products
// Expected: ✅ SUCCESS
```

---

## 🔧 Troubleshooting

### Error: "Permission Denied"
**Solution:**
1. Ensure you're signed in (not anonymous)
2. Check that Firebase rules are published
3. Verify your user has the correct role in `/users/{uid}/role`
4. Check Firebase Console → Realtime Database → Data to see your user's role

### Error: "Failed to save product"
**Solution:**
1. Sign in to Firebase anonymously first
2. Ensure you're a farmer (role === "farmer")
3. Publish the rules from `firebase.rules.json`
4. Check that you have internet connectivity
5. Verify Firebase config in `.env.local`

### Products Not Showing
**Solution:**
1. Check Firebase Console → Realtime Database → Data
2. Verify products exist at `/products` or `/farmers/{id}/products`
3. Ensure you're authenticated
4. Check browser console for errors

---

## 📖 Rule Structure Explanation

```
/users/{uid}
  - Read: Self or organizations
  - Write: Self only

/farmers/{farmerId}
  - Read: Everyone (public)
  - Write: Only that farmer
  /profile
    - Public farmer information
  /products
    - Products for sale
  /orders
    - Orders received from organizations

/organizations/{orgId}
  - Read: Self or other orgs
  - Write: Self only
  /profile
    - Organization information
  /orders
    - Orders placed by this org
  /subscriptions
    - Recurring orders
  /deliveries
    - Delivery tracking

/products (Global marketplace)
  - Read: Everyone (authenticated)
  - Write: Product owner only
  - Used for the public product catalog

/orders (Global orders)
  - Read: Own orders
  - Write: Authenticated users
```

---

## ✅ Post-Setup Checklist

- [ ] Rules published to Firebase Console
- [ ] Anonymous authentication enabled
- [ ] Rules tested in Firebase Console Rules Playground
- [ ] App can read products
- [ ] Farmers can add products
- [ ] Organizations can view farmers
- [ ] No console errors in browser

---

## 🆘 Need Help?

If you continue to see errors:
1. Check browser console (F12) for specific error messages
2. Check Firebase Console → Realtime Database → Usage for denied requests
3. Use Firebase Rules Playground to simulate requests
4. Ensure `.env.local` has correct Firebase config

The rules in `firebase.rules.json` should work for both development and production with proper role management!
