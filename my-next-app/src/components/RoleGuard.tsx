"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"

interface RoleGuardProps {
  allowedRoles: ("farmer" | "organization")[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Client-side component to protect routes based on user role
 * Wraps content that should only be visible to specific roles
 */
export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    // Not authenticated
    if (!session || !session.user) {
      router.push("/auth/signin")
      return
    }

    // Check if user has required role
    if (!allowedRoles.includes(session.user.role)) {
      // Redirect to their appropriate dashboard
      if (session.user.role === "farmer") {
        router.push("/farmer/dashboard")
      } else if (session.user.role === "organization") {
        router.push("/organization/dashboard")
      } else {
        router.push("/")
      }
    }
  }, [session, status, router, allowedRoles])

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or wrong role
  if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
    return fallback ? <>{fallback}</> : null
  }

  // Authorized
  return <>{children}</>
}
