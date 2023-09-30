import {
  CodeNode,
  ComponentNode,
  ElseIfNode,
  ExpressionNode,
  FunctionCallNode,
  FunctionNode,
  IfStatementNode,
  LiteralNode,
  NAryExpression,
  PathAccessNode,
  ProgramNode,
  ReferenceNode,
  ReturnStatementNode,
  StateChangeNode,
  StateStatement,
  StatementNode,
  UIElementNode,
  UIExpressionNode,
  UIFragmentNode,
  UINode,
  UIPropDeclaration,
  UIPropNode,
  UISpreadPropNode,
  UITextNode,
  UnaryExpressionNode,
  VarStatement,
} from "./codeTree"

export type ParentMeta = {
  parent: CodeNode
  /**
   * The property name of the parent node that this node is a child of.
   */
  property: string
}

export class CodeTreeWalk {
  parentNodeStack: ParentMeta[] = []
  callback: (node: CodeNode, parentMeta: ParentMeta | undefined) => void = () => {}

  reset() {
    this.parentNodeStack = []
    this.callback = () => {}
  }

  full(code: ProgramNode, callback: (node: CodeNode, parentMeta: ParentMeta | undefined) => void) {
    this.callback = callback
    if (code.type === "program") {
      this.walkProgram(code)
    }

    this.reset()
  }

  private currentParentNode(): ParentMeta | undefined {
    return this.parentNodeStack[this.parentNodeStack.length - 1]
  }

  private walkProgram(node: ProgramNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({ parent: node, property: "body" })

    node.body.forEach((child) => {
      this.walkStatement(child)
    })

    this.parentNodeStack.pop()
  }

  private walkStatement(node: StatementNode) {
    // router function, do not call callback here

    if (node.type === "var") {
      this.walkVariableDeclaration(node)
    } else if (node.type === "return") {
      this.walkReturnStatement(node)
    } else if (node.type === "if") {
      this.walkIfStatement(node)
    } else if (node.type === "function") {
      this.walkFunctionDeclaration(node)
    } else if (node.type === "component") {
      this.walkComponent(node)
    } else if (node.type === "function call") {
      this.walkFunctionCall(node)
    } else if (node.type === "state") {
      this.walkStateDeclaration(node)
    } else if (node.type === "state change") {
      this.walkStateChangeDeclaration(node)
    } else {
      throw new Error(`Unknown statement type: ${node.type}`)
    }
  }

  private walkExpression(node: ExpressionNode) {
    // router function, do not call callback here

    if (node.type === "string" || node.type === "number" || node.type === "boolean") {
      this.walkLiteral(node)
    } else if (node.type === "ref") {
      this.walkRef(node)
    } else if (node.type === "function") {
      this.walkFunctionDeclaration(node)
    } else if (node.type === "nary") {
      this.walkNAryExpression(node)
    } else if (node.type === "unary") {
      this.walkUnaryExpression(node)
    } else if (node.type === "state change") {
      this.walkStateChangeDeclaration(node)
    } else if (
      node.type === "ui element" ||
      node.type === "ui fragment" ||
      node.type === "ui text" ||
      node.type === "ui expression"
    ) {
      this.walkUI(node)
    } else {
      throw new Error(`Unknown expression type: ${node.type}`)
    }
  }

  private walkLiteral(node: LiteralNode) {
    this.callback(node, this.currentParentNode())
  }

  private walkUI(node: UINode) {
    // router function, do not call callback here

    if (node.type === "ui expression") {
      this.walkUIExpression(node)
    } else if (node.type === "ui element") {
      this.walkUIElement(node)
    } else if (node.type === "ui fragment") {
      this.walkUIFragment(node)
    } else if (node.type === "ui text") {
      this.walkUIText(node)
    } else {
      throw new Error(`Unknown UI type: ${(node as any).type}`)
    }
  }

  private walkUIExpression(node: UIExpressionNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "expression",
    })

    this.walkExpression(node.expression)

    this.parentNodeStack.pop()
  }

  private walkUIElement(node: UIElementNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "props",
    })

    node.props?.forEach((child) => {
      if (child.type === "ui prop") {
        this.walkUIPropNode(child)
      } else {
        this.walkUISpreadPropNode(child)
      }
    })

    node.children?.forEach((child) => {
      this.walkUI(child)
    })

    this.parentNodeStack.pop()
  }

  private walkUIPropNode(node: UIPropNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "value",
    })

    this.walkExpression(node.value)

    this.parentNodeStack.pop()
  }

  private walkUISpreadPropNode(node: UISpreadPropNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "arg",
    })

    this.walkExpression(node.arg)

    this.parentNodeStack.pop()
  }

  private walkReturnStatement(code: ReturnStatementNode) {
    this.callback(code, this.currentParentNode())
    this.parentNodeStack.push({
      parent: code,
      property: "arg",
    })

    this.walkExpression(code.arg)

    this.parentNodeStack.pop()
  }

  private walkVariableDeclaration(code: VarStatement) {
    this.callback(code, this.currentParentNode())
    this.parentNodeStack.push({
      parent: code,
      property: "value",
    })

    this.walkExpression(code.value)

    this.parentNodeStack.pop()
  }

  private walkFunctionDeclaration(node: FunctionNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "body",
    })

    node.body.forEach((child) => {
      this.walkStatement(child)
    })

    this.parentNodeStack.pop()
  }

  private walkFunctionCall(node: FunctionCallNode) {
    this.callback(node, this.currentParentNode())

    if (node.callee.type === "path access") {
      this.parentNodeStack.push({
        parent: node,
        property: "callee",
      })
      this.walkPathAccess(node.callee)
      this.parentNodeStack.pop()
    } else if (node.callee.type === "ref") {
      this.parentNodeStack.push({
        parent: node,
        property: "callee",
      })
      this.walkRef(node.callee)
      this.parentNodeStack.pop()
    }

    this.parentNodeStack.push({
      parent: node,
      property: "args",
    })

    node.args.forEach((child) => {
      this.walkExpression(child)
    })

    this.parentNodeStack.pop()
  }

  private walkRef(node: ReferenceNode) {
    this.callback(node, this.currentParentNode())
  }

  private walkPathAccess(node: PathAccessNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "path",
    })

    node.path.forEach((child) => {
      this.walkExpression(child)
    })

    this.parentNodeStack.pop()
  }

  private walkStateDeclaration(node: StateStatement) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "value",
    })

    this.walkExpression(node.value)

    this.parentNodeStack.pop()
  }

  private walkStateChangeDeclaration(node: StateChangeNode) {
    this.callback(node, this.currentParentNode())

    this.parentNodeStack.push({
      parent: node,
      property: "state",
    })
    this.walkRef(node.state)
    this.parentNodeStack.pop()

    if (Array.isArray(node.body)) {
      this.parentNodeStack.push({
        parent: node,
        property: "body",
      })
      node.body.forEach((child) => {
        this.walkStatement(child)
      })
      this.parentNodeStack.pop()
    } else {
      this.parentNodeStack.push({
        parent: node,
        property: "body",
      })
      this.walkExpression(node.body)
      this.parentNodeStack.pop()
    }
  }

  private walkComponent(node: ComponentNode) {
    this.callback(node, this.currentParentNode())

    this.parentNodeStack.push({
      parent: node,
      property: "props",
    })
    node.props?.forEach((child) => {
      this.walkPropDeclaration(child)
    })
    this.parentNodeStack.pop()

    this.parentNodeStack.push({
      parent: node,
      property: "body",
    })
    node.body.forEach((child) => {
      this.walkStatement(child)
    })
    this.parentNodeStack.pop()
  }

  private walkPropDeclaration(node: UIPropDeclaration) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "value",
    })

    this.walkExpression(node.value)

    this.parentNodeStack.pop()
  }

  private walkUIFragment(node: UIFragmentNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "children",
    })

    node.children?.forEach((child) => {
      this.walkUI(child)
    })

    this.parentNodeStack.pop()
  }

  private walkUIText(node: UITextNode) {
    this.callback(node, this.currentParentNode())
  }

  private walkNAryExpression(node: NAryExpression) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "args",
    })

    node.args.forEach((child) => {
      this.walkExpression(child)
    })

    this.parentNodeStack.pop()
  }

  private walkIfStatement(node: IfStatementNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "test",
    })
    this.walkExpression(node.test)
    this.parentNodeStack.pop()

    this.parentNodeStack.push({
      parent: node,
      property: "then",
    })
    node.then.forEach((child) => {
      this.walkStatement(child)
    })
    this.parentNodeStack.pop()

    this.parentNodeStack.push({
      parent: node,
      property: "elseIf",
    })
    node.elseIf?.forEach((child) => {
      this.walkElseIfStatement(child)
    })
    this.parentNodeStack.pop()

    this.parentNodeStack.push({
      parent: node,
      property: "else",
    })
    node.else?.forEach((child) => {
      this.walkStatement(child)
    })
    this.parentNodeStack.pop()
  }

  private walkElseIfStatement(node: ElseIfNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "test",
    })

    this.walkExpression(node.test)

    node.then.forEach((child) => {
      this.walkStatement(child)
    })

    this.parentNodeStack.pop()
  }

  private walkUnaryExpression(node: UnaryExpressionNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push({
      parent: node,
      property: "arg",
    })

    this.walkExpression(node.arg)

    this.parentNodeStack.pop()
  }
}
