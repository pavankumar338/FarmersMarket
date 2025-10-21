import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Server-side role check utility
 * Use this in server components or API routes
 */
export async function requireRole(allowedRoles: ("farmer" | "organization")[]) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect("/auth/signin")
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    // Redirect to their appropriate dashboard
    if (session.user.role === "farmer") {
      redirect("/farmer/dashboard")
    } else if (session.user.role === "organization") {
      redirect("/organization/dashboard")
    } else {
      redirect("/")
    }
  }
  
  return session
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: "farmer" | "organization"): Promise<boolean> {
  const session = await getServerSession(authOptions)
  return session?.user?.role === role
}

/**
 * Get current user session (server-side)
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}
