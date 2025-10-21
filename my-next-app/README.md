# 🌾 FarmFresh Direct - Farmers' Business Website

A comprehensive platform connecting farmers directly with institutions (colleges, schools, apartment communities) for fresh produce delivery, eliminating middlemen.

## 🚀 Features

### 🏠 Homepage
- Professional hero section highlighting farm-fresh products
- Benefits showcase (quality, pricing, delivery)
- Product category preview
- Sustainability and farmer empowerment messaging

### 🛍️ Product Catalog
- Browse products by category (Fruits, Vegetables, Grains, Dairy)
- Detailed product information with pricing and availability
- Shopping cart functionality

### 🧑‍💼 Organization & Farmer Features
- Google Sign-In for farmers
- Email/password authentication
- Role-based dashboards
- Product and order management

### 📅 Bulk Orders & Subscriptions
- Schedule regular deliveries (weekly, bi-weekly, monthly)
- Custom product selection
- Order tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js with Google OAuth
 - **Backend**: Firebase (Auth, Realtime Database, Storage)

## Getting Started

First, configure environment variables:

1. Copy `.env.local.example` to `.env.local`.
2. The example is pre-filled with your Firebase project's public keys. Adjust if needed.
3. Optionally add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if you plan to use Google sign-in via NextAuth.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Firebase Usage

Firebase is initialized in `src/lib/firebase.ts` and exports:

- `auth` (Firebase Authentication)
- `database` (Realtime Database)
- `storage` (Cloud Storage)
- `googleProvider` (GoogleAuthProvider for client sign-in flows)

Usage example:

```ts
import { auth, database } from "@/lib/firebase"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
