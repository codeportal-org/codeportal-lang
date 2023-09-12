import { Parser } from "acorn"
import acornJSXParser from "acorn-jsx"
import { LooseParser } from "acorn-loose"
import { JSXSyntaxCompletionResponse } from "app/api/apps/[appId]/jsx-syntax-completion/types"
import { createNanoEvents } from "nanoevents"

const JSXParser = Parser.extend(acornJSXParser())

/**
 * This takes GPT4 code as a stream and outputs valid AST code.
 * Heavily tailored for the App component creation use case. It is designed to be incremental and resilient to errors.
 */
export class CodeProcessor {
  private lastProcessedCodeLength = 0
  private characterLengthStep = 80
  private minAPICallInterval = 8000
  private jsxMode = false
  private returnStatement: any
  private currentCode = ""
  private apiTokenFn: () => string | null = () => null

  /** Used to cap the maximum of API call, at the moment GPT4 is heavily rate limited */
  private maxApiCalls = 1
  private numApiCalls = 0

  lastAPICallTimestamp = 0

  private events = createNanoEvents()

  constructor(public options: { appId: string }) {}

  setApiTokenFn(apiTokenFn: () => string | null) {
    this.apiTokenFn = apiTokenFn
  }

  reset() {
    this.lastProcessedCodeLength = 0
    this.characterLengthStep = 80
    this.jsxMode = false
    this.returnStatement = null
  }

  async processStep(code: string) {
    this.currentCode = code

    if (code.length <= this.lastProcessedCodeLength + this.characterLengthStep) {
      return
    }
    this.lastProcessedCodeLength = code.length

    console.log("---- processStep -- PASSED")

    if (this.jsxMode) {
      console.log("---- processStep -- JSX MODE")

      if (this.numApiCalls >= this.maxApiCalls) {
        console.log("---- processStep -- TOO MANY API CALLS")
        return
      }

      if (Date.now() - this.lastAPICallTimestamp < this.minAPICallInterval) {
        console.log("---- processStep -- TOO SOON")
        return
      }

      const token = await this.apiTokenFn()

      console.log("---- processStep -- CALLING API", token)

      const returnCodeSection = code.slice(this.returnStatement.start)

      this.lastAPICallTimestamp = Date.now()
      this.numApiCalls += 1
      const res = await fetch(`/api/apps/${this.options.appId}/jsx-syntax-completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: returnCodeSection,
        }),
      })
      // after the first be less aggressive
      this.characterLengthStep = 1000

      const data: JSXSyntaxCompletionResponse = await res.json()

      console.log("---- data", data.completion)

      if (data.completion === "") {
        return
      }

      const completeCode =
        code.slice(0, this.returnStatement.start) + returnCodeSection + data.completion + "}"

      const ast = this.process(completeCode)

      this.emitAST(ast)
    }

    const ast: any = LooseParser.parse(code, { ecmaVersion: "latest" })

    // if it finds a return statement inside the App function it means the large JSX will start so we will start guessing with
    // small GPT4 requests
    {
      const functionStatements = ast?.body[0].body.body
      const returnStatement = functionStatements.find(
        (statement: any) =>
          statement.type === "ReturnStatement" && statement.argument.type === "BinaryExpression",
      )

      if (returnStatement) {
        this.jsxMode = true
        this.returnStatement = returnStatement

        // JSX is more verbose so we will add a larger step
        this.characterLengthStep = 600

        console.log("---- processStep -- ACTIVATED JSX MODE")
      }
    }

    console.log("---- processStep -- RETURNED AST", ast)

    this.emitAST(ast)
  }

  process(code: string) {
    let ast: any
    try {
      ast = JSXParser.parse(code, { ecmaVersion: "latest" })
    } catch (e) {
      console.log(e)
    }

    return ast
  }

  onAST(callback: (ast: any) => void) {
    return this.events.on("ast", callback)
  }

  private emitAST(ast: any) {
    this.events.emit("ast", ast)
  }
}
