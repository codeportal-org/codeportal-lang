import { type TailwindScale } from "../tailwindData"

export type NodeKind = "statement" | "expression" | "ui" | "props" | "style" | "else if" | "ref"

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
  /** The name of the style. For Tailwind, this is for instance "bg" or "text-color". It is unique. */
  name: string
  /**
   * A tag is used to build the Tailwind class name. For instance, "bg" + "-" + "red" + "-" + "500". bg is the tag.
   * A tag is not unique.
   */
  tag?: string
  /**
   * For Tailwind, this is for instance ["red", "500"].
   */
  args?: (string | TailwindScale)[]
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
  /**
   * Empty node kind
   */
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

/**
 * A variable declaration.
 */
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
  operators: NAryOperator[]
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
