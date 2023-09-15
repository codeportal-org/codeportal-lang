import { createNanoEvents } from "nanoevents"

/**
 * Used for Editor's global events.
 */
class EditorEmitterSingleton {
  private events = createNanoEvents()

  onRefresh(callback: () => void) {
    return this.events.on("refresh", callback)
  }

  /**
   * Refreshes the editor on every development tab/instance.
   * Uses LiveBlocks real-time events.
   */
  refresh() {
    this.events.emit("refresh")
  }
}

export const editorEmitter = new EditorEmitterSingleton()
