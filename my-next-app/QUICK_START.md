# 🚀 Quick Start Guide - FarmFresh Direct

## ⚡ Fast Setup (5 Minutes)

### 1. Install Dependencies
```powershell
npm install
npm install next-auth@latest bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. Create `.env.local`
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Run the App
```powershell
npm run dev
```

Visit: **http://localhost:3000**

---

## 🎯 Key Features at a Glance

| Feature | Route | Description |
|---------|-------|-------------|
| **Homepage** | `/` | Main landing page with hero & features |
| **Products** | `/products` | Browse all products with cart |
| **Bulk Orders** | `/bulk-orders` | Schedule recurring deliveries |
| **Sign In** | `/auth/signin` | Login for farmers & organizations |
| **Register** | `/auth/register` | Create new account |
| **Farmer Dashboard** | `/farmer/dashboard` | Manage products & orders |
| **Org Dashboard** | `/organization/dashboard` | Track orders & deliveries |
| **Contact** | `/contact` | Get in touch |
| **About** | `/about` | Learn about us |

---

## 👥 User Roles

### 🌾 Farmers
- **Sign In**: Email/Password OR Google
- **Can**: Add products, manage inventory, view orders, track sales
- **Dashboard**: `/farmer/dashboard`

### 🏛️ Organizations
- **Types**: College, School, Apartment Community
- **Sign In**: Email/Password only
- **Can**: Browse products, place bulk orders, track deliveries
- **Dashboard**: `/organization/dashboard`

---

## 🔑 Authentication Flow

```
Register → Choose Role → Sign In → Dashboard
```

### Farmer Login
1. Go to `/auth/signin`
2. Select "Farmer"
3. Use email/password OR Google
4. Access farmer dashboard

### Organization Login
1. Go to `/auth/signin`
2. Select "Organization"
3. Use email/password
4. Access organization dashboard

---

## 📦 Main Features

### For Farmers
✅ Product Management (Add/Edit/Delete)
✅ Order Management
✅ Sales Analytics
✅ Revenue Tracking

### For Organizations
✅ Browse Product Catalog
✅ Place Bulk Orders
✅ Schedule Subscriptions (Weekly/Bi-weekly/Monthly)
✅ Track Deliveries
✅ Order History

---

## 🎨 Pages Overview

### Public Pages
- **Homepage**: Marketing, features, CTAs
- **Products**: Catalog with filtering
- **About**: Mission, team, values
- **Contact**: Form + info

### Protected Pages
- **Farmer Dashboard**: Products, orders, analytics tabs
- **Organization Dashboard**: Orders, subscriptions, deliveries tabs

---

## 🛠️ Tech Stack

```
Next.js 15.5.6 + TypeScript + Tailwind CSS 4 + NextAuth.js
```

---

## 📱 Responsive Design

✅ Mobile-friendly
✅ Tablet-optimized
✅ Desktop-enhanced

---

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT session tokens
- Role-based access control
- Secure OAuth integration

---

## 🎭 Demo Data

Currently using **mock/in-memory data**:
- Products: 15 sample items
- Orders: Sample order history
- Users: Register to create

---

## 🚀 Production Checklist

Before deploying:
- [ ] Set up real database (MongoDB/PostgreSQL)
- [ ] Configure production NEXTAUTH_URL
- [ ] Add real product images
- [ ] Integrate payment gateway
- [ ] Set up email service
- [ ] Configure cloud storage
- [ ] Add monitoring/analytics
- [ ] Set up SSL certificate

---

## 💡 Tips

1. **Testing Auth**: Register new accounts to test flows
2. **Google OAuth**: Need Google Cloud Console setup
3. **Data Persistence**: Currently in-memory (resets on restart)
4. **Styling**: Uses Tailwind - easy to customize colors
5. **Icons**: Using emojis - can replace with icon libraries

---

## 🆘 Common Issues

### ❌ "Module not found"
```powershell
npm install
```

### ❌ "NEXTAUTH_SECRET missing"
Add to `.env.local`

### ❌ Google login fails
Check redirect URI in Google Console

### ❌ Styles not loading
Restart dev server

---

## 📞 Support

- Check `SETUP_GUIDE.md` for detailed setup
- Review `README.md` for full documentation
- Examine code comments for implementation details

---

## ⭐ Quick Commands

```powershell
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

---

**🎉 Ready to go! Start exploring the application.**
