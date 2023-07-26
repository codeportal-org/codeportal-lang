import { create } from "zustand"

type CommandBarStore = {
  isOpen: boolean
  toggle: () => void
}

export const useCommandBarStore = create<CommandBarStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
