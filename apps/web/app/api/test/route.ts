import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  return NextResponse.json({ message: `Hello ${userId}` })
}
