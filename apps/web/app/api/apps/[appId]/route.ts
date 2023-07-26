import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const appId = params.appId

  const app = await prisma.application.findFirst({
    where: { creatorId: userId, id: appId },
    orderBy: { lastOpenedAt: "desc" },
  })

  return NextResponse.json(app)
}
