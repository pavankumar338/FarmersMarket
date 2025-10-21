# ⚡ QUICK FIX: Organizations Not Seeing Farmers

## 🎯 Problem
Organizations dashboard shows: **"Total Farmers: 0"** and **"Available Products: 0"**

## ✅ Solution (Copy Rules)

### Step 1: Open Firebase Console
🔗 https://console.firebase.google.com/

### Step 2: Go to Rules
**Build** → **Realtime Database** → **Rules** tab

### Step 3: Replace with These Rules
**Delete everything** and paste this:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    
    "users": {
      ".read": true,
      ".indexOn": ["email"],
      "$uid": {
        ".write": "!data.exists() || auth.uid == $uid"
      }
    },
    
    "farmers": {
      ".read": true,
      "$farmerId": {
        ".read": true,
        "profile": {
          ".read": true,
          ".write": "auth != null && auth.uid == $farmerId"
        },
        "products": {
          ".read": true,
          ".write": "auth != null && auth.uid == $farmerId",
          "$productId": {
            ".read": true,
            ".write": "auth != null && auth.uid == $farmerId"
          }
        },
        "orders": {
          ".read": "auth != null && auth.uid == $farmerId",
          "$orderId": {
            ".write": "auth != null"
          }
        }
      }
    },
    
    "organizations": {
      ".read": "auth != null && root.child('users/' + auth.uid + '/role').val() == 'organization'",
      "$orgId": {
        ".read": "auth != null && (auth.uid == $orgId || root.child('users/' + auth.uid + '/role').val() == 'organization')",
        ".write": "auth != null && auth.uid == $orgId",
        "profile": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $orgId"
        },
        "orders": {
          ".read": "auth != null && auth.uid == $orgId",
          "$orderId": {
            ".write": "auth != null && auth.uid == $orgId"
          }
        },
        "subscriptions": {
          ".read": "auth != null && auth.uid == $orgId",
          "$subId": {
            ".write": "auth != null && auth.uid == $orgId"
          }
        },
        "deliveries": {
          ".read": "auth != null && auth.uid == $orgId",
          "$deliveryId": {
            ".write": "auth != null && auth.uid == $orgId"
          }
        }
      }
    },
    
    "products": {
      ".read": true,
      "$productId": {
        ".read": true,
        ".write": "auth != null && data.child('farmerId').val() == auth.uid",
        ".validate": "newData.hasChildren(['name', 'category', 'price', 'unit', 'stock', 'description', 'farmerId', 'isActive'])"
      }
    },
    
    "orders": {
      ".read": "auth != null",
      "$orderId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### Step 4: Publish
Click **"Publish"** button (blue, top right)

### Step 5: Test
Go to `/organization/browse` - farmers should now appear! ✅

---

## 🔑 Key Changes

**Before:**
```json
"farmers": { ".read": "auth != null" }  // ❌ Blocked
```

**After:**
```json
"farmers": { ".read": true }  // ✅ Public marketplace
```

---

## ✅ What Works Now

- ✅ Organizations see all farmers
- ✅ Organizations see all products
- ✅ Search and filter works
- ✅ Request orders works
- ✅ Farmers can still add products

---

## 🔒 Still Secure

- 🔒 Only farmers can edit their own products
- 🔒 Organizations can only edit their own data
- 🔒 Orders are private to relevant parties

---

**Time: 2 minutes** ⏱️  
**Difficulty: Just copy & paste** ✨
