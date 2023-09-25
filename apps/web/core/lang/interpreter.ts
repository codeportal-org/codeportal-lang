import React from "react"

import { ComponentNode, ExpressionNode, StatementNode, UINode } from "./codeTree"

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
