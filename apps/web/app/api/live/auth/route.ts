import { auth } from "@clerk/nextjs"
import { authorize } from "@liveblocks/node"
import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

const secret = process.env.LIVEBLOCKS_SECRET_KEY || ""

if (!secret) {
  throw new Error("Missing LIVEBLOCKS_SECRET_KEY")
}

export async function POST(request: Request) {
  const { userId, user } = auth()

  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const body = await request.json()

  const room = body.room

  const [roomType, roomId] = room.split("-")

  if (roomType === "editor") {
    /** app editor UI */

    /** app editor UI test */
    if (roomId === "xyz") {
      // :)
    } else {
      const app = await prisma.application.findFirst({
        where: { id: roomId, creatorId: userId },
      })

      if (!app) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }
  } else if (roomType === "user" && roomId !== userId) {
    /** User self events */
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } else {
    /* Unknown room type */
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await authorize({
    room,
    secret,
    userId,
    groupIds: [],
    userInfo: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      profileImageUrl: user?.profileImageUrl,
    },
  })

  return NextResponse.json(JSON.parse(result.body), { status: result.status })
}
