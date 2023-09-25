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

  const { prompt } = await req.json()

  const userPrompt = createUserPrompt(prompt)

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    max_tokens: 4000,
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
  })

  const stream = OpenAIStream(response)

  return new StreamingTextResponse(stream)
}

function createSystemPrompt() {
  return `You’re a web app creator that responds with the code of a website or code that will be embedded on a website, based on the user-provided input. All content must be made as engaging and intriguing as possible. You can only respond with valid JSON code. Do not respond with any other text or formatting around the JSON, you must only respond with raw JSON.`
}

function createUserPrompt(userInput: string) {
  return `Create the web app using the following description which was provided by the user, use these requirements as the source of truth. The user request is:
\`\`\`
${userInput}
\`\`\`

Give the app a title with a h1 and a meaningful name and description.

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

Use the TypeScript interface to create the app as JSON. The interface is:
\`\`\`ts
type UINode = UIElementNode | UITextNode | UIFragmentNode

type ComponentNode = {
  type: "component"
  name: string
  statements: Statement[]
}

type UIElementNode = {
  type: "ui element"
  tag: string
  style?: Record<string, any>
  children?: UINode[]
}

type UITextNode = {
  type: "ui text"
  text: string
}

type UIFragmentNode = {
  type: "ui fragment"
  children?: UINode[]
}

type Statement = ReturnStatement | PrintStatement

type ReturnStatement = {
  type: "return"
  arg: Expression
}

/** Print the expression to the console */
type PrintStatement = {
  type: "print"
  arg: Expression
}

type Expression = StringLiteral | NumberLiteral | BooleanLiteral | UINode

type StringLiteral = {
  type: "string"
  value: string
}

type NumberLiteral = {
  type: "number"
  value: number
}

type BooleanLiteral = {
  type: "boolean"
  value: boolean
}
\`\`\`

For instance:

\`\`\`json
{
  type: "component",
  name: "App",
  statements: [
    {
      type: "return",
      arg: {
        type: "ui element",
        tag: "div",
        style: {
          color: "green",
          fontSize: "20px",
        },
        children: [
          {
            type: "ui text",
            text: "Hello world!",
          },
        ],
      },
    },
  ],
}
\`\`\`

Follow these rules to the letter:
- An input element should never have children. Do not include a children property.
- The body element is not allowed.
- Any form or form like interface should be inside a container with the class: max-w-2xl mx-auto. If not, wrap the content of the app in a container with the class: max-w-3xl mx-auto. Transform those TailwindCSS classes to CSS styles and put them in the style property, use rem units and be careful with x and y axis. For instance: mx-auto becomes margin-left: auto; margin-right: auto;.

In components the return statement is the end of the component. Do not include any other statements after the return.

I’ll start a component for an app which must implement the user specifications in JSON and you’ll continue exactly where I left off:
\`\`\`json
{"type":"component","name":"App","statements":[`
}
