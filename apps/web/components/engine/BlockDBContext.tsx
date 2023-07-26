import { Provider } from "jotai"
import React from "react"

import { BlockDB, createBlockDB } from "./blockDB"

const BlockDBContext = React.createContext<BlockDB | null>(null)

export function BlockDBProvider({ children }: { children: React.ReactNode }) {
  const blockDB = React.useMemo(() => createBlockDB(), [])

  return (
    <BlockDBContext.Provider value={blockDB}>
      <Provider store={blockDB.atomStore}>{children}</Provider>
    </BlockDBContext.Provider>
  )
}

export function useBlockDB() {
  const context = React.useContext(BlockDBContext)
  if (context === undefined) {
    throw new Error("useBlockDB must be used within a BlockDBProvider")
  }

  return context
}
