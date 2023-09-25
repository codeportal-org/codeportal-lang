import { auth } from "@clerk/nextjs"
import { and, asc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db, schema } from "@/db/index"

export async function GET(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const appId = params.appId

  const app = await db.query.apps.findFirst({
    where: and(eq(schema.apps.creatorId, userId), eq(schema.apps.id, appId)),
  })

  if (!app) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(schema.appData)
    .where(eq(schema.appData.applicationId, appId))
    .orderBy(asc(schema.appData.createdAt))

  const entries = rows || []

  const processedEntries = entries.map((entry) => ({
    ...(entry.data as any),
    id: entry.id,
    "created at": entry.createdAt,
  }))

  return NextResponse.json({
    entries: processedEntries,
  })
}
