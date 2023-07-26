import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export type AppOpenedRequest = {
  id: string
}

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const body: AppOpenedRequest = await request.json()

  const res = await prisma.application.update({
    where: { id: body.id },
    data: { lastOpenedAt: new Date() },
  })

  return NextResponse.json({ appId: res.id })
}
