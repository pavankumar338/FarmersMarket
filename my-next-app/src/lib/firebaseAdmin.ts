import { App, getApps, initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getDatabase } from "firebase-admin/database"

// Server-side Firebase Admin initialization
// Reads credentials from environment variables. Ensure these are set in your environment (.env.local for Next.js server runtime):
// FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL

let adminApp: App | undefined

try {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_PRIVATE_KEY
    const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL

    // Support escaped newlines in private key (common when stored in .env)
    if (privateKey && privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n")
    }

    if (projectId && clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL,
      })
    } else {
      // Leave adminApp undefined in local/dev without explicit credentials
      console.warn("Firebase Admin not initialized: missing FIREBASE_* service account env vars.")
    }
  }
} catch (e) {
  // Avoid crashing in environments without admin credentials; callers should handle undefined exports gracefully
  console.error("Failed to initialize Firebase Admin:", e)
}

export const adminAuth = adminApp ? getAuth(adminApp) : undefined
export const adminDb = adminApp ? getDatabase(adminApp) : undefined
