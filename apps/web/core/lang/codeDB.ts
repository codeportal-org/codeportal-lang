import { createNanoEvents } from "nanoevents"

import {
  CodeNode,
  EmptyNode,
  FunctionNode,
  NormalizedNode,
  ProgramNode,
  StatementNode,
  UIElementNode,
  UINode,
  VarStatement,
  nodeTypeMeta,
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

  selectedNodeIds: string[] = []
  hoveredNodeId: string | undefined = undefined

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
    this.codeTreeWalker.full(programNode, (node, parentMeta) => {
      if (!node.meta) {
        node.meta = {
          ui: {
            isHovered: false,
            isSelected: false,
          },
        }
      }

      // attach the parent id to all nodes
      node.meta.parentId = parentMeta?.parent.id
      node.meta.parentProperty = parentMeta?.property

      // add an id to all nodes
      if (!node.id) {
        node.id = this.idCounter.toString()
        this.idCounter++
      } else {
        this.idCounter = Math.max(this.idCounter, parseInt(node.id) + 1)
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

    if (!node.meta?.parentId) {
      return false
    }

    const parent = this.getNodeByID(node.meta.parentId)

    return this.isDescendantOf(parent, target)
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
      throw new Error(
        `This method can only move statement nodes, attempted to move ${node.type} to ${target.type}`,
      )
    }

    if (!target.meta?.parentId) {
      throw new Error("Target node must have a parent")
    }

    const nodeParent = this.getNodeByID(node.meta?.parentId!) as FunctionNode
    const targetParent = this.getNodeByID(target.meta?.parentId!) as FunctionNode

    if (!nodeParent || !targetParent) {
      throw new Error("Node and target must have parents")
    }

    const nodeParentProperty = node.meta?.parentProperty!
    const targetParentProperty = target.meta?.parentProperty!

    const nodeIndex = (nodeParent as any)[nodeParentProperty].indexOf(node)
    const targetIndex = (targetParent as any)[targetParentProperty].indexOf(target)

    if (nodeIndex === -1 || targetIndex === -1) {
      throw new Error("Node and target must be in their parents")
    }

    // remove node from parent
    const nodeParentList = (nodeParent as any)[nodeParentProperty] as any[]
    nodeParentList.splice(nodeIndex, 1)

    // add node to parent at target index
    ;(targetParent as any)[targetParentProperty].splice(targetIndex, 0, node)

    // Always leave an empty statement for UX reasons
    if (nodeParentList.length === 0) {
      const emptyStatement = this.newEmptyNode("statement")
      nodeParentList.push(emptyStatement)
      emptyStatement.meta!.parentId = nodeParent.id
      emptyStatement.meta!.parentProperty = nodeParentProperty
    }

    // update parent
    node.meta!.parentId = targetParent.id
    node.meta!.parentProperty = targetParentProperty

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
    if (!node.meta?.parentId || !target.meta?.parentId) {
      throw new Error("Node and target must have parents")
    }

    const nodeParent = this.getNodeByID(node.meta?.parentId!) as UIElementNode
    const targetParent = this.getNodeByID(target.meta?.parentId!) as UIElementNode

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
    node.meta!.parentId = targetParent.id

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

    if (this.hoveredNodeId !== undefined) {
      const prevHoveredNode = this.getNodeByID(this.hoveredNodeId)
      if (!prevHoveredNode) {
        throw new Error("Previous hovered node not found")
      }

      prevHoveredNode.meta!.ui!.isHovered = false
      this.notifyNodeChange(prevHoveredNode.id)
    }

    node.meta.ui.isHovered = true
    this.hoveredNodeId = nodeId
    this.notifyNodeChange(nodeId)
  }

  hoverNodeOff(nodeId: string) {
    const node = this.getNodeByID(nodeId)
    if (!node || !node.meta?.ui) {
      return
    }

    node.meta.ui.isHovered = false
    if (this.hoveredNodeId === nodeId) {
      this.hoveredNodeId = undefined
    }
    this.notifyNodeChange(nodeId)
  }

  removeHover() {
    if (this.hoveredNodeId === undefined) {
      return
    }

    const nodeId = this.hoveredNodeId

    const node = this.getNodeByID(nodeId)
    if (!node || !node.meta?.ui) {
      throw new Error("Node not found")
    }

    node.meta.ui.isHovered = false
    this.hoveredNodeId = undefined
    this.notifyNodeChange(nodeId)
  }

  selectNode(nodeId: string) {
    const node = this.getNodeByID(nodeId)
    if (!node || !node.meta?.ui) {
      return
    }

    if (this.selectedNodeIds.length > 0) {
      const prevSelectedNode = this.getNodeByID(this.selectedNodeIds[0]!)
      if (!prevSelectedNode) {
        throw new Error("Previous selected node not found")
      }

      prevSelectedNode.meta!.ui!.isSelected = false
      this.selectedNodeIds.pop()
      this.notifyNodeChange(prevSelectedNode.id)
    }

    node.meta.ui.isSelected = true
    this.selectedNodeIds.push(nodeId)
    this.notifyNodeChange(nodeId)
  }

  selectNodeOff(nodeId: string) {
    const node = this.getNodeByID(nodeId)
    if (!node || !node.meta?.ui) {
      throw new Error("Node not found")
    }

    node.meta.ui.isSelected = false
    this.selectedNodeIds = this.selectedNodeIds.filter((id) => id !== nodeId)
    this.notifyNodeChange(nodeId)
  }

  /**
   * Syncs the node state and CodeDB's state.
   */
  updateNode(nodeId: string, newNode: NormalizedNode) {
    const node = this.getNodeByID(nodeId)
    if (!node) {
      return
    }

    const properties = Object.keys(newNode)

    // This is necessary because CodeDB instances rely on object references
    for (const property of properties) {
      if (nodeTypeMeta[node.type].childLists.includes(property)) {
        // get current CodeDB node's children, in case the node was serialized like in the dev sites case
        ;((node as any)[property] as CodeNode[]) = (newNode[property] as CodeNode[]).map((child) =>
          this.getNodeByID(child.id),
        )
      } else if (nodeTypeMeta[node.type].expressions.includes(property)) {
        // get current CodeDB node's children, in case the node was serialized like in the dev sites case
        ;(node as any)[property] = this.getNodeByID(newNode[property].id)
      } else {
        ;(node as any)[property] = newNode[property]
      }
    }

    this.notifyNodeChange(nodeId)

    // sync CodeDB's state
    if (node.meta?.ui?.isSelected) {
      this.selectNode(nodeId)
    } else if (this.selectedNodeIds.includes(nodeId)) {
      this.selectNodeOff(nodeId)
    }
    if (node.meta?.ui?.isHovered) {
      this.hoverNode(nodeId)
    } else if (this.hoveredNodeId === nodeId) {
      this.hoverNodeOff(nodeId)
    }
  }

  updateNodeName(nodeId: string, name: string) {
    const node = this.getNodeByID<VarStatement>(nodeId)
    if (!node) {
      return
    }

    node.name = name

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

  exportCodeTree() {
    if (!this.codeTree) {
      throw new Error("Code tree is not loaded")
    }

    const newCodeTree: ProgramNode = JSON.parse(JSON.stringify(this.codeTree)) as any

    const walker = new CodeTreeWalk()

    walker.full(newCodeTree, (node) => {
      delete node.meta
    })

    return newCodeTree
  }

  newEmptyNode(kind: EmptyNode["kind"]) {
    const id = this.idCounter.toString()
    this.idCounter++
    const newNode = {
      id,
      type: "empty",
      kind,
      meta: {
        ui: {
          isHovered: false,
          isSelected: false,
        },
      },
    } as EmptyNode

    this.nodeMap.set(newNode.id, newNode)

    return newNode
  }

  insertNodeBefore(nodeId: string, newNode: CodeNode) {
    const node = this.getNodeByID(nodeId)
    if (!node) {
      return
    }

    if (!node.meta?.parentId) {
      throw new Error("Node must have a parent")
    }

    const parent = this.getNodeByID(node.meta.parentId)

    if (!parent) {
      throw new Error("Node must have a parent")
    }

    const parentProperty = node.meta.parentProperty

    if (!parentProperty) {
      throw new Error("Node must have a parent property")
    }

    const nodeList = (parent as any)[parentProperty] as any[]

    const index = nodeList.indexOf(node)

    if (index === -1) {
      throw new Error("Node must be in its parent")
    }

    ;(parent as any)[parentProperty].splice(index, 0, newNode)

    if (newNode.meta) {
      newNode.meta.parentId = parent.id
      newNode.meta.parentProperty = parentProperty
    } else {
      throw new Error("New node must have meta")
    }

    this.notifyNodeChange(newNode.id)
    this.notifyNodeChange(parent.id)
  }

  insertNodeAfter(nodeId: string, newNode: CodeNode) {
    const node = this.getNodeByID(nodeId)
    if (!node) {
      return
    }

    if (!node.meta?.parentId) {
      throw new Error("Node must have a parent")
    }

    const parent = this.getNodeByID(node.meta.parentId)

    if (!parent) {
      throw new Error("Node must have a parent")
    }

    const parentProperty = node.meta.parentProperty

    if (!parentProperty) {
      throw new Error("Node must have a parent property")
    }

    const nodeList = (parent as any)[parentProperty] as any[]

    const index = nodeList.indexOf(node)

    if (index === -1) {
      throw new Error("Node must be in its parent")
    }

    ;(parent as any)[parentProperty].splice(index + 1, 0, newNode)

    this.notifyNodeChange(parent.id)
  }
}
