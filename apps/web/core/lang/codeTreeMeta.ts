import { CodeNode, NodeKind } from "./codeTree"

export type ChildList = {
  name: string
  kind: NodeKind
  alwaysPresent?: boolean
}

export type NodeTypeMeta = {
  childLists?: ChildList[]
  argLists?: string[]
  expressions?: string[]
  kinds: NodeKind[]
  title?: string
  description?: string
  hasName?: boolean
  /**
   * Whether this node can be referenced by a reference node.
   */
  canReference?: boolean
  /**
   * The type of node that can reference this node. This is used for especial nodes like function calls and components.
   * Ref nodes can reference any node with canReference === true. So a node with type "ref" is a special case.
   * Only applicable if `canReference` is true.
   */
  referencedBy?: CodeNode["type"]
  /**
   * Whether this node is a reference node.
   */
  isReference?: boolean
  /**
   * The type of node that this node references. This is used for especial nodes like function calls and components.
   * Only applicable if `isReference` is true.
   */
  references?: CodeNode["type"]
}

export const nodeTypeMeta: Record<CodeNode["type"], NodeTypeMeta> = {
  program: { kinds: [], childLists: [{ name: "body", kind: "statement" }] },
  ref: { kinds: ["expression"] },
  component: {
    kinds: ["statement"],
    childLists: [
      { name: "body", kind: "statement" },
      { name: "props", kind: "props" },
    ],
    canReference: true,
    referencedBy: "component call",
  },
  "component call": {
    kinds: ["expression", "ui"],
    childLists: [
      { name: "children", kind: "ui" },
      { name: "props", kind: "props" },
    ],
    isReference: true,
    references: "component",
  },
  "ui element": {
    title: "UI Element",
    kinds: ["expression", "ui"],
    childLists: [
      { name: "children", kind: "ui", alwaysPresent: true },
      { name: "props", kind: "props" },
      { name: "style", kind: "style" },
    ],
  },
  "ui fragment": { kinds: ["expression", "ui"], childLists: [{ name: "children", kind: "ui" }] },
  "ui text": { kinds: ["expression", "ui"] },
  "ui expression": { kinds: ["expression", "ui"], expressions: ["expression"] },
  "ui prop declaration": { kinds: [], expressions: ["value"] },
  "ui prop": { kinds: [], expressions: ["value"] },
  "ui spread prop": { kinds: [], expressions: ["arg"] },
  "ui style": { kinds: ["style"], expressions: ["test"] },
  return: { kinds: ["statement"], expressions: ["arg"] },
  assignment: { kinds: ["statement"], expressions: ["left", "right"] },
  state: {
    title: "State declaration",
    description: "This node is used to declare a state in the current scope",
    hasName: true,
    kinds: ["statement"],
    expressions: ["value"],
  },
  print: {
    title: "Print",
    kinds: ["statement"],
    expressions: ["arg"],
  },
  unary: { kinds: ["statement"], expressions: ["arg"] },
  nary: {
    title: "Expression",
    kinds: ["statement"],
    childLists: [{ name: "args", kind: "statement" }],
  },
  function: {
    kinds: ["statement"],
    childLists: [
      { name: "params", kind: "statement" },
      { name: "body", kind: "statement" },
    ],
  },
  "function call": {
    kinds: ["statement", "expression"],
    childLists: [{ name: "args", kind: "statement" }],
  },
  object: { kinds: ["statement"], childLists: [{ name: "props", kind: "props" }] },
  "state change": { kinds: ["statement"], childLists: [{ name: "body", kind: "statement" }] },
  if: {
    title: "Conditional (if)",
    description:
      "Conditional block (if, if-else). This block lets you control the flow of your program based on certain conditions",
    kinds: ["statement"],
    childLists: [
      { name: "then", kind: "statement", alwaysPresent: true },
      { name: "elseIf", kind: "else if" },
      { name: "else", kind: "statement" },
    ],
    expressions: ["test"],
  },
  "else if": { kinds: ["statement"], childLists: [{ name: "then", kind: "statement" }] },
  try: {
    kinds: ["statement"],
    childLists: [
      { name: "body", kind: "statement" },
      { name: "catch", kind: "statement" },
      { name: "finally", kind: "statement" },
    ],
  },
  "path access": { kinds: ["expression"], argLists: ["path"] },
  var: {
    title: "Variable declaration",
    description: "This node is used to declare a variable in the current scope",
    kinds: ["statement"],
    expressions: ["value"],
    hasName: true,
    canReference: true,
    referencedBy: "ref",
  },
  property: { kinds: ["statement"], expressions: ["name", "value"] },
  empty: {
    title: "Empty block",
    description: "This node is used to represent an empty block or an empty expression",
    kinds: ["statement", "expression", "ui", "props", "style"],
  },
  param: { kinds: [] },
  string: {
    title: "String (text)",
    kinds: ["expression"],
  },
  number: {
    title: "Number",
    kinds: ["expression"],
  },
  boolean: {
    title: "Boolean",
    kinds: ["expression"],
  },
}

export const uiNodeTypes = Object.entries(nodeTypeMeta)
  .filter(([type, meta]) => meta.kinds.includes("ui"))
  .map(([type]) => type)

export const isNodeKind = (node: CodeNode, kind: NodeKind) => {
  return nodeTypeMeta[node.type].kinds.includes(kind)
}

/**
 * Returns true if the node types have common kinds.
 */
export const areNodeTypesCompatible = (
  nodeType1: CodeNode["type"],
  nodeType2: CodeNode["type"],
) => {
  const kinds1 = nodeTypeMeta[nodeType1].kinds
  const kinds2 = nodeTypeMeta[nodeType2].kinds

  return kinds1.some((kind) => kinds2.includes(kind))
}

export const referenceableNodeTypes = Object.entries(nodeTypeMeta)
  .filter(([type, meta]) => meta.canReference)
  .map(([type, meta]) => ({
    type: type as CodeNode["type"],
    title: meta.title,
  }))
