import React from "react"

export type CodeNode = ProgramNode | StatementNode | ExpressionNode | SpecialNodes

export type SpecialNodes =
  | UIPropDeclaration
  | UIPropNode
  | UISpreadPropNode
  | UIStyleNode
  | ParamDeclaration
  | ObjectProperty
  | ElseIfNode

export type CodeMeta = {
  parentId?: string
  parentProperty?: string
  extras?: Record<string, any>
  ui?: {
    isHovered: boolean
    isSelected: boolean
  }
}

export type ProgramNode = {
  id: string
  /** Next id to be used by a node */
  idCounter: number
  type: "program"
  body: StatementNode[]
  meta?: CodeMeta
}

export const statementTypes = [
  "return",
  "print",
  "component",
  "function",
  "var",
  "state",
  "function call",
  "assignment",
  "try",
  "if",
  "empty",
  "state change",
] as const

export type StatementNode =
  | ReturnStatementNode
  | PrintStatement
  | ComponentNode
  | FunctionNode
  | VarStatement
  | StateStatement
  | FunctionCallNode
  | StateChangeNode
  | AssignmentStatement
  | TryStatementNode
  | IfStatementNode
  | EmptyNode

export const expressionTypes = [
  "string",
  "number",
  "boolean",
  "ui element",
  "ui fragment",
  "ui text",
  "ui expression",
  "ref",
  "path access",
  "object",
  "nary",
  "unary",
  "function call",
  "component call",
  "empty",
] as const

export type ExpressionNode =
  | LiteralNode
  | UINode
  | ReferenceNode
  | FunctionNode
  | FunctionCallNode
  | ComponentNode
  | ComponentCallNode
  | PathAccessNode
  | ObjectNode
  | NAryExpression
  | StateChangeNode
  | UnaryExpressionNode
  | EmptyNode

export type LiteralNode = StringLiteral | NumberLiteral | BooleanLiteral

export type UINode =
  | UIElementNode
  | UITextNode
  | UIFragmentNode
  | UIExpressionNode
  | ComponentCallNode
  | EmptyNode

export const uiNodeTypes = ["ui element", "ui fragment", "ui text", "ui expression"]

export type ComponentNode = {
  type: "component"
  id: string
  name: string
  props?: UIPropDeclaration[]
  body: StatementNode[]
  meta?: CodeMeta
}

export type ComponentCallNode = {
  type: "component call"
  id: string
  comp: ReferenceNode
  props?: UIPropNode[]
  children?: UINode[]
  meta?: CodeMeta
}

export type UIPropDeclaration = {
  type: "ui prop declaration"
  id: string
  name: string
  value: ExpressionNode
  meta?: CodeMeta
}

/**
 * Can be a React component use or an html element use.
 * The difference is that a React component use has a capital letter.
 */
export type UIElementNode = {
  type: "ui element"
  id: string
  name: string
  props?: (UIPropNode | UISpreadPropNode)[]
  style?: UIStyleNode[]
  children?: UINode[]
  meta?: CodeMeta
}

export type UIPropNode = {
  type: "ui prop"
  id: string
  name: string
  value: ExpressionNode
  meta?: CodeMeta
}

export type UISpreadPropNode = {
  type: "ui spread prop"
  id: string
  arg: ExpressionNode
  meta?: CodeMeta
}

/**
 * This node does not have an id because its name is what defines its semantics (functionality) like CSS props.
 */
export type UIStyleNode = {
  type: "ui style"
  id: string
  kind: "style" | "tailwind"
  /** The name of the style. For Tailwind, this is for instance "bg" or "text-color". */
  name: string
  /**
   * For Tailwind, this is for instance ["red", "500"].
   */
  args?: string[]
  prefix?: string
  /**
   * The test is used to determine whether the style should be applied or not.
   */
  test: ExpressionNode
  meta?: CodeMeta
}

export type UITextNode = {
  type: "ui text"
  id: string
  text: string
  meta?: CodeMeta
}

export type UIFragmentNode = {
  type: "ui fragment"
  id: string
  children?: UINode[]
  meta?: CodeMeta
}

export type UIExpressionNode = {
  type: "ui expression"
  id: string
  expression: ExpressionNode
  meta?: CodeMeta
}

export type ReturnStatementNode = {
  type: "return"
  id: string
  arg: ExpressionNode
  meta?: CodeMeta
}

export type EmptyNode = {
  type: "empty"
  kind: NodeKind
  id: string
  meta?: CodeMeta
}

export type AssignmentOperator =
  | "="
  | "+="
  | "-="
  | "*="
  | "/="
  | "%="
  | "**="
  | "<<="
  | ">>="
  | ">>>="
  | "|="
  | "^="
  | "&="
  | "||="
  | "&&="
  | "??="

export type AssignmentStatement = {
  type: "assignment"
  id: string
  operator: AssignmentOperator
  left: ReferenceNode | PathAccessNode
  right: ExpressionNode
  meta?: CodeMeta
}

export type PathAccessNode = {
  type: "path access"
  id: string
  path: ExpressionNode[]
  meta?: CodeMeta
}

export type VarStatement = {
  type: "var"
  id: string
  name: string
  value: ExpressionNode
  meta?: CodeMeta
}

export type StateStatement = {
  type: "state"
  id: string
  name: string
  value: ExpressionNode
  meta?: CodeMeta
}

export type PrintStatement = {
  type: "print"
  id: string
  arg: ExpressionNode
  meta?: CodeMeta
}

export type TryStatementNode = {
  type: "try"
  id: string
  body: StatementNode[]
  catchParam?: ParamDeclaration
  catch: StatementNode[]
  finally?: StatementNode[]
  meta?: CodeMeta
}

export type IfStatementNode = {
  type: "if"
  id: string
  test: ExpressionNode
  then: StatementNode[]
  /** if-else if chain */
  elseIf?: ElseIfNode[]
  else?: StatementNode[]
  meta?: CodeMeta
}

/**
 * Node to support if-else if chains.
 */
export type ElseIfNode = {
  type: "else if"
  id: string
  test: ExpressionNode
  then: StatementNode[]
  meta?: CodeMeta
}

/**
 * A reference to a variable or function.
 * Things are referenced by their id. This means ids are part of the semantics of the language.
 * A function or variable should have a name in order to be referenced.
 */
export type ReferenceNode = {
  type: "ref"
  id: string
  /** The id of the variable or function */
  refId: string
  meta?: CodeMeta
}

export type StringLiteral = {
  type: "string"
  id: string
  value: string
  meta?: CodeMeta
}

export type NumberLiteral = {
  type: "number"
  id: string
  value: number
  meta?: CodeMeta
}

export type BooleanLiteral = {
  type: "boolean"
  id: string
  value: boolean
  meta?: CodeMeta
}

export type UnaryOperator = "!" | "-"

export type UnaryExpressionNode = {
  type: "unary"
  id: string
  operator: UnaryOperator
  arg: ExpressionNode
  meta?: CodeMeta
}

export type NAryExpression = {
  type: "nary"
  id: string
  operator: NAryOperator
  args: ExpressionNode[]
  meta?: CodeMeta
}

export const NAryOperators = {
  "+": "Addition",
  "-": "Subtraction",
  "*": "Multiplication",
  "/": "Division",
  "%": "Modulus",
  "==": "Equal to",
  "!=": "Not equal to",
  ">": "Greater than",
  "<": "Less than",
  ">=": "Greater than or equal to",
  "<=": "Less than or equal to",
  "&&": "Logical AND",
  "||": "Logical OR",
}

export const NAryOperatorSymbols = Object.keys(NAryOperators) as NAryOperator[]

export type NAryOperator = keyof typeof NAryOperators

/**
 * A function declaration can be both an expression and a statement.
 */
export type FunctionNode = {
  type: "function"
  id: string
  name?: string
  inline?: boolean
  params?: ParamDeclaration[]
  body: StatementNode[]
  meta?: CodeMeta
}

export type ParamDeclaration = {
  type: "param"
  id: string
  name: string
  meta?: CodeMeta
}

/**
 * A function call can be both an expression and a statement. We avoid the use of a ExpressionStatement node.
 */
export type FunctionCallNode = {
  type: "function call"
  id: string
  callee: ReferenceNode | PathAccessNode
  args: ExpressionNode[]
  meta?: CodeMeta
}

export type ObjectNode = {
  type: "object"
  id: string
  props: ObjectProperty[]
  meta?: CodeMeta
}

export type ObjectProperty = {
  type: "property"
  id: string
  name: ExpressionNode
  value: ExpressionNode
  meta?: CodeMeta
}

export type StateChangeNode = {
  type: "state change"
  id: string
  state: ReferenceNode
  body: StatementNode[]
  meta?: CodeMeta
}

export type NodeKind = "statement" | "expression" | "ui" | "props" | "style" | "else if"

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
}

export const nodeTypeMeta: Record<CodeNode["type"], NodeTypeMeta> = {
  program: { kinds: [], childLists: [{ name: "body", kind: "statement" }] },
  component: {
    kinds: ["statement"],
    childLists: [
      { name: "body", kind: "statement" },
      { name: "props", kind: "props" },
    ],
  },
  "component call": {
    kinds: ["expression", "ui"],
    childLists: [
      { name: "children", kind: "ui" },
      { name: "props", kind: "props" },
    ],
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
  state: { kinds: ["statement"], expressions: ["value"] },
  print: { kinds: ["statement"], expressions: ["arg"] },
  unary: { kinds: ["statement"], expressions: ["arg"] },
  nary: { kinds: ["statement"], childLists: [{ name: "args", kind: "statement" }] },
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
  var: { kinds: ["statement"], expressions: ["value"] },
  property: { kinds: ["statement"], expressions: ["name", "value"] },
  empty: {
    title: "Empty block",
    description: "This node is used to represent an empty block or an empty expression",
    kinds: ["statement", "expression", "ui", "props", "style"],
  },
  param: { kinds: [] },
  ref: { kinds: ["expression"] },
  string: { kinds: ["expression"] },
  number: { kinds: ["expression"] },
  boolean: { kinds: ["expression"] },
}

export const baseNodeTypeList: {
  type: CodeNode["type"]
  title?: string
  name?: string
}[] = [
  { type: "if", title: nodeTypeMeta.if.title },
  {
    type: "ui element",
    name: "div",
    title: "Box element (HTML div)",
  },
  {
    type: "ui element",
    name: "h1",
    title: "Heading element (HTML h1)",
  },
  {
    type: "ui text",
    title: "Text",
  },
]

export const baseNodeMetaList = baseNodeTypeList.map((node) => ({
  type: node.type,
  title: node.title,
  name: node.name,
  kinds: nodeTypeMeta[node.type].kinds,
}))

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
