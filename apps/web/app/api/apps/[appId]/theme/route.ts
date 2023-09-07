import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const code = await prisma.application.findFirst({
    where: { creatorId: userId, id: params.appId },
  })

  if (!code) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ theme: (code.mainModuleCodeTree as any)?.theme || { color: "zinc" } })
}

export async function PUT(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const body: { theme: { color: "zinc" | "blue" } } = await request.json()

  const code = await prisma.application.findFirst({
    where: { creatorId: userId, id: params.appId },
  })

  if (!code) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.application.update({
    where: { creatorId: userId, id: params.appId },
    data: {
      mainModuleCodeTree: { ...(code.mainModuleCodeTree as any), theme: body.theme },
    },
  })

  return NextResponse.json({ success: true })
}
