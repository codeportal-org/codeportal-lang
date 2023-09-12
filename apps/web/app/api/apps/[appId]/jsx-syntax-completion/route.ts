import { auth } from "@clerk/nextjs"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import OpenAI from "openai"

import { db, schema } from "@/db/index"

import { JSXSyntaxCompletionResponse } from "./types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = "edge"

export async function POST(req: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    console.log("---- no user id", userId)
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const appId = params.appId

  const app = await db.query.apps.findFirst({
    where: and(eq(schema.apps.creatorId, userId), eq(schema.apps.id, appId)),
  })

  if (!app) {
    console.log("---- app not found", appId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = await req.json()

  console.log("---- code", code)

  const userPrompt = createUserPrompt(code)

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      max_tokens: 2000,
      temperature: 0,
      top_p: 0,
      messages: [
        {
          role: "system",
          content: createSystemPrompt(),
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      frequency_penalty: 0,
      presence_penalty: 0,
      user: userId,
    })
    return NextResponse.json({
      completion: response.choices[0]?.message.content || "",
    } as JSXSyntaxCompletionResponse)
  } catch (error) {
    console.error("---- error", error)
    NextResponse.json({ error: "completion error" }, { status: 500 })
  }
}

function createSystemPrompt() {
  return `You are a JSX completion tool. Only close opened tags. Do not add more content, tags or sections. Make sure it is valid JSX. You can only respond with valid JSX code. Do not respond with any other text or formatting around the JSX, you must only respond with raw JSX. Do not export the App component. Make sure you answer and the code I give you match exactly and work. Always answer very short and concise.`
}

function createUserPrompt(userInput: string) {
  return `I’ll start a React component for you to complete to correct it and you'll continue exactly where I left off. Complete with the minimum required:

${userInput}`
}
