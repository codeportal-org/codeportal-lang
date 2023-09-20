import React from "react"

import { CodeDB } from "./codeDB"
import { CodeNode } from "./interpreter"

const CodeDBContext = React.createContext<CodeDB | null>(null)

export function CodeDBProvider({ children }: { children: React.ReactNode }) {
  const [codeDB] = React.useState(() => new CodeDB())

  return <CodeDBContext.Provider value={codeDB}>{children}</CodeDBContext.Provider>
}

export function useCodeDB() {
  const context = React.useContext(CodeDBContext)
  if (context === undefined) {
    throw new Error("useCodeDB must be used within a CodeDBProvider")
  }

  return context
}

export function useNode<NodeType extends CodeNode>(id: string) {
  const codeDB = useCodeDB()
  const [node, setNode] = React.useState(() => codeDB?.getNodeByID(id))

  React.useEffect(() => {
    setNode(codeDB?.getNodeByID(id))

    return codeDB?.onNodeChange(({ nodeId }) => {
      if (nodeId === id) {
        setNode(codeDB?.getNodeByID(id))
      }
    })
  }, [codeDB, id])

  return node as NodeType
}
