import { auth } from "@clerk/nextjs"
import { and, eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db, schema } from "@/db/index"
import { ThemeConfig } from "@/db/schema"

export async function GET(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db
    .select({
      theme: schema.apps.theme,
    })
    .from(schema.apps)
    .where(and(eq(schema.apps.id, params.appId), eq(schema.apps.creatorId, userId)))

  if (!rows[0]) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ theme: rows[0].theme || {} })
}

export async function PUT(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: { theme: ThemeConfig } = await request.json()

  await db
    .update(schema.apps)
    .set({
      theme: body.theme,
      updatedAt: sql`now()`,
    })
    .where(and(eq(schema.apps.id, params.appId), eq(schema.apps.creatorId, userId)))

  return NextResponse.json({ success: true })
}
