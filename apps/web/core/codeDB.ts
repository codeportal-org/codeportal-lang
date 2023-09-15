import { CodeNode, ProgramNode } from "./interpreter"

/**
 * CodeDB indexes the Code Tree and stores it in useful data structures to be used by the Editor.
 * It also provides a ways to query, and modify the Code Tree.
 */
export class CodeDB {
  /**
   * Maps a children to it's parent.
   */
  parentMap = new Map<CodeNode, CodeNode>()

  /**
   * Loads the code tree into the CodeDB.
   */
  load(code: ProgramNode) {
    this.parentMap.clear()
  }
}
