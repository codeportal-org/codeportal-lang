import { and, eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db, schema } from "@/db/index"
import { nanoid } from "@/lib/nanoid"

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path

  const appId = path[0]!
  const firstSegment = path[2]
  const secondSegment = path[3]
  const thirdSegment = path[4]

  const app = await db.query.apps.findFirst({
    where: eq(schema.apps.id, appId),
  })

  if (!app || !appId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (firstSegment !== "data" || !secondSegment) {
    return NextResponse.json({ message: `${app.name} API` })
  }

  // like: GET APP_ID.codeportal.io/api/data/DATA_NAME/DATA_ID
  if (thirdSegment) {
    const data = await db.query.appData.findFirst({
      where: and(
        eq(schema.appData.name, secondSegment),
        eq(schema.appData.applicationId, appId),
        eq(schema.appData.id, thirdSegment),
      ),
    })

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ ...(data.data as any), id: data.id, createdAt: data.createdAt })
  }

  // like: GET APP_ID.codeportal.io/api/data/DATA_NAME/
  // GET all data with name DATA_NAME
  const data = await db.query.appData.findMany({
    where: and(eq(schema.appData.name, secondSegment), eq(schema.appData.applicationId, appId)),
    orderBy: (data, { asc }) => asc(data.createdAt),
  })

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const processedData = data.map((item) => ({
    ...(item.data as any),
    id: item.id,
    createdAt: item.createdAt,
  }))

  return NextResponse.json(processedData)
}

export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path

  const appId = path[0]!
  const firstSegment = path[2]
  const secondSegment = path[3]

  const app = await db.query.apps.findFirst({
    where: eq(schema.apps.id, appId),
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

  const entryId = (schema.appData.id.defaultFn || nanoid)()

  await db.insert(schema.appData).values({
    id: entryId,
    name: secondSegment,
    applicationId: appId,
    data,
  })

  const entry = await db.query.appData.findFirst({
    where: eq(schema.appData.id, entryId),
  })

  return NextResponse.json({
    ...(entry!.data as any),
    id: entry!.id,
    "created at": entry!.createdAt,
  })
}

export async function DELETE(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path

  const appId = path[0]!
  const firstSegment = path[2]
  const secondSegment = path[3]
  const thirdSegment = path[4]

  const app = await db.query.apps.findFirst({
    where: eq(schema.apps.id, appId),
  })

  if (!app || !appId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (firstSegment !== "data" || !secondSegment || !thirdSegment) {
    return NextResponse.json({ error: "Unsupported path" }, { status: 400 })
  }

  await db
    .delete(schema.appData)
    .where(
      and(
        eq(schema.appData.applicationId, appId),
        eq(schema.appData.name, secondSegment),
        eq(schema.appData.id, thirdSegment),
      ),
    )

  return NextResponse.json({ success: true })
}

export async function PUT(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path

  const appId = path[0]!
  const firstSegment = path[2]
  const secondSegment = path[3]
  const thirdSegment = path[4]

  const app = await db.query.apps.findFirst({
    where: eq(schema.apps.id, appId),
  })

  if (!app || !appId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (firstSegment !== "data" || !secondSegment || !thirdSegment) {
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

  if (!data) {
    return NextResponse.json({ error: "Unsupported content-type" }, { status: 400 })
  }

  await db
    .update(schema.appData)
    .set({ data, updatedAt: sql`now()` })
    .where(
      and(
        eq(schema.appData.applicationId, appId),
        eq(schema.appData.name, secondSegment),
        eq(schema.appData.id, thirdSegment),
      ),
    )

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path

  const appId = path[0]!
  const firstSegment = path[2]
  const secondSegment = path[3]
  const thirdSegment = path[4]

  const app = await db.query.apps.findFirst({
    where: eq(schema.apps.id, appId),
  })

  if (!app || !appId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (firstSegment !== "data" || !secondSegment || !thirdSegment) {
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

  if (!data) {
    return NextResponse.json({ error: "Unsupported content-type" }, { status: 400 })
  }

  const existingData = await db.query.appData.findFirst({
    where: and(
      eq(schema.appData.applicationId, appId),
      eq(schema.appData.name, secondSegment),
      eq(schema.appData.id, thirdSegment),
    ),
  })

  if (!existingData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await db
    .update(schema.appData)
    .set({
      data: {
        ...(existingData.data as any),
        ...data,
      },
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(schema.appData.applicationId, appId),
        eq(schema.appData.name, secondSegment),
        eq(schema.appData.id, thirdSegment),
      ),
    )

  return NextResponse.json({ success: true })
}
