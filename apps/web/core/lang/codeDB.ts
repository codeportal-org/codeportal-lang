import { PrimitiveAtom, atom, createStore } from "jotai"

import { nanoid } from "@/lib/nanoid"

import { CodeTreeWalk } from "./codeTreeWalk"
import { CodeNode, FunctionNode, ProgramNode, StatementNode, statementTypes } from "./interpreter"

export type CodeNodeAtom = PrimitiveAtom<CodeNode>

/**
 * CodeDB indexes the Code Tree and stores it in useful data structures to be used by the Editor.
 * It also provides a ways to query, and modify the Code Tree.
 */
export class CodeDB {
  codeTree: ProgramNode | undefined = undefined

  codeTreeWalker = new CodeTreeWalk()

  /**
   * Jotai atoms for each node in the Code Tree. Used for Editor's reactivity.
   */
  nodeAtomMap = new Map<string, CodeNodeAtom>()

  atomStore = createStore()

  /**
   * Loads the code tree into the CodeDB.
   */
  load(code: ProgramNode) {
    // attach parent to all nodes
    this.codeTreeWalker.full(code, (node, parent) => {
      if (!node.meta) {
        node.meta = {}
      }

      node.meta.parent = parent
      const nodeId = nanoid()
      node.meta.id = nodeId

      const nodeAtom = atom(node)
      this.nodeAtomMap.set(nodeId, { ...nodeAtom })
    })

    this.codeTree = code
  }

  moveStatementNode(node: StatementNode, target: StatementNode) {
    if (!statementTypes.includes(node.type) || !statementTypes.includes(target.type)) {
      throw new Error("This method can only move statement nodes")
    }

    if (!target.meta?.parent) {
      throw new Error("Target node must have a parent")
    }

    const nodeParent = node.meta?.parent as FunctionNode
    const targetParent = target.meta?.parent as FunctionNode

    if (!nodeParent || !targetParent) {
      throw new Error("Node and target must have parents")
    }

    if (nodeParent === targetParent) {
      const nodeIndex = nodeParent.body.indexOf(node)
      const targetIndex = nodeParent.body.indexOf(target)

      if (nodeIndex === -1 || targetIndex === -1) {
        throw new Error("Node and target must be in the same parent")
      }

      // swap the nodes
      nodeParent.body[nodeIndex] = target
      nodeParent.body[targetIndex] = node

      // update parents
      node.meta!.parent = targetParent
      target.meta.parent = nodeParent

      // update atoms for reactivity in the editor
      const nodeAtom = this.nodeAtomMap.get(node.meta?.id!)!
      const targetAtom = this.nodeAtomMap.get(target.meta?.id!)!
      const parentAtom = this.nodeAtomMap.get(nodeParent.meta?.id!)!
      const targetParentAtom = this.nodeAtomMap.get(targetParent.meta?.id!)!

      this.atomStore.set(nodeAtom, { ...node })
      this.atomStore.set(targetAtom, { ...target })
      this.atomStore.set(parentAtom, { ...nodeParent })
      this.atomStore.set(targetParentAtom, { ...targetParent })
    }
  }
}
