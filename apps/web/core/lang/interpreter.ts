import React from "react"

import {
  AssignmentStatement,
  CodeNode,
  ComponentCallNode,
  ComponentNode,
  ExpressionNode,
  FunctionNode,
  IfStatementNode,
  NAryExpression,
  NAryOperator,
  ObjectNode,
  PathAccessNode,
  PrintStatement,
  ProgramNode,
  ReferenceNode,
  StateChangeStatement,
  StateStatement,
  StatementNode,
  UINode,
  VarStatement,
} from "./codeTree"

type StateWrapper = {
  stateArray: [any, React.Dispatch<any>]
  type: Symbol
}

export type ErrorData = {
  nodeId: string
  subNodeIds: string[]
  message: string
}

export class Interpreter {
  private isDevSite: boolean = false

  private errors: ErrorData[] = []

  getErrors() {
    return this.errors
  }

  constructor(isDevSite?: boolean) {
    this.isDevSite = isDevSite ?? false
  }

  private reactMode: "client" | "server" = "client"

  setReactMode(mode: "client" | "server") {
    this.reactMode = mode
  }

  private stateSymbol = Symbol("state")

  private globalScope: Scope = {
    values: new Map(),
  }

  addGlobal(name: string, value: any) {
    this.globalScope.values.set(name, value)
  }

  removeGlobal(name: string) {
    this.globalScope.values.delete(name)
  }

  private commonGlobals = {
    print: (...args: any[]) => {
      console.log(...args)
    },
  }

  setCommonGlobal(name: "print", value: any) {
    this.commonGlobals[name] = value
  }

  private currentScope: Scope = this.globalScope

  private tailwindClassesSet = new Set<string>()

  getTailwindClasses() {
    return Array.from(this.tailwindClassesSet)
  }

  private newTailwindClass(className: string) {
    this.tailwindClassesSet.add(className)
  }

  interpret(node: ProgramNode) {
    this.errors = []
    this.currentScope = this.globalScope

    for (const statement of node.body) {
      this.interpretStatement(statement)
    }
  }

  interpretComponentCall(node: ComponentCallNode) {
    const componentResolvedData = this.resolveValueById<React.FC>(node.comp.refId)

    if (!componentResolvedData.resolved) {
      this.handleError({
        nodeId: node.id,
        subNodeIds: [node.comp.refId],
        message: "Component reference is not defined",
      })

      return null
    }

    const component = componentResolvedData.value!

    const props: Record<string, any> = {}

    if (node.props) {
      for (const prop of node.props) {
        props[prop.name] = this.interpretExpression(prop.value)
      }
    }

    if (node.children && node.children.length > 0) {
      const children = node.children.map((child) => {
        return this.interpretUINode(child)
      })

      return React.createElement(component, props, children)
    }

    return React.createElement(component, props)
  }

  private newScope() {
    const parent = this.currentScope

    this.currentScope = {
      values: new Map(),
      parent: parent,
    }

    return this.currentScope
  }

  private getScopeValues(): Map<string, any> {
    return this.currentScope.values
  }

  private interpretComponent(node: ComponentNode): React.FC {
    this.currentScope = this.globalScope

    const scope = this.getScopeValues()
    const component = (props: any) => {
      this.newScope()
      if (node.props) {
        for (let i = 0; i < node.props.length; i++) {
          const prop = node.props[i]!
          this.getScopeValues().set(prop.id, props[prop.name])
        }
      }

      return this.interpretStatementList(node.body)
    }
    if (node.name) {
      component.displayName = node.name
    }

    scope.set(node.id, component)
    return component
  }

  private interpretStatementList(statements: StatementNode[]) {
    const prevScope = this.newScope()

    try {
      for (const statement of statements) {
        this.interpretStatement(statement)
      }
    } catch (error) {
      if (error instanceof ReturnValue) {
        return error.value
      } else {
        throw error
      }
    } finally {
      this.currentScope = prevScope
    }
  }

  interpretStatement(node: StatementNode): any {
    if (node.type === "component") {
      this.interpretComponent(node)
    } else if (node.type === "var") {
      this.interpretVariableDeclaration(node)
    } else if (node.type === "state") {
      this.interpretStateDeclaration(node)
    } else if (node.type === "if") {
      this.interpretIfStatement(node)
    } else if (node.type === "state change") {
      this.interpretStateChange(node)
    } else if (node.type === "return") {
      throw new ReturnValue(this.interpretExpression(node.arg))
    } else if (node.type === "assignment") {
      this.interpretAssignment(node)
    } else if (node.type === "print") {
      this.interpretPrintStatement(node)
    } else if (node.type === "empty") {
    } else {
      throw new Error(`Statement type ${node.type} is not implemented`)
    }
  }

  private interpretPrintStatement(node: PrintStatement) {
    this.commonGlobals.print(this.interpretExpression(node.arg))
  }

  private interpretVariableDeclaration(node: VarStatement) {
    const scope = this.getScopeValues()
    scope.set(node.id, this.interpretExpression(node.value))
  }

  private interpretStateDeclaration(node: StateStatement) {
    if (this.reactMode === "server") {
      return
    }

    const scope = this.getScopeValues()
    const stateArray = React.useState(this.interpretExpression(node.value))
    scope.set(node.id, {
      stateArray,
      type: this.stateSymbol,
    } satisfies StateWrapper)
  }

  private interpretStateChange(node: StateChangeStatement) {
    if (this.reactMode === "server") {
      return
    }

    const stateWrapperResolvedData = this.resolveValueById<StateWrapper>(node.state.refId)

    if (!stateWrapperResolvedData.resolved) {
      this.handleError({
        nodeId: node.id,
        subNodeIds: [node.state.refId],
        message: "State reference is not defined",
      })

      return
    }

    const result = this.interpretStatementList(node.body)
    stateWrapperResolvedData.value!.stateArray[1](result)
  }

  private interpretAssignment(node: AssignmentStatement) {
    const scope = this.getScopeValues()
    const value = this.interpretExpression(node.right)

    if (node.left.type === "ref") {
      scope.set(node.left.refId, value)
    } else if (node.left.type === "path access") {
      const obj = this.interpretPathAccess(node.left, true) as Record<string, any>
      const prop = this.interpretExpression(node.left.path[node.left.path.length - 1]!) as string

      obj[prop] = value
    }
  }

  interpretUINode(node: UINode): React.ReactNode {
    let children: React.ReactNode[]

    if (node.type === "empty") {
      return null
    }

    if (node.type === "ui text") {
      return node.text
    }

    if (node.type === "ui expression") {
      return this.interpretExpression(node.expression) as React.ReactNode
    }

    if (!node.children || node.children.length === 0) {
      children = []
    } else {
      children = node.children
        .map((child) => {
          return this.interpretUINode(child)
        })
        .filter((child) => child !== null)
    }

    if (node.type === "ui element") {
      const TagName = node.name

      const props: Record<string, any> = {
        key: node.id,
        className: "",
      }

      if (this.isDevSite) {
        props["data-codeportal-node-id"] = node.id
      }

      if (node.props) {
        for (const prop of node.props) {
          if (prop.type === "ui prop") {
            if (prop.name === "className") {
              props.className =
                (props.className === "" ? "" : " ") + this.interpretExpression(prop.value)
            } else {
              props[prop.name] = this.interpretExpression(prop.value)
            }
          } else if (prop.type === "ui spread prop") {
            const spreadObj = this.interpretExpression(prop.arg)
            if (spreadObj && typeof spreadObj === "object") {
              Object.assign(props, spreadObj)
            }
          }
        }
      }

      if (node.style) {
        let tailwindClasses = ""

        for (const style of node.style) {
          if (tailwindClasses !== "") {
            tailwindClasses += " "
          }

          const tailwindClass = style.args
            ? `${style.tag}-${style.args
                .map((arg) => (typeof arg === "string" ? arg : arg.name))
                .join("-")}`
            : style.tag!

          tailwindClasses += tailwindClass

          this.newTailwindClass(tailwindClass)
        }

        props.className = (props.className === "" ? "" : " ") + tailwindClasses
      }

      if (props.className === "") {
        delete props.className
      }

      if (!node.children || node.children.length === 0) {
        return React.createElement(TagName, props)
      }

      return React.createElement(TagName, props, children)
    } else if (node.type === "ui fragment") {
      return React.createElement(React.Fragment, { key: node.id }, children)
    } else {
      throw new Error(`UI node type ${(node as any).type} is not implemented`)
    }
  }

  interpretExpression(node: ExpressionNode): unknown {
    if (node.type === "string") {
      return node.value
    } else if (node.type === "number") {
      return node.value
    } else if (node.type === "boolean") {
      return node.value
    } else if (node.type === "ref") {
      return this.interpretRef(node)
    } else if (node.type === "nary") {
      return this.interpretNaryExpression(node)
    } else if (node.type === "empty") {
      return null
    } else if (node.type === "object") {
      return this.interpretObjectNode(node)
    } else if (node.type === "function") {
      return this.interpretFunction(node)
    } else if (node.type === "path access") {
      this.interpretPathAccess(node)
    } else if (
      node.type === "ui element" ||
      node.type === "ui fragment" ||
      node.type === "ui text"
    ) {
      return this.interpretUINode(node)
    } else {
      throw new Error(`Expression type ${node.type} is not implemented`)
    }
  }

  private resolveValueById<T>(nodeId: string): { value: T | undefined; resolved: boolean } {
    let value
    let scope = this.currentScope

    while (!scope.values.has(nodeId) && scope.parent) {
      scope = scope.parent
    }

    if (!scope.values.has(nodeId)) {
      console.log("Value is not resolved - ------ 🎯")
      return { value: undefined, resolved: false }
    }

    value = scope.values.get(nodeId)

    return { value, resolved: true }
  }

  private interpretRef(node: ReferenceNode) {
    const resolvedData = this.resolveValueById(node.refId)

    if (!resolvedData.resolved) {
      console.log("Reference is not defined - ------ 🎯")
      this.handleError({
        nodeId: node.id,
        subNodeIds: [node.refId],
        message: "Reference is not defined",
      })

      return undefined
    }

    return resolvedData.value
  }

  private interpretFunction(node: FunctionNode): any {
    const scope = this.getScopeValues()
    const func = (...args: any[]) => {
      this.newScope()
      if (node.params) {
        for (let i = 0; i < node.params.length; i++) {
          const param = node.params[i]!
          this.getScopeValues().set(param.id, args[i])
        }
      }

      return this.interpretStatementList(node.body)
    }
    if (node.name) {
      Object.defineProperty(func, "name", { value: node.name })
    }

    scope.set(node.id, func)
    return func
  }

  private interpretNaryExpression(node: NAryExpression) {
    let result: any

    let first = true

    let i = 0
    for (let arg of node.args) {
      if (first) {
        result = this.interpretExpression(arg)
        first = false
        continue
      }

      const argValue = this.interpretExpression(arg)

      result = this.interpretNAryOperator(node.operators[i]!, result, argValue)
      i++
    }

    return result
  }

  private interpretNAryOperator(operator: NAryOperator, left: any, right: any): any {
    if (operator === "+") {
      return left + right
    } else if (operator === "-") {
      return left - right
    } else if (operator === "*") {
      return left * right
    } else if (operator === "/") {
      return left / right
    } else if (operator === "%") {
      return left % right
    } else if (operator === "==") {
      return left === right
    } else if (operator === "!=") {
      return left !== right
    } else if (operator === ">") {
      return left > right
    } else if (operator === "<") {
      return left < right
    } else if (operator === ">=") {
      return left >= right
    } else if (operator === "<=") {
      return left <= right
    } else if (operator === "&&") {
      return left && right
    } else if (operator === "||") {
      return left || right
    } else {
      throw new Error(`Operator ${operator} is not implemented`)
    }
  }

  private interpretObjectNode(node: ObjectNode) {
    const obj: Record<string, any> = {}

    for (const prop of node.props) {
      const name = this.interpretExpression(prop.name) as string

      obj[name] = this.interpretExpression(prop.value)
    }

    return obj
  }

  private interpretIfStatement(node: IfStatementNode) {
    let condition = this.interpretExpression(node.test)

    if (condition) {
      this.interpretStatementList(node.then)
    }

    // TODO: missing else-if chain
  }

  private interpretPathAccess(node: PathAccessNode, skipLast = false) {
    const obj = this.interpretExpression(node.path[0]!)

    let currentObj = obj as Record<string, any>

    const offset = skipLast ? 1 : 0

    for (let i = 0; i < node.path.length - 1 - offset; i++) {
      const prop = this.interpretExpression(node.path[i]!)! as string

      currentObj = currentObj[prop]
    }

    return currentObj
  }

  private handleError(errorData: ErrorData) {
    this.errors.push(errorData)
    this.commonGlobals.print(errorData.message)
  }
}

export class ReturnValue extends Error {
  constructor(public value: any) {
    super()
  }
}

export type Scope = {
  values: Map<string, any>
  parent?: Scope
}
