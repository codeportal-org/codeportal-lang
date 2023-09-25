import { createNanoEvents } from "nanoevents"

import {
  CodeNode,
  FunctionNode,
  ProgramNode,
  StatementNode,
  UIElementNode,
  UINode,
  statementTypes,
  uiNodeTypes,
} from "./codeTree"
import { CodeTreeWalk } from "./codeTreeWalk"

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
        node.meta = {
          ui: {
            isHovered: false,
            isSelected: false,
          },
        }
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

  getNodeByID<NodeType extends CodeNode>(id: string) {
    return this.nodeMap.get(id) as NodeType
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

  /**
   * Moves a statement node before a target statement node in the code tree.
   * @param node Node to be moved.
   * @param target Node to be moved to, the node will be moved before this node.
   */
  moveStatementNode(node: StatementNode, target: StatementNode) {
    if (
      !statementTypes.includes(node.type as any) ||
      !statementTypes.includes(target.type as any)
    ) {
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

    const nodeIndex = nodeParent.body.indexOf(node)
    const targetIndex = targetParent.body.indexOf(target)

    if (nodeIndex === -1 || targetIndex === -1) {
      throw new Error("Node and target must be in their parents")
    }

    // remove node from parent
    nodeParent.body.splice(nodeIndex, 1)

    // add node to parent at target index
    targetParent.body.splice(targetIndex, 0, node)

    // update parent
    node.meta!.parent = targetParent

    // notify changes
    this.notifyNodeChange(nodeParent.id)
    this.notifyNodeChange(targetParent.id)
    this.notifyNodeChange(node.id)
  }

  /**
   * Moves a UI node before a target statement node in the code tree.
   * @param node Node to be moved.
   * @param target Node to be moved to, the node will be moved before this node.
   */
  moveUINode(node: UINode, target: UINode) {
    if (!node.meta?.parent || !target.meta?.parent) {
      throw new Error("Node and target must have parents")
    }

    const nodeParent = node.meta?.parent as UIElementNode
    const targetParent = target.meta?.parent as UIElementNode

    if (!nodeParent || !targetParent) {
      throw new Error("Node and target must have parents")
    }

    if (!nodeParent.children || !targetParent.children) {
      throw new Error("Node and target must have children")
    }

    const nodeIndex = nodeParent.children.indexOf(node)
    const targetIndex = targetParent.children.indexOf(target)

    if (nodeIndex === -1 || targetIndex === -1) {
      throw new Error("Node and target must be in their parents")
    }

    // remove node from parent
    nodeParent.children.splice(nodeIndex, 1)

    // add node to parent at target index
    targetParent.children.splice(targetIndex, 0, node)

    // update parent
    node.meta!.parent = targetParent

    // notify changes
    this.notifyNodeChange(nodeParent.id)
    this.notifyNodeChange(targetParent.id)
    this.notifyNodeChange(node.id)
  }

  hoverNode(nodeId: string) {
    const node = this.getNodeByID(nodeId)
    if (!node || !node.meta?.ui) {
      return
    }

    node.meta.ui.isHovered = true
    this.notifyNodeChange(nodeId)
  }

  hoverNodeOff(nodeId: string) {
    const node = this.getNodeByID(nodeId)
    if (!node || !node.meta?.ui) {
      return
    }

    node.meta.ui.isHovered = false
    this.notifyNodeChange(nodeId)
  }

  updateUIText(nodeId: string, text: string) {
    const node = this.getNodeByID(nodeId)
    if (!node || node.type !== "ui text") {
      return
    }

    node.text = text
    this.notifyNodeChange(nodeId)
  }

  //   /**
  //  * Moves an expression node to a target expression node in the code tree.
  //  * If the target node is not empty, the nodes will be swapped.
  //  * @param node Node to be moved.
  //  * @param target Node to be moved to, the node will be moved before this node.
  //  */
  //   moveExpressionNode(node: StatementNode, target: StatementNode) {
  //     console.log("--- moveStatementNode")
  //     if (
  //       !statementTypes.includes(node.type as any) ||
  //       !statementTypes.includes(target.type as any)
  //     ) {
  //       throw new Error("This method can only move statement nodes")
  //     }

  //     console.log("--- moveStatementNode 2")

  //     if (!target.meta?.parent) {
  //       throw new Error("Target node must have a parent")
  //     }

  //     const nodeParent = node.meta?.parent as FunctionNode
  //     const targetParent = target.meta?.parent as FunctionNode

  //     console.log("--- moveStatementNode 3")

  //     if (!nodeParent || !targetParent) {
  //       throw new Error("Node and target must have parents")
  //     }

  //     console.log("--- moveStatementNode 4")

  //     if (nodeParent === targetParent) {
  //       const nodeIndex = nodeParent.body.indexOf(node)
  //       const targetIndex = nodeParent.body.indexOf(target)

  //       if (nodeIndex === -1 || targetIndex === -1) {
  //         throw new Error("Node and target must be in the same parent")
  //       }

  //       // swap the nodes
  //       nodeParent.body[nodeIndex] = target
  //       nodeParent.body[targetIndex] = node

  //       // update parents
  //       node.meta!.parent = targetParent
  //       target.meta.parent = nodeParent

  //       console.log("movement DONE!!")

  //       // notify changes
  //       this.notifyNodeChange(node.id)
  //       this.notifyNodeChange(target.id)
  //       this.notifyNodeChange(nodeParent.id)
  //       this.notifyNodeChange(targetParent.id)
  //     }
  //   }
}
