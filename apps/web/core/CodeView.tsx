"use client"

import React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

import { CodeTreeView } from "./CodeTreeView"
import { ASTtoCTTransformer } from "./lang/astTransformer"
import { CodeDBProvider, useCodeDB } from "./lang/codeDBContext"
import { CodeProcessor } from "./lang/codeProcessor"
import { ProgramNode, UITextNode } from "./lang/codeTree"

const astTransformer = new ASTtoCTTransformer()
const codeProcessor = new CodeProcessor({ appId: "test" })

const testCode = `
function App() {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <button onClick={() => {setCount(count + 1)}}>+</button>
      <button onClick={() => {setCount(count - 1)}}>-</button>
      <div>Count: {count}</div>
    </div>
  )
}
`

codeProcessor.extend((ast) => astTransformer.transform(ast))
const testCodeTree = codeProcessor.process(testCode)

export const CodeView = React.forwardRef<
  HTMLDivElement,
  {
    appId: string
    code: string
    isFinished: boolean
    codeTree: ProgramNode | null
    isLoading: boolean
  }
>(({ appId, code, isFinished, codeTree, isLoading }, ref) => {
  return (
    <div className="h-full">
      <TooltipProvider>
        <CodeDBProvider>
          <CodeContainer
            ref={ref}
            code={code}
            isFinished={isFinished}
            codeTree={codeTree}
            isLoading={isLoading}
          />
        </CodeDBProvider>
      </TooltipProvider>
    </div>
  )
})

const CodeContainer = React.forwardRef<
  HTMLDivElement,
  { code: string; isFinished: boolean; codeTree: ProgramNode | null; isLoading: boolean }
>(({ code, isFinished, codeTree, isLoading }, ref) => {
  const codeDB = useCodeDB()

  // React.useEffect(() => {
  //   if (isFinished) {
  //     broadcast({ type: "refresh" })
  //   }
  // }, [code, isFinished])

  // React.useEffect(() => {
  //   if (!codeTree) {
  //     return
  //   }

  //   if (isLoading) {
  //     codeDB?.reset()
  //     codeDB?.partialLoad(codeTree)
  //   } else {
  //     console.log("-----  load")
  //     codeDB?.reset()
  //     codeDB?.load(codeTree)
  //     console.log("-----  loaded")
  //   }
  // }, [codeTree, isLoading])

  React.useEffect(() => {
    codeDB?.reset()
    codeDB?.load(testCodeTree)

    console.log("-----  loaded", codeDB?.codeTree)

    console.log(JSON.stringify(codeDB?.exportCodeTree()))

    codeDB?.onNodeChange(({ nodeId }) => {
      if (nodeId === "29") {
        const node: UITextNode = codeDB.getNodeByID("29")
        console.log("-----  node change!!!!!!!", node.text)
      }
    })
  }, [])

  if (testCodeTree) {
    return <CodeTreeView codeTree={testCodeTree} />
  }

  // at this point this is just for debugging purposes
  return (
    <div
      ref={ref}
      className="h-full w-full overflow-auto whitespace-pre-wrap rounded-xl border px-4 py-2"
    >
      {code}
    </div>
  )
})
