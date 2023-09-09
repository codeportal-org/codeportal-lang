import { auth } from "@clerk/nextjs"
import { eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db, schema } from "@/db/index"

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

  await db
    .update(schema.apps)
    .set({
      lastOpenedAt: new Date(),
      updatedAt: sql`now()`,
    })
    .where(eq(schema.apps.id, body.id))

  return NextResponse.json({ success: true })
}
