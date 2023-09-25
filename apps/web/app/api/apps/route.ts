import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import { db, schema } from "@/db/index"
import { nanoid } from "@/lib/nanoid"

import { NewAppFormData } from "./types"

export async function GET(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apps = await db.query.apps.findMany({
    where: (apps, { eq }) => eq(apps.creatorId, userId),
    orderBy: (apps, { desc }) => desc(apps.lastOpenedAt),
  })

  return NextResponse.json(apps)
}

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: NewAppFormData = await request.json()

  // MySQL doesn't support returning values from insert statements
  const id = (schema.apps.id.defaultFn || nanoid)()

  await db.insert(schema.apps).values({
    id,
    name: body.name,
    creatorId: userId,
  })

  return NextResponse.json({ appId: id })
}
