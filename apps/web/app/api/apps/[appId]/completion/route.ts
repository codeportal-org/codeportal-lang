import { auth } from "@clerk/nextjs"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { NextResponse } from "next/server"
import OpenAI from "openai"

// import prisma from "@/lib/prisma"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Prisma doesn't support the edge runtime yet, if this becomes a problem we can
// switch to Drizzle ORM
export const runtime = "edge"

export async function POST(req: Request, { params }: { params: { appId: string } }) {
  const { userId } = auth()
  if (!userId) {
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return
  }

  const appId = params.appId

  // const app = await prisma.application.findFirst({
  //   where: { creatorId: userId, id: appId },
  //   orderBy: { lastOpenedAt: "desc" },
  // })

  // if (!app) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  const { prompt } = await req.json()

  const userPrompt = createUserPrompt(prompt)

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    max_tokens: 6826,
    temperature: 0,
    top_p: 0.1,
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
  })

  const stream = OpenAIStream(response)

  return new StreamingTextResponse(stream)
}

function createSystemPrompt() {
  return `You’re a web app creator that responds with the code of a website or code that will be embedded on a website, based on the user-provided input. All content should be as impressive and exciting as possible. You can only respond with valid JavaScript code. Do not respond with any other text or formatting around the JavaScript, you must only respond with raw JavaScript. Use React with the HTM (Hyperscript Tagged Markup) library syntax. Use createRoot from React 18. Use Tailwind CSS for styling.`
}

function createUserPrompt(userInput: string) {
  return `Create the web app using the following description which was provided by the user:

\`\`\`
${userInput}
\`\`\`

Keep titles short and catchy. Use at least a couple of sentences for all other text. Titles and subtitles
should be bold and creative. Don’t repeat the user request verbatim in the content. Never use placeholder
names like Jane Doe or Acme Inc., instead use real names and companies.

Never use these characters:

- \\'
- \"

Instead, always use these characters:

- “
- ”
- ‘
- ’

So never write quotation marks and apostrophes like this:

- \"This isn\\'t right\"
- Andreas\\' ability
- can\\'t, isn\\'t, won\\'t

Instead, always write quotation marks and apostrophes like this:

- “That’s better!”
- Andreas’ ability
- can’t, isn’t, won’t

Never use the zero width space character (U+200B).

In React when there is a derived value from two states, do not use another state, use a derived value instead.

Carefully design what the user requests. Make sure the buttons and the main features work correctly. If there is an input with a possible action when hitting enter, implement the action on enter key functionality. If there is an input, validate that it cannot be submitted empty. If there is a customizable list in the requirements, include a way to delete the items. If there are very common easy to implement features that are obvious, implement them. Style the container of the app so it is well aligned and well designed.

If the user is asking for an app to collect end user data, include all of it including end user submitted data and derived data.

If the user does not specify the endpoint where to send form data, submit all the data to this URL '/api/data/{form-name}' as a POST request form body include. Give form-name a descriptive form name for the data.

If the UI has a checkbox-like control, make it squared.

Wrap HTTP requests (fetch) inside try-catch to account for errors.

IMPORTANT - If there are possible errors from HTTP requests, display it with a modal or toast. Avoid user technical jargon. Do not user the term "fetch".

IMPORTANT - NEVER include the error message in the app. Instead, display a user friendly message. NEVER say, oops, something went wrong, or something similar in an error message. Instead, say what happened, why it happened and what the user can do to fix it.

IMPORTANT - You don't include images in the app if the user does not require it explicitly.

IMPORTANT - You don't include videos in the app if the user does not require it explicitly.

IMPORTANT - You don't include audio in the app if the user does not require it explicitly.

IMPORTANT - Any form or form like interface should be inside a container with lg:max-w-2xl class.

Do not import Tailwind CSS.

I’ll start a JavaScript app which must implement the user specifications and you’ll continue exactly where I left off:

import * as react from \"react\"
import ReactDOM from 'react-dom'
import { html } from 'htm/react'

`
}
