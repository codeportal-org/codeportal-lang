import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

import { db } from "@/db/index"

export async function GET(request: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const appId = params.appId

  const app = await db.query.apps.findFirst({
    where: (apps, { eq, and }) => and(eq(apps.creatorId, userId), eq(apps.id, appId)),
  })

  if (!app) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(app)
}
