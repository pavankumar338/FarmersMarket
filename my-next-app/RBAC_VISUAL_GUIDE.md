# Role-Based Access Control - Visual Guide

## 🎭 User Registration & Role Assignment

```
┌─────────────────────────────────────────────────────────────┐
│                    Registration Page                        │
│                  /auth/register                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  User fills form:    │
              │  - Name              │
              │  - Email             │
              │  - Password          │
              │  - Role: 🧑‍🌾 Farmer   │
              │     or   🏛️ Org      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  POST /api/register  │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌────────────────┐            ┌────────────────────┐
│ Role: farmer   │            │ Role: organization │
└────────┬───────┘            └─────────┬──────────┘
         │                               │
         ▼                               ▼
   Database Entry:                 Database Entry:
   /users/{id}                     /users/{id}
   role: "farmer"                  role: "organization"
         │                               │
         ▼                               ▼
   Profile Created:                Profile Created:
   /farmers/{id}/profile          /organizations/{id}/profile
```

---

## 🔐 Sign-In & Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Sign In Page                           │
│                   /auth/signin                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  User credentials    │
              │  + Role from DB      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   NextAuth.js        │
              │   Validates & loads  │
              │   role from database │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │    JWT Token         │
              │    Contains:         │
              │    - id              │
              │    - email           │
              │    - name            │
              │    - role            │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Session Created     │
              │  session.user.role   │
              └──────────────────────┘
```

---

## 🚪 Route Access Control

```
                     ┌─────────────────────┐
                     │  User Navigates to  │
                     │    Protected Route  │
                     └──────────┬──────────┘
                                │
                ┌───────────────┴────────────────┐
                │                                │
                ▼                                ▼
    ┌─────────────────────┐          ┌─────────────────────┐
    │  /farmer/dashboard  │          │  /organization/     │
    │                     │          │    dashboard        │
    └──────────┬──────────┘          └──────────┬──────────┘
               │                                │
               ▼                                ▼
    ┌─────────────────────┐          ┌─────────────────────┐
    │   RoleGuard         │          │   RoleGuard         │
    │   allowedRoles:     │          │   allowedRoles:     │
    │   ["farmer"]        │          │   ["organization"]  │
    └──────────┬──────────┘          └──────────┬──────────┘
               │                                │
               ▼                                ▼
    ┌─────────────────────┐          ┌─────────────────────┐
    │  Check Session      │          │  Check Session      │
    │  session.user.role  │          │  session.user.role  │
    └──────────┬──────────┘          └──────────┬──────────┘
               │                                │
               │                                │
     ┌─────────┴─────────┐          ┌─────────┴─────────┐
     │                   │          │                   │
     ▼                   ▼          ▼                   ▼
┌─────────┐      ┌──────────┐  ┌────────────┐   ┌─────────┐
│ Farmer  │      │   Org    │  │   Farmer   │   │   Org   │
│  ✅     │      │   ❌     │  │    ❌      │   │   ✅    │
└────┬────┘      └─────┬────┘  └──────┬─────┘   └────┬────┘
     │                 │              │              │
     ▼                 ▼              ▼              ▼
┌─────────┐      ┌──────────┐  ┌────────────┐   ┌─────────┐
│  ALLOW  │      │ REDIRECT │  │  REDIRECT  │   │  ALLOW  │
│  ACCESS │      │    to    │  │     to     │   │ ACCESS  │
│         │      │ /org/... │  │ /farmer/...│   │         │
└─────────┘      └──────────┘  └────────────┘   └─────────┘
```

---

## 🎯 Role Separation Matrix

```
┌────────────────────────────────────────────────────────────────┐
│                    ACCESS CONTROL MATRIX                       │
├──────────────────────┬──────────────────┬──────────────────────┤
│      Route           │   Farmer Role    │ Organization Role    │
├──────────────────────┼──────────────────┼──────────────────────┤
│ /farmer/dashboard    │    ✅ ALLOWED    │   ❌ REDIRECT        │
│ /farmer/products     │    ✅ ALLOWED    │   ❌ REDIRECT        │
│ /farmer/orders       │    ✅ ALLOWED    │   ❌ REDIRECT        │
│ /farmer/analytics    │    ✅ ALLOWED    │   ❌ REDIRECT        │
├──────────────────────┼──────────────────┼──────────────────────┤
│ /organization/...    │   ❌ REDIRECT    │    ✅ ALLOWED        │
│ /organization/orders │   ❌ REDIRECT    │    ✅ ALLOWED        │
│ /organization/subs   │   ❌ REDIRECT    │    ✅ ALLOWED        │
├──────────────────────┼──────────────────┼──────────────────────┤
│ /                    │    ✅ PUBLIC     │    ✅ PUBLIC         │
│ /products            │    ✅ PUBLIC     │    ✅ PUBLIC         │
│ /about               │    ✅ PUBLIC     │    ✅ PUBLIC         │
│ /contact             │    ✅ PUBLIC     │    ✅ PUBLIC         │
└──────────────────────┴──────────────────┴──────────────────────┘
```

---

## 🔄 Redirect Logic Flow

```
┌──────────────────────────────────────────────────────┐
│           User tries to access route                 │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │   Is Authenticated?  │
           └──────────┬───────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
        NO                        YES
         │                         │
         ▼                         ▼
    ┌─────────┐         ┌──────────────────┐
    │ Redirect│         │  Check Role      │
    │   to    │         │  vs Required     │
    │ /signin │         └────────┬─────────┘
    └─────────┘                  │
                    ┌────────────┴────────────┐
                    │                         │
                  MATCH                    MISMATCH
                    │                         │
                    ▼                         ▼
              ┌──────────┐         ┌──────────────────┐
              │  ALLOW   │         │    Redirect to   │
              │  ACCESS  │         │  Correct Dash    │
              └──────────┘         └──────────────────┘
                                            │
                              ┌─────────────┴─────────────┐
                              │                           │
                         User is                     User is
                         Farmer                      Organization
                              │                           │
                              ▼                           ▼
                    ┌───────────────────┐    ┌───────────────────┐
                    │    Redirect to    │    │    Redirect to    │
                    │ /farmer/dashboard │    │  /organization/   │
                    │                   │    │    dashboard      │
                    └───────────────────┘    └───────────────────┘
```

---

## 🧩 Component Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        App Layout                          │
│                   (SessionProvider)                        │
└────────────────────────┬───────────────────────────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
         ▼                                ▼
┌──────────────────┐           ┌──────────────────┐
│  Farmer Routes   │           │ Organization     │
│                  │           │    Routes        │
└────────┬─────────┘           └─────────┬────────┘
         │                               │
         ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│   RoleGuard      │           │   RoleGuard      │
│   Component      │           │   Component      │
│                  │           │                  │
│ Props:           │           │ Props:           │
│ allowedRoles:    │           │ allowedRoles:    │
│   ["farmer"]     │           │   ["org"]        │
└────────┬─────────┘           └─────────┬────────┘
         │                               │
         ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│  Dashboard       │           │  Dashboard       │
│  Content         │           │  Content         │
│  (Only if auth   │           │  (Only if auth   │
│   and correct    │           │   and correct    │
│   role)          │           │   role)          │
└──────────────────┘           └──────────────────┘
```

---

## 🛡️ Security Layers

```
┌────────────────────────────────────────────────────────────┐
│                    LAYER 1: CLIENT-SIDE                    │
│                     RoleGuard Component                    │
│  - Immediate UI protection                                 │
│  - Redirect before page renders                            │
│  - Shows loading state during check                        │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    LAYER 2: SESSION                        │
│                   NextAuth JWT Token                       │
│  - Role stored in encrypted token                          │
│  - Validated on each request                               │
│  - Type-safe with TypeScript                               │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    LAYER 3: SERVER-SIDE                    │
│              requireRole() & API Protection                │
│  - Server components verify role                           │
│  - API routes check session                                │
│  - Database queries filtered by user                       │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    LAYER 4: DATABASE                       │
│                  Firebase Security Rules                   │
│  - Role-based read/write rules                             │
│  - Data isolation by user ID                               │
│  - Validation of role field                                │
└────────────────────────────────────────────────────────────┘
```

---

## 📱 User Experience Flow

### Farmer's Journey
```
1. Register as "Farmer" 🧑‍🌾
   ↓
2. Sign in
   ↓
3. Sees Farmer Dashboard ✅
   ↓
4. Tries to visit /organization/dashboard
   ↓
5. Automatically redirected to /farmer/dashboard ↩️
   ↓
6. Can manage products, view orders, etc. ✅
```

### Organization's Journey
```
1. Register as "Organization" 🏛️
   ↓
2. Sign in
   ↓
3. Sees Organization Dashboard ✅
   ↓
4. Tries to visit /farmer/dashboard
   ↓
5. Automatically redirected to /organization/dashboard ↩️
   ↓
6. Can place orders, manage subscriptions, etc. ✅
```

---

## 🎨 Visual Role Indicators

```
┌─────────────────────────────────────────────────────────┐
│                    FARMER VIEW                          │
│                                                         │
│  🧑‍🌾 Farmer Dashboard                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │  My Products  │  Orders  │  Analytics          │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  Navigation shows:                                      │
│  - Products Management                                  │
│  - Order Tracking                                       │
│  - Sales Analytics                                      │
│                                                         │
│  ❌ No Organization Features Visible                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 ORGANIZATION VIEW                       │
│                                                         │
│  🏛️ Organization Dashboard                              │
│  ┌────────────────────────────────────────────────┐    │
│  │  Orders  │  Subscriptions  │  Deliveries       │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  Navigation shows:                                      │
│  - Place Orders                                         │
│  - Manage Subscriptions                                 │
│  - Track Deliveries                                     │
│                                                         │
│  ❌ No Farmer Features Visible                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

```
[✅] RoleGuard component created
[✅] roleCheck utilities created
[✅] Farmer dashboard protected
[✅] Organization dashboard protected
[✅] Access denied page created
[✅] Automatic redirects implemented
[✅] Session role validation
[✅] TypeScript types updated
[✅] Loading states handled
[✅] Error handling implemented
[✅] Documentation created

🎉 RBAC FULLY IMPLEMENTED!
```

---

This visual guide demonstrates the complete role-based access control system that separates farmer and organization access completely.
