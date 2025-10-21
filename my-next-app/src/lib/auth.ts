import { NextAuthOptions, User } from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { database } from "@/lib/firebase"
import { ref, push, set, get, query, orderByChild, equalTo, update } from "firebase/database"
import { adminDb } from "@/lib/firebaseAdmin"

type AppUser = { id: string; email: string; password?: string; name: string; role: "farmer" | "organization" }

async function getUserByEmail(email: string): Promise<AppUser | null> {
  try {
    const usersRef = ref(database, "users")
    const q = query(usersRef, orderByChild("email"), equalTo(email))
    const snap = await get(q)
    if (!snap.exists()) {
      console.log("No user found with email:", email)
      return null
    }
    const obj = snap.val() as Record<string, Omit<AppUser, "id">>
    const [key] = Object.keys(obj)
    const u = obj[key]
    console.log("User found:", key, u.email, u.role)
    return { id: key, ...u }
  } catch (error) {
    console.error("Error fetching user by email:", error)
    throw error
  }
}

async function createUser(user: Omit<AppUser, "id"> & { password?: string }, id?: string): Promise<AppUser> {
  try {
    if (id) {
      // Put at specific key
      const userRef = ref(database, `users/${id}`)
      const toSave = { ...user, id }
      await set(userRef, toSave)
      return { id, ...user }
    }
    const listRef = ref(database, "users")
    const newRef = push(listRef)
    const newId = newRef.key as string
    const toSave = { ...user, id: newId }
    await set(newRef, toSave)
    return { id: newId, ...user }
  } catch (error) {
    console.error("Firebase createUser error:", error)
    throw error
  }
}

async function ensureRoleProfile(u: AppUser) {
  try {
    const basePath = u.role === "farmer" ? `farmers/${u.id}/profile` : `organizations/${u.id}/profile`
    if (adminDb) {
      // Use Admin SDK on the server to bypass client-side security rules
      const adminRef = adminDb.ref(basePath)
      const snap = await adminRef.get()
      if (!snap.exists()) {
        await adminRef.set({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: Date.now(),
        })
      } else {
        await adminRef.update({ role: u.role })
      }
      return
    }

    // Fallback to client SDK if Admin isn't available
    const profileRef = ref(database, basePath)
    const snap = await get(profileRef)
    if (!snap.exists()) {
      await set(profileRef, {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: Date.now(),
      })
    } else {
      await update(profileRef, { role: u.role })
    }
  } catch (error) {
    console.error("Firebase ensureRoleProfile error:", error)
    throw error
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password")
          return null
        }

        try {
          // Find user in database by email
          const user = await getUserByEmail(credentials.email)

          if (!user) {
            console.error("User not found for email:", credentials.email)
            return null
          }

          if (!user.password) {
            console.error("User has no password stored:", credentials.email)
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (!isValid) {
            console.error("Password mismatch for user:", credentials.email)
            return null
          }

          console.log("Authentication successful for:", credentials.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Ensure we have a stable user id for both Credentials and OAuth flows
      // Priority: explicit user.id (from credentials) -> token.sub (NextAuth default) -> providerAccountId -> email
      const oauthId = token.sub || account?.providerAccountId
      if (user?.id) {
        token.id = user.id
      } else if (!token.id) {
        token.id = (oauthId as string) || (token.email as string) || ""
      }

      // Try to unify id with an existing DB user by email (handles first-time Google linking)
      const email = (token.email as string) || (user?.email as string) || ""
      if (email) {
        try {
          const existing = await getUserByEmail(email)
          if (existing) {
            token.id = existing.id
            if (!token.role) token.role = existing.role
          }
        } catch {
          // ignore
        }
      }

      // Persist role from user (credentials) if present
      if (user && (user as User & { role?: "farmer" | "organization" }).role) {
        token.role = (user as User & { role?: "farmer" | "organization" }).role
      }

      // For Google sign-in (OAuth) default to farmer when role is not set
      if (account?.provider === "google" && !token.role) {
        token.role = "farmer"
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string)
        session.user.role = (token.role as "farmer" | "organization") || "farmer"
      }
      return session
    },
  },
  events: {
    // Ensure a user record exists for OAuth sign-ins
    async signIn({ user, account }) {
      try {
        if (!account) return
        if (account.provider === "google") {
          const email = user.email as string
          const name = user.name || email?.split("@")[0] || "User"
          // Prefer provider account id for stable key
          const oauthId = account.providerAccountId
          const existing = email ? await getUserByEmail(email) : null
          const role: "farmer" | "organization" = "farmer"
          if (!existing) {
            const created = await createUser({ email, name, role }, oauthId)
            await ensureRoleProfile(created)
          } else {
            // Make sure role profile exists
            await ensureRoleProfile(existing)
          }
        }
      } catch (e) {
        // Non-fatal: logging only
        console.error("signIn event error:", e)
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
}

// Helper function to add a user (for registration)
export async function registerUser(email: string, password: string, name: string, role: "farmer" | "organization") {
  const hashedPassword = await bcrypt.hash(password, 10)
  // Check if user already exists by email
  const existing = await getUserByEmail(email)
  if (existing) {
    throw new Error("User already exists")
  }
  const created = await createUser({ email, password: hashedPassword, name, role })
  await ensureRoleProfile(created)
  return created
}
