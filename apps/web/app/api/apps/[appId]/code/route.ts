import { auth } from "@clerk/nextjs"
import { eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db, schema } from "@/db/index"

export async function GET(req: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const app = await db.query.apps.findFirst({
    where: eq(schema.apps.id, params.appId),
  })

  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 })
  }

  return NextResponse.json({ code: app.mainModule?.code, prompt: app.prompt })
}

export async function PATCH(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const body = await request.json()

  const completeCodeString = `{"type":"component","name":"App","statements":[${body.code}`

  const code = JSON.parse(completeCodeString)

  await db
    .update(schema.apps)
    .set({
      prompt: body.prompt,
      mainModule: { code },
      updatedAt: sql`now()`,
    })
    .where(eq(schema.apps.id, params.appId))

  return NextResponse.json({ success: true })
}
