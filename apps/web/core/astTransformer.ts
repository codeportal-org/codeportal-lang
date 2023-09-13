import acorn from "acorn"

import { ComponentNode, FunctionNode, ProgramNode, Statement } from "./interpreter"

/**
 * Transforms the JS AST (ESTree) format into Portal Code Tree format.
 */
export class ASTtoCTTransformer {
  componentMode = false

  transform(node: any) {
    this.componentMode = false

    if (node.type === "Program") {
      return this.transformProgram(node)
    }
  }

  transformProgram(node: any): ProgramNode {
    const programNode: ProgramNode = {
      type: "program",
      body: [],
    }

    for (const statement of node.body) {
      if (statement.type === "FunctionDeclaration") {
        // see if it is a React component
        const statements = statement.body.body
        const lastStatement = statements[statements.length - 1]
        if (
          lastStatement.type === "ReturnStatement" &&
          lastStatement.argument.type === "JSXElement"
        ) {
          programNode.body.push(this.transformComponent(statement))
        } else {
          programNode.body.push(this.transformFunctionDeclaration(statement))
        }
      }
    }

    return programNode
  }

  transformComponent(node: any): ComponentNode {
    let componentNode: ComponentNode = {
      type: "component",
      name: node.id.name,
      body: [],
    }

    this.componentMode = true

    for (const statement of node.body.body) {
      componentNode.body.push(this.transformStatement(statement))
    }

    return componentNode
  }

  transformFunctionDeclaration(node: any): FunctionNode {
    const functionNode: FunctionNode = {
      type: "function",
      name: node.id.name,
      params: node.params.map((param: any) => param.name),
      body: [],
    }

    for (const statement of node.body.body) {
      functionNode.body.push(this.transformStatement(statement))
    }

    return functionNode
  }

  transformStatement(node: any): Statement | any {
    if (node.type === "VariableDeclaration") {
      return this.transformVariableDeclaration(node)
    } else if (node.type === "ReturnStatement") {
      return this.transformReturnStatement(node)
    } else {
      // throw new Error(`Unknown statement type: ${node.type}`)
    }
  }

  transformVariableDeclaration(node: any): any {
    // pattern matching React state
    if (this.componentMode) {
      if (
        node.declarations[0].init.type === "CallExpression" &&
        node.declarations[0].init.callee.object?.name === "React" &&
        node.declarations[0].init.callee.property?.name === "useState"
      ) {
        return {
          type: "state",
          name: node.declarations[0].id.elements[0].name,
          value: this.transformExpression(node.declarations[0].init.arguments[0]),
        }
      }
    }

    // transform arrow functions into regular functions
    if (node.declarations[0].init.type === "ArrowFunctionExpression") {
      const functionNode: FunctionNode = {
        type: "function",
        name: node.declarations[0].id.name,
        params: node.declarations[0].init.params.map((param: any) => param.name),
        body: [],
      }

      for (const statement of node.declarations[0].init.body.body) {
        functionNode.body.push(this.transformStatement(statement))
      }

      return functionNode
    }

    return {
      type: "var",
      name: this.transformExpression(node.declarations[0].id),
      value: this.transformExpression(node.declarations[0].init),
    }
  }

  transformReturnStatement(node: any): any {
    return {
      type: "return",
      arg: this.transformExpression(node.argument),
    }
  }

  transformExpression(node: any) {
    if (node.type === "Identifier") {
      return node.name
    } else if (node.type === "BinaryExpression") {
      return this.transformBinaryExpression(node)
    } else if (node.type === "Literal") {
      return this.transformLiteral(node)
    }
  }

  transformLiteral(node: any): any {
    return {
      type: typeof node.value,
      value: node.value,
    }
  }

  transformBinaryExpression(node: any): any {
    return {
      type: "binary expression",
      operator: node.operator,
      left: this.transformExpression(node.left),
      right: this.transformExpression(node.right),
    }
  }
}
