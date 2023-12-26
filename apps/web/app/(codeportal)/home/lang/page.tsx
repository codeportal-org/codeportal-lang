"use client"

import React from "react"

import { CodeTreeView } from "@/core/CodeTreeView"
import { CodeDB } from "@/core/lang/codeDB"
import { Interpreter } from "@/core/lang/interpreter"
import { importJS } from "@/core/lang/js-interop/importJS"
import { cn } from "@/lib/utils"

function CodeSnippet({ code }: { code: string }) {
  const codeTree = React.useMemo(() => importJS(code), [code])

  const [isRunning, setIsRunning] = React.useState(false)
  const [printOutput, setPrintOutput] = React.useState<any[]>([])

  const interpreter = React.useMemo(() => {
    const _interpreter = new Interpreter()

    _interpreter.setCommonGlobal("print", (...args: any[]) => {
      setPrintOutput((prev) => [...prev, ...args])
    })

    return _interpreter
  }, [])

  const [codeDB] = React.useState<CodeDB>(() => {
    const _codeDB = new CodeDB()

    if (codeTree) {
      _codeDB.load(codeTree)
    }

    return _codeDB
  })

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

          setTimeout(() => {
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

export default function LangDemoPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-2 pb-10 text-gray-700">
      <h1 className="text-primary-500 mb-8 mt-10 text-center text-2xl font-bold sm:text-4xl">
        ⬥ Portal Visual Language
      </h1>

      <h2 className="text-primary-500 mx-2 mb-4 w-full text-left text-lg font-bold sm:text-xl">
        If statement
      </h2>

      <CodeSnippet
        code={`
    let count = 0
    if (count > 10) {
      count = 0
      count = 1 + 2 + 3
    }
  `}
      />

      <div className="pt-8">{/* spacer */}</div>

      <h2 className="text-primary-500 mx-2 mb-4 w-full text-left text-lg font-bold sm:text-xl">
        React component
      </h2>

      <CodeSnippet
        code={`
function App() {
  const [count, setCount] = React.useState(0)

  let x = "hey there"

  return (
    <div>
      <h1>Counter</h1>
      <button onClick={() => {setCount(c => {return c + 1})}}>+</button>
      <button onClick={() => {setCount(count - 1)}}>-</button>
      <div>Count: {count}</div>
    </div>
  )
  }`}
      />
    </div>
  )
}
