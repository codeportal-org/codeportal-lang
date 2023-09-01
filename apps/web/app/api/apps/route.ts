import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

import { NewAppFormData } from "./types"

export async function GET(request: Request) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const apps = await await prisma.application.findMany({
    where: { creatorId: userId },
    orderBy: { lastOpenedAt: "desc" },
  })

  return NextResponse.json(apps)
}

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const body: NewAppFormData = await request.json()

  const res = await prisma.application.create({
    data: { name: body.name, creatorId: userId },
  })

  return NextResponse.json({ appId: res.id })
}
