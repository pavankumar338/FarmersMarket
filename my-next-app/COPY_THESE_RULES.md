# 🔥 COPY THESE EXACT RULES TO FIREBASE CONSOLE

## Step 1: Copy Everything Below
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

## Step 2: Where to Paste
1. **Open**: https://console.firebase.google.com/
2. **Select your project**
3. **Go to**: Build → Realtime Database → **Rules tab**
4. **Delete everything** in the editor
5. **Paste** the JSON above
6. **Click "Publish"** ✅

## Step 3: Enable Anonymous Auth
1. Build → **Authentication** → **Sign-in method**
2. Enable **"Anonymous"**
3. Click **Save**

## ✅ Done!
Go to http://localhost:3000/auth/debug and refresh - error should be gone!
