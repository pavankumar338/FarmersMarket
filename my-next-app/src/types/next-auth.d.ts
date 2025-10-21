import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "farmer" | "organization"
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "farmer" | "organization"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "farmer" | "organization"
  }
}
