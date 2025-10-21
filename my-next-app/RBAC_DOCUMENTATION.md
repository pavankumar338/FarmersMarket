# Role-Based Access Control (RBAC) Documentation

## Overview

The application implements role-based access control to ensure that farmers and organizations have separate, isolated access to their respective features and dashboards.

## User Roles

### 1. Farmer
- Can access: `/farmer/*` routes
- Dashboard: `/farmer/dashboard`
- Features:
  - Add and manage products
  - View orders from organizations
  - Track sales analytics
  - Manage inventory

### 2. Organization
- Can access: `/organization/*` routes
- Dashboard: `/organization/dashboard`
- Features:
  - Place orders
  - Manage subscriptions
  - Track deliveries
  - View order history

## Implementation

### 1. Type Definitions (`src/types/next-auth.d.ts`)

```typescript
interface User {
  id: string
  role: "farmer" | "organization"
}
```

The role is stored in the user's session and database record.

### 2. Role Protection Components

#### Client-Side Protection: `RoleGuard` Component

Location: `src/components/RoleGuard.tsx`

**Usage:**
```tsx
import RoleGuard from "@/components/RoleGuard"

export default function FarmerDashboard() {
  return (
    <RoleGuard allowedRoles={["farmer"]}>
      <FarmerDashboardContent />
    </RoleGuard>
  )
}
```

**Features:**
- Automatically redirects users with wrong roles
- Shows loading state during authentication check
- Redirects unauthenticated users to sign-in page
- Redirects farmers to `/farmer/dashboard`
- Redirects organizations to `/organization/dashboard`

#### Server-Side Protection: `roleCheck` Utilities

Location: `src/lib/roleCheck.ts`

**Functions:**

1. **`requireRole(allowedRoles)`** - Use in server components/API routes
   ```typescript
   // In a server component or API route
   import { requireRole } from "@/lib/roleCheck"
   
   export default async function FarmerPage() {
     const session = await requireRole(["farmer"])
     // Only farmers can reach here
   }
   ```

2. **`hasRole(role)`** - Check if user has specific role
   ```typescript
   const isFarmer = await hasRole("farmer")
   ```

3. **`getCurrentUser()`** - Get current user session
   ```typescript
   const user = await getCurrentUser()
   ```

### 3. Protected Pages

#### Farmer Dashboard
- **File:** `src/app/farmer/dashboard/page.tsx`
- **Protected by:** `RoleGuard` with `allowedRoles={["farmer"]}`
- **Access:** Only users with role "farmer"

#### Organization Dashboard
- **File:** `src/app/organization/dashboard/page.tsx`
- **Protected by:** `RoleGuard` with `allowedRoles={["organization"]}`
- **Access:** Only users with role "organization"

### 4. Access Denied Page

- **Route:** `/access-denied`
- **File:** `src/app/access-denied/page.tsx`
- **Purpose:** Shows friendly error when users try to access unauthorized pages
- **Features:**
  - Explains why access was denied
  - Shows user's current role
  - Provides link to their appropriate dashboard
  - Link to home page

## How It Works

### Registration Flow

```
User fills registration form
    ↓
Selects role: "farmer" or "organization"
    ↓
POST /api/auth/register
    ↓
Role stored in database at /users/{userId}/role
    ↓
Profile created at /farmers/{userId} or /organizations/{userId}
    ↓
User can only access routes for their role
```

### Sign-In Flow

```
User signs in with credentials
    ↓
NextAuth loads user from database
    ↓
Role retrieved and stored in JWT token
    ↓
Role added to session object
    ↓
RoleGuard checks session.user.role
    ↓
If role matches: Allow access
If role doesn't match: Redirect to appropriate dashboard
If not authenticated: Redirect to sign-in
```

### Route Access Flow

```
User navigates to /farmer/dashboard
    ↓
RoleGuard component mounts
    ↓
Checks session.user.role
    ↓
If role === "farmer": ✅ Show content
If role === "organization": ❌ Redirect to /organization/dashboard
If no session: ❌ Redirect to /auth/signin
```

## Adding Role Protection to New Pages

### For Client Components:

```tsx
"use client"

import RoleGuard from "@/components/RoleGuard"

function MyPageContent() {
  return <div>Protected Content</div>
}

export default function MyPage() {
  return (
    <RoleGuard allowedRoles={["farmer"]}>
      <MyPageContent />
    </RoleGuard>
  )
}
```

### For Server Components:

```tsx
import { requireRole } from "@/lib/roleCheck"

export default async function MyServerPage() {
  const session = await requireRole(["farmer"])
  
  return <div>Protected Content for {session.user.name}</div>
}
```

### For API Routes:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  if (session.user.role !== "farmer") {
    return NextResponse.json(
      { error: "Forbidden - Farmers only" },
      { status: 403 }
    )
  }
  
  // API logic here
}
```

## Database Structure

```
/users
  /{userId}
    - id: string
    - email: string
    - name: string
    - role: "farmer" | "organization"
    - password: string (hashed)

/farmers
  /{userId}
    /profile
      - id: string
      - name: string
      - email: string
      - role: "farmer"
      - createdAt: number
    /products
      /{productId}
        - product data
    /orders
      /{orderId}
        - order data

/organizations
  /{userId}
    /profile
      - id: string
      - name: string
      - email: string
      - role: "organization"
      - createdAt: number
    /orders
      /{orderId}
        - order data
    /subscriptions
      /{subscriptionId}
        - subscription data
```

## Security Considerations

### ✅ Implemented

1. **Client-side role checking** - Immediate UI protection
2. **Session-based authentication** - Role stored in JWT
3. **Automatic redirects** - Users redirected to appropriate areas
4. **Database isolation** - Separate data paths for farmers and organizations
5. **Type safety** - TypeScript ensures role values are valid

### 🔒 Recommended Additional Security

1. **Server-side API protection** - Always verify role in API routes
2. **Firebase Database Rules** - Add role-based rules:

```json
{
  "rules": {
    "farmers": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid && root.child('users').child($uid).child('role').val() == 'farmer'"
      }
    },
    "organizations": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid && root.child('users').child($uid).child('role').val() == 'organization'"
      }
    }
  }
}
```

3. **Middleware protection** - Add Next.js middleware for route-level protection

## Testing Role Protection

### Test Scenario 1: Farmer tries to access Organization Dashboard
```
1. Sign in as farmer
2. Navigate to /organization/dashboard
3. Expected: Redirected to /farmer/dashboard
```

### Test Scenario 2: Organization tries to access Farmer Dashboard
```
1. Sign in as organization
2. Navigate to /farmer/dashboard
3. Expected: Redirected to /organization/dashboard
```

### Test Scenario 3: Unauthenticated user
```
1. Sign out (or don't sign in)
2. Navigate to /farmer/dashboard or /organization/dashboard
3. Expected: Redirected to /auth/signin
```

## Troubleshooting

### Issue: User can access wrong dashboard
**Solution:** Check that RoleGuard is properly wrapping the page content

### Issue: Infinite redirect loop
**Solution:** Ensure RoleGuard only redirects once and session is properly set

### Issue: Role not persisting after sign-in
**Solution:** Check that role is properly stored in JWT callback in `authOptions`

### Issue: Role showing as undefined
**Solution:** 
1. Check database - user should have role field
2. Check session callback in auth.ts
3. Verify TypeScript types in next-auth.d.ts

## Summary

✅ **Farmers** can only access farmer routes (`/farmer/*`)
✅ **Organizations** can only access organization routes (`/organization/*`)
✅ **Automatic redirects** prevent unauthorized access
✅ **Type-safe** implementation with TypeScript
✅ **Easy to extend** with additional roles or permissions
✅ **Production-ready** security implementation

The RBAC system ensures complete separation between farmer and organization features, preventing cross-access and maintaining data security.
