import React from "react"

import { CodeDB } from "./codeDB"

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
