import React from "react"

export type ProgramNode = {
  type: "program"
  body: Statement[]
}

export type UINode = UIElementNode | UITextNode | UIFragmentNode

export type ComponentNode = {
  type: "component"
  name: string
  props?: Record<string, any>
  body: Statement[]
}

export type FunctionNode = {
  type: "function"
  name: string
  params: string[]
  body: Statement[]
}

export type UIElementNode = {
  type: "ui element"
  tag: string
  style?: Record<string, any>
  children?: UINode[]
}

export type UITextNode = {
  type: "ui text"
  text: string
}

export type UIFragmentNode = {
  type: "ui fragment"
  children?: UINode[]
}

export type Statement =
  | ReturnStatement
  | PrintStatement
  | ComponentNode
  | FunctionNode
  | VarStatement

export type ReturnStatement = {
  type: "return"
  arg: Expression
}

export type VarStatement = {
  type: "var"
  name: string
  value: Expression
}

export type PrintStatement = {
  type: "print"
  arg: Expression
}

export type Expression = StringLiteral | NumberLiteral | BooleanLiteral | UINode

export type StringLiteral = {
  type: "string"
  value: string
}

export type NumberLiteral = {
  type: "number"
  value: number
}

export type BooleanLiteral = {
  type: "boolean"
  value: boolean
}

export const interpretUINode = (code: UINode): React.ReactNode => {
  let children: React.ReactNode[]

  if (code.type === "ui text") {
    return code.text
  }

  if (!code.children || code.children.length === 0) {
    children = []
  } else {
    children = code.children.map((child) => {
      return interpretUINode(child)
    })
  }

  if (code.type === "ui element") {
    const TagName = code.tag

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

export const interpretStatement = (code: Statement): any => {
  if (code.type === "return") {
    return interpretExpression(code.arg)
  } else if (code.type === "print") {
    console.log(interpretExpression(code.arg))
  }
}

export const interpretExpression = (code: Expression): React.ReactNode => {
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
