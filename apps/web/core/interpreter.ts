import React from "react"

export type UINode = UIElementNode | UITextNode | UIFragmentNode

export type ComponentNode = {
  type: "component"
  name: string
  statements: Statement[]
}

export type UIElementNode = {
  type: "element"
  tag: string
  style?: Record<string, any>
  children?: UINode[]
}

export type UITextNode = {
  type: "text"
  text: string
}

export type UIFragmentNode = {
  type: "fragment"
  children?: UINode[]
}

export type Statement = ReturnStatement

export type ReturnStatement = {
  type: "return"
  arg: UINode
}

export const interpretUINode = (code: UINode): React.ReactNode => {
  let children: React.ReactNode[]

  if (code.type === "text") {
    return code.text
  }

  if (!code.children || code.children.length === 0) {
    children = []
  } else {
    children = code.children.map((child) => {
      return interpretUINode(child)
    })
  }

  if (code.type === "element") {
    const TagName = code.tag

    if (!code.children || code.children.length === 0) {
      return React.createElement(TagName, { style: code.style })
    }

    return React.createElement(TagName, { style: code.style }, children)
  } else if (code.type === "fragment") {
    return React.createElement(React.Fragment, null, children)
  } else {
    return null
  }
}

export const interpretComponent = (code: ComponentNode): React.ReactNode => {
  for (const statement of code.statements) {
    if (statement.type === "return") {
      return interpretUINode(statement.arg)
    }
  }
}
