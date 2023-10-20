"use client"

import Script from "next/script"
import React from "react"

import { CodeChangeMessage } from "@/core/CodeChangeMessage"
import { ASTtoCTTransformer } from "@/core/lang/astTransformer"
import { CodeDB } from "@/core/lang/codeDB"
import { CodeProcessor } from "@/core/lang/codeProcessor"
import { CodeNode, ComponentCallNode, UINode } from "@/core/lang/codeTree"
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

    // interpret the initial code
    interpreter.interpret(_codeDB.codeTree!)
    return _codeDB
  })

  React.useEffect(() => {
    // Main entry point for the dev sites, the Iframe
    const messageListener = (event: MessageEvent<CodeChangeMessage>) => {
      if (event.data.type === "codeChange") {
        codeChangesChannel.postMessage(event.data)
        handleCodeChange(event.data.nodeId, event.data.node)
      }
    }
    window.addEventListener("message", messageListener)

    const codeChangeListener = (event: MessageEvent<CodeChangeMessage>) => {
      if (event.data.type === "codeChange") {
        handleCodeChange(event.data.nodeId, event.data.node)
      }
    }
    codeChangesChannel.addEventListener("message", codeChangeListener)

    return () => {
      window.removeEventListener("message", messageListener)
      codeChangesChannel.removeEventListener("message", codeChangeListener)
    }
  }, [])

  const handleCodeChange = (nodeId: string, node: CodeNode | null) => {
    if (!isDevSite) {
      return
    }

    codeDB.updateNode(nodeId, node)
    ;(window as any).codeDB = codeDB

    forceUpdate()
  }

  const componentCallNode = {
    id: "test",
    type: "component call",
    comp: {
      id: "test-id",
      type: "ref",
      refId: "1",
    },
  } satisfies ComponentCallNode

  return (
    <>
      {interpreter.interpretComponentCall(componentCallNode)}
      <AugmentedEditorUI codeDB={codeDB} />
    </>
  )

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

function AugmentedEditorUI({ codeDB }: { codeDB: CodeDB }) {
  const [hoveredNode, setHoveredNode] = React.useState<UINode | null>(null)
  const [hoveredRect, setHoveredRect] = React.useState<{
    x: number
    y: Number
    width: number
    height: number
  } | null>(null)

  React.useEffect(() => {
    const unsubscribeNodeChangeHandler = codeDB.onNodeChange(({ nodeId }) => {
      if (codeDB.hoveredNodeId) {
        const element = document.querySelector(
          `[data-codeportal-node-id="${codeDB.hoveredNodeId}"]`,
        )
        if (element) {
          setHoveredNode(codeDB.getNodeByID<UINode>(codeDB.hoveredNodeId))
          setHoveredRect({
            x: element.getBoundingClientRect().x,
            y: element.getBoundingClientRect().y,
            width: element.getBoundingClientRect().width,
            height: element.getBoundingClientRect().height,
          })
        } else {
          setHoveredNode(null)
          setHoveredRect(null)
        }
      } else {
        setHoveredNode(null)
        setHoveredRect(null)
      }
    })

    return () => {
      unsubscribeNodeChangeHandler()
    }
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        display: "none",
        left: 0,
        top: 0,
        zIndex: 9999,
        pointerEvents: "none",
        border: "2px dashed rgb(60, 135, 256)",
        backgroundColor: "rgb(90, 160, 240, 0.4)",
        borderRadius: 6,
        ...(hoveredRect
          ? {
              display: "block",
              transform: `translate(${hoveredRect.x}px, ${hoveredRect.y}px)`,
              width: hoveredRect.width,
              height: hoveredRect.height,
            }
          : {}),
      }}
    >
      {hoveredNode?.type === "ui element" && (
        <div
          style={{
            position: "absolute",
            top: -20,
            left: 6,
            height: 20,
            backgroundColor: "rgb(60, 135, 256)",
            color: "white",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
          }}
        >
          {hoveredNode.name}
        </div>
      )}
    </div>
  )
}
