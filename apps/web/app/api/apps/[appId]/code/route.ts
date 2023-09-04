import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const app = await prisma.application.findFirst({
    where: { id: params.appId },
  })

  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 })
  }

  return NextResponse.json(app.mainModuleCodeTree)
}

export async function POST(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const body = await request.json()

  await prisma.application.update({
    where: { id: params.appId },
    data: {
      mainModuleCodeTree: { code: body.code, prompt: body.prompt },
    },
  })

  return NextResponse.json({ success: true })
}
