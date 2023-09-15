import React from "react"

export type CodeNode = ProgramNode | StatementNode | ExpressionNode | SpecialNodes

export type SpecialNodes =
  | UIPropDeclaration
  | UIPropNode
  | UIStyleNode
  | ParamDeclaration
  | ObjectProperty

export type CodeMeta = {
  parent?: CodeNode
  extras?: Record<string, any>
}

export type ProgramNode = {
  type: "program"
  body: StatementNode[]
  meta?: CodeMeta
}

export type StatementNode =
  | ReturnStatementNode
  | PrintStatement
  | ComponentNode
  | FunctionNode
  | VarStatement
  | StateStatement
  | FunctionCallNode
  | AssignmentStatement
  | TryStatementNode

export type ExpressionNode =
  | LiteralNode
  | UINode
  | ReferenceNode
  | FunctionNode
  | FunctionCallNode
  | PathAccessNode
  | ObjectNode
  | NAryExpression

export type LiteralNode = StringLiteral | NumberLiteral | BooleanLiteral

export type UINode = UIElementNode | UITextNode | UIFragmentNode | UIExpressionNode

export type ComponentNode = {
  type: "component"
  name: string
  props?: UIPropDeclaration[]
  body: StatementNode[]
  meta?: CodeMeta
}

export type UIPropDeclaration = {
  type: "ui prop declaration"
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
  name: string
  props?: UIPropNode[]
  style?: UIStyleNode[]
  children?: UINode[]
  meta?: CodeMeta
}

export type UIPropNode = {
  type: "ui prop"
  name: string
  value: ExpressionNode
  meta?: CodeMeta
}

export type UIStyleNode = {
  type: "ui style"
  name: string
  value: ExpressionNode
  meta?: CodeMeta
}

export type UITextNode = {
  type: "ui text"
  text: string
  meta?: CodeMeta
}

export type UIFragmentNode = {
  type: "ui fragment"
  children?: UINode[]
  meta?: CodeMeta
}

export type UIExpressionNode = {
  type: "ui expression"
  expression: ExpressionNode
  meta?: CodeMeta
}

export type ReturnStatementNode = {
  type: "return"
  arg: ExpressionNode
  meta?: CodeMeta
}

export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%="

export type AssignmentStatement = {
  type: "assignment"
  operator: AssignmentOperator
  left: ReferenceNode | PathAccessNode
  right: ExpressionNode
  meta?: CodeMeta
}

export type PathAccessNode = {
  type: "path access"
  path: ExpressionNode[]
  meta?: CodeMeta
}

export type VarStatement = {
  type: "var"
  name: string
  value: ExpressionNode
  meta?: CodeMeta
}

export type StateStatement = {
  type: "state"
  name: string
  value: ExpressionNode
  meta?: CodeMeta
}

export type PrintStatement = {
  type: "print"
  arg: ExpressionNode
  meta?: CodeMeta
}

export type TryStatementNode = {
  type: "try"
  body: StatementNode[]
  catch: StatementNode[]
  finally?: StatementNode[]
  meta?: CodeMeta
}

/**
 * A reference to a variable or function.
 */
export type ReferenceNode = {
  type: "ref"
  name: string
  meta?: CodeMeta
}

export type StringLiteral = {
  type: "string"
  value: string
  meta?: CodeMeta
}

export type NumberLiteral = {
  type: "number"
  value: number
  meta?: CodeMeta
}

export type BooleanLiteral = {
  type: "boolean"
  value: boolean
  meta?: CodeMeta
}

export type NAryExpression = {
  type: "nary"
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
  name?: string
  inline?: boolean
  params?: ParamDeclaration[]
  body: StatementNode[]
  meta?: CodeMeta
}

export type ParamDeclaration = {
  type: "param"
  name: string
  meta?: CodeMeta
}

/**
 * A function call can be both an expression and a statement. We avoid the use of a ExpressionStatement node.
 */
export type FunctionCallNode = {
  type: "function call"
  callee: ReferenceNode | PathAccessNode
  args: ExpressionNode[]
  meta?: CodeMeta
}

export type ObjectNode = {
  type: "object"
  properties: ObjectProperty[]
  meta?: CodeMeta
}

export type ObjectProperty = {
  type: "property"
  name: ExpressionNode
  value: ExpressionNode
  meta?: CodeMeta
}

export const interpretUINode = (code: UINode): React.ReactNode => {
  let children: React.ReactNode[]

  if (code.type === "ui text") {
    return code.text
  }

  if (code.type === "ui expression") {
    return interpretExpression(code.expression)
  }

  if (!code.children || code.children.length === 0) {
    children = []
  } else {
    children = code.children.map((child) => {
      return interpretUINode(child)
    })
  }

  if (code.type === "ui element") {
    const TagName = code.name

    if (!code.children || code.children.length === 0) {
      return React.createElement(TagName, { style: code.style })
    }

    return React.createElement(TagName, { style: code.style }, children)
  } else if (code.type === "ui fragment") {
    return React.createElement(React.Fragment, null, children)
  } else {
    return null
  }
}

export const interpretComponent = (code: ComponentNode): React.ReactNode => {
  for (const statement of code.body) {
    const res = interpretStatement(statement)

    if (res) {
      return res
    }
  }
}

export const interpretStatement = (code: StatementNode): any => {
  if (code.type === "return") {
    return interpretExpression(code.arg)
  } else if (code.type === "print") {
    console.log(interpretExpression(code.arg))
  }
}

export const interpretExpression = (code: ExpressionNode): React.ReactNode => {
  if (code.type === "string") {
    return code.value
  } else if (code.type === "number") {
    return code.value
  } else if (code.type === "boolean") {
    return code.value
  } else if (code.type === "ui element" || code.type === "ui fragment" || code.type === "ui text") {
    return interpretUINode(code)
  }
}
