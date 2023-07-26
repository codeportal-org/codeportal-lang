import * as React from "react"

export type DropIndicatorPosition = "before" | "middle" | "after" | null

export type ProgramUIState = {
  availableWidth: number
  activeBlockID: string | null
  dropBlockID: string | null
  dropIndicatorPosition: DropIndicatorPosition
}

const ProgramUIStateContext = React.createContext<
  [ProgramUIState, React.Dispatch<ProgramUIState>] | null
>(null)

export function ProgramUIStateProvider({ children }: { children: React.ReactNode }) {
  const programUIState = React.useState<ProgramUIState>({
    availableWidth: 400,
    activeBlockID: null,
    dropBlockID: null,
    dropIndicatorPosition: null,
  })

  return (
    <ProgramUIStateContext.Provider value={programUIState}>
      {children}
    </ProgramUIStateContext.Provider>
  )
}

export function useProgramUIState() {
  const context = React.useContext(ProgramUIStateContext)
  if (context === null) {
    throw new Error("useBlockDB must be used within a ProgramUIProvider")
  }

  return context
}
