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
  name: string
  value: ExpressionNode
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

export type NodeKind = "statement" | "expression" | "special" | "ui"

export const nodeTypeMeta: Record<
  CodeNode["type"],
  {
    childLists: string[]
    expressions: string[]
    kinds: NodeKind[]
    title?: string
    description?: string
  }
> = {
  program: { kinds: ["special"], childLists: ["body"], expressions: [] },
  component: { kinds: ["statement"], childLists: ["body", "props"], expressions: [] },
  "component call": {
    kinds: ["expression", "ui"],
    childLists: ["children", "props"],
    expressions: [],
  },
  "ui element": {
    kinds: ["expression", "ui"],
    childLists: ["children", "props", "style"],
    expressions: [],
  },
  "ui fragment": { kinds: ["expression", "ui"], childLists: ["children"], expressions: [] },
  "ui expression": { kinds: ["expression", "ui"], childLists: [], expressions: ["expression"] },
  "ui prop declaration": { kinds: ["special"], childLists: [], expressions: ["value"] },
  "ui prop": { kinds: ["special"], childLists: [], expressions: ["value"] },
  "ui spread prop": { kinds: ["special"], childLists: [], expressions: ["arg"] },
  "ui style": { kinds: ["special"], childLists: [], expressions: ["value"] },
  return: { kinds: ["statement"], childLists: [], expressions: ["arg"] },
  assignment: { kinds: ["statement"], childLists: [], expressions: ["left", "right"] },
  state: { kinds: ["statement"], childLists: [], expressions: ["value"] },
  print: { kinds: ["statement"], childLists: [], expressions: ["arg"] },
  unary: { kinds: ["statement"], childLists: [], expressions: ["arg"] },
  nary: { kinds: ["statement"], childLists: ["args"], expressions: [] },
  function: { kinds: ["statement"], childLists: ["params", "body"], expressions: [] },
  "function call": { kinds: ["statement", "expression"], childLists: ["args"], expressions: [] },
  object: { kinds: ["statement"], childLists: ["props"], expressions: [] },
  "state change": { kinds: ["statement"], childLists: ["body"], expressions: [] },
  if: {
    title: "Conditional (if)",
    description:
      "Conditional block (if, if-else). This block lets you control the flow of your program based on certain conditions",
    kinds: ["statement"],
    childLists: ["then", "elseIf", "else"],
    expressions: [],
  },
  "else if": { kinds: ["statement"], childLists: ["then"], expressions: [] },
  try: { kinds: ["statement"], childLists: ["body", "catch", "finally"], expressions: [] },
  "path access": { kinds: ["expression"], childLists: ["path"], expressions: [] },
  var: { kinds: ["statement"], childLists: [], expressions: ["value"] },
  property: { kinds: ["statement"], childLists: [], expressions: ["name", "value"] },
  "ui text": { kinds: ["statement"], childLists: [], expressions: [] },
  empty: {
    title: "Empty block",
    description: "This node is used to represent an empty block or an empty expression",
    kinds: ["statement", "expression"],
    childLists: [],
    expressions: [],
  },
  param: { kinds: ["special"], childLists: [], expressions: [] },
  ref: { kinds: ["expression"], childLists: [], expressions: [] },
  string: { kinds: ["expression"], childLists: [], expressions: [] },
  number: { kinds: ["expression"], childLists: [], expressions: [] },
  boolean: { kinds: ["expression"], childLists: [], expressions: [] },
}

export const baseNodeTypeList: CodeNode["type"][] = ["if", "empty"]

export const baseNodeMetaList = baseNodeTypeList.map((type) => nodeTypeMeta[type])

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
