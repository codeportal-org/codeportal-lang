"use client"

import React from "react"

import { CodeTreeView } from "@/core/CodeTreeView"
import { CodeDB } from "@/core/lang/codeDB"
import { ErrorData, ProgramNode } from "@/core/lang/codeTree"
import { Interpreter } from "@/core/lang/interpreter"
import { cn } from "@/lib/utils"

export function CodeSnippetClient({ codeTree }: { codeTree: ProgramNode | undefined }) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [printOutput, setPrintOutput] = React.useState<any[]>([])

  const [codeDB] = React.useState<CodeDB>(() => {
    const _codeDB = new CodeDB()

    _codeDB.setDebugMode(false)

    if (codeTree) {
      _codeDB.load(codeTree)
    }

    return _codeDB
  })

  const interpreter = React.useMemo(() => {
    const _interpreter = new Interpreter()

    _interpreter.setCommonGlobal("print", (...args: any[]) => {
      setPrintOutput((prev) => [...prev, ...args])
    })

    _interpreter.setCommonGlobal("error", (errorData: ErrorData) => {
      codeDB.addNodeError(errorData)

      const mainNode = codeDB.getNodeByID(errorData.nodeId)
      const subNodes = errorData.subNodeIds.map((id) => codeDB.getNodeByID(id))

      let name = (mainNode as any)?.name

      let i = 0
      while (!name) {
        name = (subNodes[i] as any)?.name
        i++
      }

      const message = name ? `Error in '${name}': ${errorData.message}` : errorData.message

      setPrintOutput((prev) => [...prev, message])
    })

    return _interpreter
  }, [])

  return (
    <div className="w-full">
      <CodeTreeView codeDB={codeDB} codeTree={codeTree} />
      <button
        className={cn("mt-2 rounded-md bg-green-500 px-2 py-1 text-white hover:bg-green-600", {
          "cursor-not-allowed opacity-50": isRunning,
        })}
        onClick={() => {
          setIsRunning(true)
          setPrintOutput([])

          // clear errors
          const errors = interpreter.getErrors()

          for (const error of errors) {
            codeDB.removeNodeErrors(error.nodeId)
          }

          setTimeout(() => {
            interpreter.resetState()

            // this doesn't take into account async work
            interpreter.interpret(codeDB.codeTree!)

            setIsRunning(false)
          }, 300) // fake delay
        }}
      >
        {isRunning ? "Running..." : "Run"}
      </button>

      {/* Output */}
      <div>
        {printOutput.length === 0 && <div className="pt-8">{/* spacer */}</div>}
        {printOutput.map((output, i) => (
          <div key={i} className="m-1">
            {JSON.stringify(output)}
          </div>
        ))}
      </div>
    </div>
  )
}
