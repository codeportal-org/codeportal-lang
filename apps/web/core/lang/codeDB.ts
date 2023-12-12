import { createNanoEvents } from "nanoevents"

import {
  CodeNode,
  EmptyNode,
  FunctionNode,
  ProgramNode,
  StatementNode,
  UIElementNode,
  UIStyleNode,
  VarStatement,
  statementTypes,
} from "./codeTree"
import { nodeTypeMeta, referenceableNodeTypes, uiNodeTypes } from "./codeTreeMeta"
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

  notifyNodeChange(nodeId: string, source: "sync" | "editor" = "editor") {
    console.log("--- notifyNodeChange", nodeId)

    this.events.emit("node-change", { nodeId, source })
  }

  onNodeChange(callback: (data: { nodeId: string; source: "sync" | "editor" }) => void) {
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
  moveNodeFromListToList(
    node: StatementNode,
    targetParent: StatementNode,
    parentProperty: string,
    index: number,
  ) {
    const nodeParent = this.getNodeByID(node.meta?.parentId!) as FunctionNode

    if (!(statementTypes.includes(node.type as any) || uiNodeTypes.includes(node.type as any))) {
      throw new Error(
        `This method can only move statement or UI nodes, attempted to move ${node.type}`,
      )
    }

    if (!nodeParent || !targetParent) {
      throw new Error("Node and target must have parents")
    }

    const nodeParentProperty = node.meta?.parentProperty!

    const nodeIndex = (nodeParent as any)[nodeParentProperty].indexOf(node)

    if (nodeIndex === -1) {
      throw new Error("Node must be in its parent")
    }

    // remove node from parent
    const nodeParentList = (nodeParent as any)[nodeParentProperty] as any[]
    nodeParentList.splice(nodeIndex, 1)

    const insertionIndex =
      nodeParent.id === targetParent.id && index > nodeIndex ? index - 1 : index

    // add node to parent at target index
    ;(targetParent as any)[parentProperty].splice(insertionIndex, 0, node)

    // Always leave an empty statement for UX reasons
    if (nodeParentList.length === 0) {
      const emptyStatement = this.newEmptyNode(
        nodeTypeMeta[node.type].kinds.includes("statement") ? "statement" : "ui",
      )
      nodeParentList.push(emptyStatement)
      emptyStatement.meta!.parentId = nodeParent.id
      emptyStatement.meta!.parentProperty = nodeParentProperty
    }

    // update parent
    node.meta!.parentId = targetParent.id
    node.meta!.parentProperty = parentProperty

    // notify changes
    this.notifyNodeChange(node.id)
    this.notifyNodeChange(nodeParent.id)
    this.notifyNodeChange(targetParent.id)
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

  updateNode<T>(nodeId: string, data: Partial<T>) {
    const node = this.getNodeByID(nodeId)
    if (!node) {
      return
    }

    const properties = Object.keys(data)

    // This is necessary because CodeDB instances rely on object references
    for (const property of properties) {
      ;(node as any)[property] = (data as any)[property]
    }

    this.notifyNodeChange(nodeId)
  }

  /**
   * Syncs the node state and CodeDB's state.
   */
  syncNode(nodeId: string, newNode: CodeNode | null) {
    const node = this.getNodeByID(nodeId)

    if (!newNode) {
      this.deleteNode(nodeId)
      return
    }

    if (!node) {
      this.nodeMap.set(nodeId, newNode)
      return
    }

    const properties = Object.keys(newNode)

    // This is necessary because CodeDB instances rely on object references
    for (const property of properties) {
      if (nodeTypeMeta[node.type]?.childLists?.find((childList) => childList.name === property)) {
        if ((newNode as any)[property]) {
          // get current CodeDB node's children, in case the node was serialized like in the dev sites case
          ;((node as any)[property] as CodeNode[]) = ((newNode as any)[property] as CodeNode[]).map(
            (child) => this.getNodeByID(child.id),
          )
        }
      } else if (nodeTypeMeta[node.type]?.expressions?.includes(property)) {
        // get current CodeDB node's children, in case the node was serialized like in the dev sites case
        ;(node as any)[property] = this.getNodeByID((newNode as any)[property].id)
      } else {
        ;(node as any)[property] = (newNode as any)[property]
      }
    }

    this.notifyNodeChange(nodeId, "sync")

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

  deleteNode(nodeId: string, refillAndClean = true) {
    // temporal limit
    if (nodeId === "0" || nodeId === "1") {
      return
    }

    const node = this.getNodeByID(nodeId)
    if (!node) {
      return
    }

    if (node.meta?.parentId) {
      const parent = this.getNodeByID(node.meta.parentId)
      const parentProperty = node.meta.parentProperty
      const childList = nodeTypeMeta[parent.type]?.childLists?.find(
        (childList) => childList.name === parentProperty,
      )

      if (parent && parentProperty) {
        if (childList) {
          const nodeList = (parent as any)[parentProperty] as any[]

          const index = nodeList.indexOf(node)

          if (index !== -1) {
            nodeList.splice(index, 1)

            if (refillAndClean && nodeList.length === 0) {
              if (childList.kind === "statement" || childList.kind === "ui") {
                // Always leave an empty statement for UX reasons
                const emptyStatement = this.newEmptyNode(childList.kind)
                nodeList.push(emptyStatement)
                emptyStatement.meta!.parentId = parent.id
                emptyStatement.meta!.parentProperty = parentProperty
              } else if (childList.kind === "style") {
                delete (parent as any)[parentProperty]
              }
            }
          }
        } else if (nodeTypeMeta[parent.type]?.expressions?.includes(parentProperty)) {
          if (refillAndClean) {
            ;(parent as any)[parentProperty] = this.newEmptyNode("expression")
            ;(parent as any)[parentProperty].meta!.parentId = parent.id
            ;(parent as any)[parentProperty].meta!.parentProperty = parentProperty
          }
        }

        this.notifyNodeChange(parent.id)
      }
    }

    this.nodeMap.delete(nodeId)
    if (this.selectedNodeIds.includes(nodeId)) {
      this.selectedNodeIds = this.selectedNodeIds.filter((id) => id !== nodeId)
    }
    if (this.hoveredNodeId === nodeId) {
      this.hoveredNodeId = undefined
    }

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

  newEmptyNode(kind: EmptyNode["kind"], meta?: Partial<EmptyNode["meta"]>) {
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
        ...meta,
      },
    } as EmptyNode

    this.nodeMap.set(newNode.id, newNode)

    this.notifyNodeChange(newNode.id)

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

    if (newNode.meta) {
      newNode.meta.parentId = parent.id
      newNode.meta.parentProperty = parentProperty
    } else {
      throw new Error("New node must have meta")
    }

    this.notifyNodeChange(newNode.id)
    this.notifyNodeChange(parent.id)
  }

  /**
   * Replaces a node in a property of it's parent node.
   */
  replaceNode(nodeId: string, newNode: CodeNode) {
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

    const parentValue = (parent as any)[parentProperty] as any[]

    if (Array.isArray(parentValue)) {
      // it is a list
      const nodeList = parentValue

      const index = nodeList.indexOf(node)

      if (index === -1) {
        throw new Error("Node must be in its parent")
      }

      ;(parent as any)[parentProperty].splice(index, 1, newNode)
    } else {
      // it is a single value
      ;(parent as any)[parentProperty] = newNode
    }

    this.nodeMap.delete(nodeId)

    if (this.selectedNodeIds.includes(nodeId)) {
      this.selectedNodeIds = this.selectedNodeIds.filter((id) => id !== nodeId)
    }
    if (this.hoveredNodeId === nodeId) {
      this.hoveredNodeId = undefined
    }

    if (newNode.meta) {
      newNode.meta.parentId = parent.id
      newNode.meta.parentProperty = parentProperty
    } else {
      throw new Error("New node must have meta")
    }

    this.notifyNodeChange(newNode.id)
    this.notifyNodeChange(parent.id)
  }

  insertNodeInList(parentNodeId: string, parentProperty: string, index: number, newNode: CodeNode) {
    const parent = this.getNodeByID(parentNodeId)

    if (!parent) {
      throw new Error("Node must have a parent")
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

  addStyleToList(parentNodeId: string, parentProperty: string, newNode: UIStyleNode) {
    const parent = this.getNodeByID(parentNodeId)

    if (!parent) {
      throw new Error("Node must have a parent")
    }

    const styleList = (parent as any)[parentProperty] as UIStyleNode[]

    const existingNode = styleList.find((style) => style.name === newNode.name)

    if (existingNode) {
      this.deleteNode(existingNode.id, false)
    }

    styleList.push(newNode)

    // Sort styles by name
    styleList.sort((a: UIStyleNode, b: UIStyleNode) => a.name.localeCompare(b.name))

    if (newNode.meta) {
      newNode.meta.parentId = parent.id
      newNode.meta.parentProperty = parentProperty
    } else {
      throw new Error("New node must have meta")
    }

    this.notifyNodeChange(newNode.id)
    this.notifyNodeChange(parent.id)
  }

  newNodeFromType<T>(type: CodeNode["type"], extras?: Partial<CodeNode>): T {
    const id = this.idCounter.toString()
    this.idCounter++
    const newNode = {
      id,
      type,
      meta: {
        ui: {
          isHovered: false,
          isSelected: false,
        },
      },
      ...(extras || {}),
    } as CodeNode

    const typeMeta = nodeTypeMeta[type]

    if (typeMeta.hasName) {
      ;(newNode as any).name = ""
    }

    if (typeMeta.childLists && typeMeta.childLists.length > 0) {
      for (const childList of typeMeta.childLists) {
        if (childList.alwaysPresent) {
          const emptyNode = this.newEmptyNode(childList.kind)
          ;(newNode as any)[childList.name] = [emptyNode]
          emptyNode.meta!.parentId = newNode.id
          emptyNode.meta!.parentProperty = childList.name
        }
      }
    }

    if (typeMeta.expressions && typeMeta.expressions.length > 0) {
      for (const expressionName of typeMeta.expressions) {
        if ((newNode as any)[expressionName]) {
          ;(newNode as any)[expressionName].meta!.parentId = newNode.id
          ;(newNode as any)[expressionName].meta!.parentProperty = expressionName
        } else {
          const emptyNode = this.newEmptyNode("expression")
          ;(newNode as any)[expressionName] = emptyNode
          emptyNode.meta!.parentId = newNode.id
          emptyNode.meta!.parentProperty = expressionName
        }
      }
    }

    this.nodeMap.set(newNode.id, newNode)

    this.notifyNodeChange(newNode.id)

    return newNode as T
  }

  availableNodeRefs(nodeId: string): CodeNode[] {
    const node = this.getNodeByID(nodeId)
    if (!node) {
      return []
    }

    const availableRefs: CodeNode[] = []

    // with a while visit all the ancestors to looks for available refs
    let currentNode = node

    while (currentNode.meta?.parentId) {
      const parent = this.getNodeByID(currentNode.meta.parentId)

      if (!parent) {
        throw new Error("Node must have a parent")
      }

      const parentProperty = currentNode.meta.parentProperty

      if (!parentProperty) {
        throw new Error("Node must have a parent property")
      }

      const childList = nodeTypeMeta[parent.type]?.childLists?.find(
        (childList) => childList.name === parentProperty,
      )

      if (childList) {
        const nodeList = (parent as any)[parentProperty] as any[]

        const index = nodeList.indexOf(currentNode)

        if (index === -1) {
          throw new Error("Node must be in its parent")
        }

        for (let i = 0; i < index; i++) {
          const sibling = nodeList[i]

          if (referenceableNodeTypes.find(({ type }) => type === sibling.type)) {
            availableRefs.push(sibling)
          }
        }
      }

      currentNode = parent
    }

    return availableRefs
  }
}
