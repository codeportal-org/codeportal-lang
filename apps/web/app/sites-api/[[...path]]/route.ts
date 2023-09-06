import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path

  // temporarily the appId will be the subdomain before we allow custom subdomains
  const appId = path[0]
  const firstSegment = path[2]
  const secondSegment = path[3]
  const thirdSegment = path[4]

  const app = await prisma.application.findFirst({
    where: { id: appId },
    orderBy: { lastOpenedAt: "desc" },
  })

  if (!app || !appId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (firstSegment !== "data" || !secondSegment) {
    return NextResponse.json({ message: `${app.name} API` })
  }

  const data = await prisma.applicationData.findMany({
    where: thirdSegment
      ? {
          name: secondSegment,
          applicationId: appId,
          id: thirdSegment,
        }
      : {
          name: secondSegment,
          applicationId: appId,
        },
  })

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const processedData = data.map((item) => ({ ...(item.data as any), id: item.id }))

  return NextResponse.json(processedData)
}

export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path

  // temporarily the appId will be the subdomain before we allow custom subdomains
  const appId = path[0]
  const firstSegment = path[2]
  const secondSegment = path[3]

  const app = await prisma.application.findFirst({
    where: { id: appId },
    orderBy: { lastOpenedAt: "desc" },
  })

  if (!app || !appId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (firstSegment !== "data" || !secondSegment) {
    return NextResponse.json({ error: "Unsupported path" }, { status: 400 })
  }

  let data
  if (req.headers.get("content-type") === "application/json") {
    data = await req.json()
  } else if (req.headers.get("content-type") === "application/x-www-form-urlencoded") {
    data = await req.formData()
  } else {
    return NextResponse.json({ error: "Unsupported content-type" }, { status: 400 })
  }

  const entry = await prisma.applicationData.create({
    data: {
      name: secondSegment,
      applicationId: appId,
      data,
    },
  })

  return NextResponse.json({ ...(entry.data as any), id: entry.id })
}

export async function DELETE(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path

  // temporarily the appId will be the subdomain before we allow custom subdomains
  const appId = path[0]
  const firstSegment = path[2]
  const secondSegment = path[3]
  const thirdSegment = path[4]

  const app = await prisma.application.findFirst({
    where: { id: appId },
    orderBy: { lastOpenedAt: "desc" },
  })

  if (!app || !appId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (firstSegment !== "data" || !secondSegment) {
    return NextResponse.json({ error: "Unsupported path" }, { status: 400 })
  }

  await prisma.applicationData.delete({
    where: {
      applicationId: appId,
      name: secondSegment,
      id: thirdSegment,
    },
  })

  return NextResponse.json({ success: true })
}
