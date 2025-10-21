import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
  const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

  const user = await registerUser(email, password, name, role)

    return NextResponse.json(
      { message: "User registered successfully", user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : "Registration failed"
    const status = message.includes("exists") ? 409 : 500
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}
