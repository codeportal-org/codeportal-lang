import { createNanoEvents } from "nanoevents"

import { CodeTreeWalk } from "./codeTreeWalk"
import { CodeNode, FunctionNode, ProgramNode, StatementNode, statementTypes } from "./interpreter"

/**
 * CodeDB indexes the Code Tree and stores it in useful data structures to be used by the Editor.
 * It also provides a ways to query, and modify the Code Tree.
 */
export class CodeDB {
  codeTree: ProgramNode | undefined = undefined

  isCodeLoaded = false

  idCounter = 0

  codeTreeWalker = new CodeTreeWalk()

  nodeMap = new Map<string, CodeNode>()

  private events = createNanoEvents()

  reset() {
    this.codeTree = undefined
    this.nodeMap.clear()
    this.events = createNanoEvents()
    this.isCodeLoaded = false
    this.codeTreeWalker.reset()
  }

  /**
   * Loads the code tree into the CodeDB.
   */
  load(programNode: ProgramNode) {
    this.codeTreeWalker.full(programNode, (node, parent) => {
      if (!node.meta) {
        node.meta = {}
      }

      // attach parent to all nodes
      node.meta.parent = parent

      // add an id to all nodes
      if (!node.id) {
        node.id = this.idCounter.toString()
        this.idCounter++
      }

      // add nodes to map
      this.nodeMap.set(node.id, node)
    })

    this.codeTree = programNode
    this.codeTree.idCounter = this.idCounter

    this.isCodeLoaded = true

    this.notifyCodeLoaded()
  }

  notifyCodeLoaded() {
    console.log("--- notifyCodeLoaded")
    this.events.emit("code-loaded")
  }

  onCodeLoaded(callback: () => void) {
    console.log("--- onCodeLoaded")
    return this.events.on("code-loaded", callback)
  }

  notifyNodeChange(nodeId: string) {
    this.events.emit("node-change", { nodeId })
  }

  onNodeChange(callback: (data: { nodeId: string }) => void) {
    return this.events.on("node-change", callback)
  }

  partialLoad(node: ProgramNode) {
    this.codeTree = node
  }

  getCodeTree() {
    return this.codeTree
  }

  getNodeByID(id: string) {
    return this.nodeMap.get(id)
  }

  isDescendantOf(node: CodeNode, target: CodeNode): boolean {
    if (node === target) {
      return true
    }

    if (!node.meta?.parent) {
      return false
    }

    return this.isDescendantOf(node.meta.parent, target)
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

      // notify changes
      this.notifyNodeChange(node.id)
      this.notifyNodeChange(target.id)
      this.notifyNodeChange(nodeParent.id)
      this.notifyNodeChange(targetParent.id)
    }
  }
}
