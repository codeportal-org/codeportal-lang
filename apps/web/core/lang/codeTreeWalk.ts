import {
  CodeNode,
  ComponentNode,
  ExpressionNode,
  FunctionCallNode,
  FunctionNode,
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
  VarStatement,
} from "./interpreter"

export class CodeTreeWalk {
  parentNodeStack: CodeNode[] = []
  callback: (node: CodeNode, parent: CodeNode | undefined) => void = () => {}

  reset() {
    this.parentNodeStack = []
    this.callback = () => {}
  }

  full(code: ProgramNode, callback: (node: CodeNode, parent: CodeNode | undefined) => void) {
    this.callback = callback
    if (code.type === "program") {
      this.walkProgram(code)
    }

    this.reset()
  }

  private currentParentNode(): CodeNode | undefined {
    return this.parentNodeStack[this.parentNodeStack.length - 1]
  }

  private walkProgram(node: ProgramNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

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
    } else if (node.type === "function") {
      this.walkFunctionDeclaration(node)
    } else if (node.type === "component") {
      this.walkComponent(node)
    } else if (node.type === "function call") {
      this.walkFunctionCall(node)
    } else if (node.type === "state") {
      this.walkStateDeclaration(node)
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
    this.parentNodeStack.push(node)

    this.walkExpression(node.expression)

    this.parentNodeStack.pop()
  }

  private walkUIElement(node: UIElementNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

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
    this.parentNodeStack.push(node)

    this.walkExpression(node.value)

    this.parentNodeStack.pop()
  }

  private walkUISpreadPropNode(node: UISpreadPropNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

    this.walkExpression(node.arg)

    this.parentNodeStack.pop()
  }

  private walkReturnStatement(code: ReturnStatementNode) {
    this.callback(code, this.currentParentNode())
    this.parentNodeStack.push(code)

    this.walkExpression(code.arg)

    this.parentNodeStack.pop()
  }

  private walkVariableDeclaration(code: VarStatement) {
    this.callback(code, this.currentParentNode())
    this.parentNodeStack.push(code)

    this.walkExpression(code.value)

    this.parentNodeStack.pop()
  }

  private walkFunctionDeclaration(node: FunctionNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

    node.body.forEach((child) => {
      this.walkStatement(child)
    })

    this.parentNodeStack.pop()
  }

  private walkFunctionCall(node: FunctionCallNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

    if (node.callee.type === "path access") {
      this.walkPathAccess(node.callee)
    } else if (node.callee.type === "ref") {
      this.walkRef(node.callee)
    }

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
    this.parentNodeStack.push(node)

    node.path.forEach((child) => {
      this.walkExpression(child)
    })

    this.parentNodeStack.pop()
  }

  private walkStateDeclaration(node: StateStatement) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

    this.walkExpression(node.value)

    this.parentNodeStack.pop()
  }

  private walkStateChangeDeclaration(node: StateChangeNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

    this.walkRef(node.state)

    if (Array.isArray(node.body)) {
      node.body.forEach((child) => {
        this.walkStatement(child)
      })
    } else {
      this.walkExpression(node.body)
    }

    this.parentNodeStack.pop()
  }

  private walkComponent(node: ComponentNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

    node.props?.forEach((child) => {
      this.walkPropDeclaration(child)
    })

    node.body.forEach((child) => {
      this.walkStatement(child)
    })

    this.parentNodeStack.pop()
  }

  private walkPropDeclaration(node: UIPropDeclaration) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

    this.walkExpression(node.value)

    this.parentNodeStack.pop()
  }

  private walkUIFragment(node: UIFragmentNode) {
    this.callback(node, this.currentParentNode())
    this.parentNodeStack.push(node)

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
    this.parentNodeStack.push(node)

    node.args.forEach((child) => {
      this.walkExpression(child)
    })

    this.parentNodeStack.pop()
  }
}
