import { auth } from "@clerk/nextjs"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import OpenAI from "openai"

import { db, schema } from "@/db/index"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = "edge"

export async function POST(req: Request, { params }: { params: { appId: string } }) {
  // const { userId } = auth()
  // if (!userId) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }
  // // Development only route
  // if (process.env.NODE_ENV !== "development") {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }
  // const appId = params.appId
  // const app = await db.query.apps.findFirst({
  //   where: and(eq(schema.apps.creatorId, userId), eq(schema.apps.id, appId)),
  // })
  // if (!app) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }
  // const { prompt } = await req.json()
  // const userPrompt = createUserPrompt(prompt)
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   stream: true,
  //   max_tokens: 4000,
  //   temperature: 0,
  //   top_p: 0,
  //   messages: [
  //     {
  //       role: "system",
  //       content: createSystemPrompt(),
  //     },
  //     {
  //       role: "user",
  //       content: userPrompt,
  //     },
  //   ],
  //   frequency_penalty: 0,
  //   presence_penalty: 0,
  //   user: userId,
  // })
  // const stream = OpenAIStream(response)
  // return new StreamingTextResponse(stream)
}

export async function GET(req: Request, { params }: { params: { appId: string } }) {
  return NextResponse.json({ message: "Hello World" })
}
