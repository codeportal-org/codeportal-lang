import React from "react"

export type CodeNode = ProgramNode | StatementNode | ExpressionNode | SpecialNodes

export type SpecialNodes =
  | UIPropDeclaration
  | UIPropNode
  | UISpreadPropNode
  | UIStyleNode
  | ParamDeclaration
  | ObjectProperty

export type CodeMeta = {
  parentId?: string
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
] as const

export type ExpressionNode =
  | LiteralNode
  | UINode
  | ReferenceNode
  | FunctionNode
  | FunctionCallNode
  | PathAccessNode
  | ObjectNode
  | NAryExpression
  | StateChangeNode

export type LiteralNode = StringLiteral | NumberLiteral | BooleanLiteral

export type UINode = UIElementNode | UITextNode | UIFragmentNode | UIExpressionNode

export const uiNodeTypes = ["ui element", "ui fragment", "ui text", "ui expression"]

export type ComponentNode = {
  type: "component"
  id: string
  name: string
  props?: UIPropDeclaration[]
  body: StatementNode[]
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
  body: ExpressionNode | StatementNode[]
  meta?: CodeMeta
}
