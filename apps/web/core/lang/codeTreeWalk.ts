import {
  CodeNode,
  ComponentNode,
  ExpressionNode,
  FunctionCallNode,
  FunctionNode,
  LiteralNode,
  PathAccessNode,
  ProgramNode,
  ReferenceNode,
  ReturnStatementNode,
  StateStatement,
  StatementNode,
  UIElementNode,
  UINode,
  UIPropDeclaration,
  UIPropNode,
  VarStatement,
} from "./interpreter"

export class CodeTreeWalk {
  currentNode: CodeNode | undefined = undefined
  callback: (node: CodeNode, parent: CodeNode | undefined) => void = () => {}

  full(code: ProgramNode, callback: (node: CodeNode, parent: CodeNode | undefined) => void) {
    this.callback = callback
    if (code.type === "program") {
      this.walkProgram(code)
    }
  }

  private walkProgram(code: ProgramNode) {
    this.callback(code, undefined)
    this.currentNode = code

    code.body.forEach((child) => {
      this.walkStatement(child)
    })
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
    } else if (
      node.type === "ui element" ||
      node.type === "ui fragment" ||
      node.type === "ui text"
    ) {
      this.walkUI(node)
    }
  }

  private walkLiteral(node: LiteralNode) {
    this.callback(node, this.currentNode)
    this.currentNode = node
  }

  private walkUI(code: UINode) {
    // router function, do not call callback here

    if (code.type === "ui expression") {
      this.walkExpression(code)
    } else if (code.type === "ui element") {
      this.walkUIElement(code)
    }
  }

  private walkUIElement(code: UIElementNode) {
    this.callback(code, this.currentNode)
    this.currentNode = code

    code.props?.forEach((child) => {
      this.walkUIPropNode(child)
    })

    code.children?.forEach((child) => {
      this.walkUI(child)
    })
  }

  private walkUIPropNode(node: UIPropNode) {
    this.callback(node, this.currentNode)
    this.currentNode = node

    this.walkExpression(node.value)
  }

  private walkReturnStatement(code: ReturnStatementNode) {
    this.callback(code, this.currentNode)
    this.currentNode = code

    this.walkExpression(code.arg)
  }

  private walkVariableDeclaration(code: VarStatement) {
    this.callback(code, this.currentNode)
    this.currentNode = code

    this.walkExpression(code.value)
  }

  private walkFunctionDeclaration(node: FunctionNode) {
    this.callback(node, this.currentNode)
    this.currentNode = node

    node.body.forEach((child) => {
      this.walkStatement(child)
    })
  }

  private walkFunctionCall(node: FunctionCallNode) {
    this.callback(node, this.currentNode)
    this.currentNode = node

    if (node.callee.type === "path access") {
      this.walkPathAccess(node.callee)
    } else if (node.callee.type === "ref") {
      this.walkRef(node.callee)
    }

    node.args.forEach((child) => {
      this.walkExpression(child)
    })
  }

  private walkRef(node: ReferenceNode) {
    this.callback(node, this.currentNode)
    this.currentNode = node
  }

  private walkPathAccess(node: PathAccessNode) {
    this.callback(node, this.currentNode)
    this.currentNode = node

    node.path.forEach((child) => {
      this.walkExpression(child)
    })
  }

  private walkStateDeclaration(node: StateStatement) {
    this.callback(node, this.currentNode)
    this.currentNode = node

    this.walkExpression(node.value)
  }

  private walkComponent(node: ComponentNode) {
    this.callback(node, this.currentNode)
    this.currentNode = node

    node.props?.forEach((child) => {
      this.walkPropDeclaration(child)
    })

    node.body.forEach((child) => {
      this.walkStatement(child)
    })
  }

  private walkPropDeclaration(node: UIPropDeclaration) {
    this.callback(node, this.currentNode)
    this.currentNode = node

    this.walkExpression(node.value)
  }
}
