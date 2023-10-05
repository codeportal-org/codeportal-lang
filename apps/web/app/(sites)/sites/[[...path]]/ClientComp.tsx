"use client"

import Script from "next/script"
import React from "react"

import { ASTtoCTTransformer } from "@/core/lang/astTransformer"
import { CodeDB } from "@/core/lang/codeDB"
import { CodeProcessor } from "@/core/lang/codeProcessor"
import { CodeNode, ComponentCallNode } from "@/core/lang/codeTree"
import { Interpreter } from "@/core/lang/interpreter"
import { MainModule, ThemeConfig } from "@/db/schema"

const astTransformer = new ASTtoCTTransformer()
const codeProcessor = new CodeProcessor({ appId: "test" })

const testCode = `
function App() {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <h1>Counter</h1>
      <button onClick={() => {setCount(c => {return c + 1})}}>+</button>
      <button onClick={() => {setCount(count - 1)}}>-</button>
      <div>Count: {count}</div>
    </div>
  )
}
`

codeProcessor.extend((ast) => astTransformer.transform(ast))
const testCodeTree = codeProcessor.process(testCode)

const codeChangesChannel = new BroadcastChannel("code-changes")

export function ClientComp({
  mainModule,
  theme,
  isDevSite,
}: {
  mainModule: MainModule | null
  theme: ThemeConfig | null
  isDevSite: boolean
}) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
  const [interpreter] = React.useState(() => new Interpreter(isDevSite))

  const [codeDB] = React.useState<CodeDB>(() => {
    const _codeDB = new CodeDB()
    if (isDevSite) {
      _codeDB.load(testCodeTree)
    } else {
      // set it directly to avoid loading
      _codeDB.codeTree = testCodeTree
    }

    return _codeDB
  })

  React.useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      if (event.data.type === "codeChange") {
        codeChangesChannel.postMessage(event.data)
        handleCodeChange(event.data.node)
      }
    }
    window.addEventListener("message", messageListener)
    const codeChangeListener = (event: MessageEvent) => {
      if (event.data.type === "codeChange") {
        handleCodeChange(event.data.node)
      }
    }
    codeChangesChannel.addEventListener("message", codeChangeListener)
    return () => {
      window.removeEventListener("message", messageListener)
      codeChangesChannel.removeEventListener("message", codeChangeListener)
    }
  }, [])

  const handleCodeChange = (node: CodeNode) => {
    if (!isDevSite) {
      return
    }

    console.log("--- handleCodeChange", node)
    codeDB.updateNode(node.id, node)
    forceUpdate()
  }

  interpreter.interpret(codeDB?.codeTree!)

  const componentCallNode = {
    id: "test",
    type: "component call",
    comp: {
      id: "test-id",
      type: "ref",
      refId: "1",
    },
  } satisfies ComponentCallNode

  return <>{interpreter.interpretComponentCall(componentCallNode)}</>

  // return (
  //   <>
  //     {interpreter.interpretComponent(testCodeTree)}
  //     <style global jsx>{`
  //       .p-2 {
  //         padding: 0.5rem;
  //       }
  //     `}</style>
  //   </>
  // )
}
