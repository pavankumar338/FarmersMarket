# 🌾 FarmFresh Direct - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Environment Configuration](#environment-configuration)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Running the Application](#running-the-application)
6. [Project Structure](#project-structure)
7. [Features Overview](#features-overview)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Google Cloud account (for OAuth)
- A code editor (VS Code recommended)

---

## Installation Steps

### 1. Navigate to the project directory
```powershell
cd "c:\Users\pavan\OneDrive\Documents\Projects\Farmers product\my-next-app"
```

### 2. Install dependencies
```powershell
npm install
```

### 3. Install required authentication packages
```powershell
npm install next-auth@latest bcryptjs
npm install --save-dev @types/bcryptjs
```

---

## Environment Configuration

### 1. Create `.env.local` file
Create a file named `.env.local` in the root directory with:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secret-key-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 2. Generate NEXTAUTH_SECRET
Run this in PowerShell:
```powershell
# Generate a random secret
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "FarmFresh Direct")
4. Click "Create"

### Step 2: Enable Google+ API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: FarmFresh Direct
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps

4. Back to Create OAuth client ID:
   - Application type: Web application
   - Name: FarmFresh Direct Web Client
   
5. **Authorized redirect URIs** - Add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**
8. Paste them in your `.env.local` file

---

## Running the Application

### Development Mode
```powershell
npm run dev
```

Open your browser and navigate to: **http://localhost:3000**

### Build for Production
```powershell
npm run build
npm start
```

---

## Project Structure

```
my-next-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── layout.tsx                  # Root layout with SessionProvider
│   │   ├── about/page.tsx              # About page
│   │   ├── products/page.tsx           # Product catalog
│   │   ├── contact/page.tsx            # Contact page
│   │   ├── bulk-orders/page.tsx        # Bulk orders form
│   │   ├── auth/
│   │   │   ├── signin/page.tsx         # Sign in page
│   │   │   └── register/page.tsx       # Registration page
│   │   ├── farmer/
│   │   │   └── dashboard/page.tsx      # Farmer dashboard
│   │   ├── organization/
│   │   │   └── dashboard/page.tsx      # Organization dashboard
│   │   └── api/
│   │       └── auth/
│   │           ├── [...nextauth]/route.ts  # NextAuth handler
│   │           └── register/route.ts       # Registration API
│   ├── lib/
│   │   └── auth.ts                     # Auth configuration
│   ├── components/
│   │   └── SessionProvider.tsx         # Session provider wrapper
│   └── types/
│       └── next-auth.d.ts              # NextAuth types
├── .env.local                          # Environment variables
├── package.json                        # Dependencies
└── README.md                           # Project documentation
```

---

## Features Overview

### 🏠 Homepage (`/`)
- Hero section with CTAs
- Benefits showcase
- Product categories preview
- Impact statistics
- Footer with links

### 🛍️ Products Page (`/products`)
- Filter by category
- Add to cart
- View pricing and availability
- Bulk order CTA

### 🔐 Authentication

**Sign In** (`/auth/signin`)
- Email/password for both roles
- Google Sign-In for farmers
- Role selection (Farmer/Organization)

**Register** (`/auth/register`)
- Organization type selection
- Form validation
- Account creation

### 👨‍🌾 Farmer Dashboard (`/farmer/dashboard`)
**Tabs:**
- **Products**: Add, edit, delete products
- **Orders**: View and manage orders
- **Analytics**: Sales statistics

### 🏛️ Organization Dashboard (`/organization/dashboard`)
**Tabs:**
- **Orders**: View order history
- **Subscriptions**: Manage recurring orders
- **Deliveries**: Track delivery status

### 📦 Bulk Orders (`/bulk-orders`)
- Select delivery frequency
- Choose products and quantities
- Set start date
- Order summary

### 💬 Contact Page (`/contact`)
- Contact form with inquiry types
- Contact information
- FAQs
- Quick links

### ℹ️ About Page (`/about`)
- Mission statement
- Company story
- Values and impact
- Team information

---

## Troubleshooting

### Issue: "Module not found: next-auth"
**Solution:**
```powershell
npm install next-auth@latest
```

### Issue: Google Sign-In not working
**Solution:**
1. Check `.env.local` has correct credentials
2. Verify redirect URI in Google Console matches exactly
3. Restart dev server after changing env variables

### Issue: "Error: NEXTAUTH_SECRET missing"
**Solution:**
Generate and add NEXTAUTH_SECRET to `.env.local`

### Issue: TypeScript errors
**Solution:**
```powershell
npm install --save-dev @types/node @types/react @types/react-dom
```

### Issue: Tailwind styles not working
**Solution:**
Check `tailwind.config.ts` and ensure `globals.css` imports are correct

---

## Testing the Application

### Test User Accounts (Mock Data)
Since we're using in-memory storage, you'll need to:

1. **Register a new account**
   - Go to `/auth/register`
   - Fill in details
   - Choose role (Farmer or Organization)
   - Submit

2. **Sign in with created account**
   - Go to `/auth/signin`
   - Enter credentials
   - Access respective dashboard

3. **Test Google Sign-In** (Farmers only)
   - Click "Sign in with Google"
   - Select Google account
   - Redirected to farmer dashboard

---

## Next Steps for Production

### Database Integration
```bash
npm install prisma @prisma/client
npx prisma init
```

### Payment Integration
```bash
npm install stripe
```

### Image Upload
```bash
npm install cloudinary
```

### Email Service
```bash
npm install nodemailer
```

---

## Important Notes

⚠️ **Current Limitations:**
- Using in-memory storage (data resets on server restart)
- No actual payment processing
- No real-time notifications
- Mock data for products and orders

✅ **Ready for Production:**
- Authentication flow
- UI/UX design
- Routing structure
- Component architecture
- TypeScript types

---

## Support & Documentation

- **Next.js**: https://nextjs.org/docs
- **NextAuth.js**: https://next-auth.js.org/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Quick Start Commands

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

**🎉 You're all set! Start the dev server and explore the application.**

For questions or issues, refer to the troubleshooting section above.
