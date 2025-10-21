import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminAuth } from "@/lib/firebaseAdmin"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!adminAuth) {
      return NextResponse.json({ error: "Server auth not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in your server environment." }, { status: 500 })
    }
    const uid = session.user.id
    const additionalClaims = {
      role: session.user.role || "farmer",
    }
    const customToken = await adminAuth.createCustomToken(uid, additionalClaims)
    return NextResponse.json({ token: customToken })
  } catch (e) {
    console.error("Failed to mint custom token:", e)
    return NextResponse.json({ error: "Failed to mint token" }, { status: 500 })
  }
}
