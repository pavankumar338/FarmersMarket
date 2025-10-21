"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function AccessDeniedPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            {session?.user?.role === "farmer" ? (
              <>
                You are logged in as a <strong>Farmer</strong>. This page is only accessible to Organizations.
              </>
            ) : session?.user?.role === "organization" ? (
              <>
                You are logged in as an <strong>Organization</strong>. This page is only accessible to Farmers.
              </>
            ) : (
              "Please log in with the appropriate account type to access this page."
            )}
          </p>
        </div>

        <div className="space-y-3">
          {session?.user?.role === "farmer" && (
            <Link
              href="/farmer/dashboard"
              className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Go to Farmer Dashboard
            </Link>
          )}
          {session?.user?.role === "organization" && (
            <Link
              href="/organization/dashboard"
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Go to Organization Dashboard
            </Link>
          )}
          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
