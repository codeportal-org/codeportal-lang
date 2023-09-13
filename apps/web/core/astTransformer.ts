import acorn from "acorn"

import { ComponentNode, FunctionNode, ProgramNode, Statement } from "./interpreter"

/**
 * Transforms the JS AST (ESTree) format into Portal Code Tree format.
 */
export class ASTtoCTTransformer {
  transform(ast: any) {
    if (ast.type === "Program") {
      return this.transformProgram(ast)
    }
  }

  transformProgram(ast: any): ProgramNode {
    const programNode: ProgramNode = {
      type: "program",
      body: [],
    }

    for (const statement of ast.body) {
      if (statement.type === "FunctionDeclaration" && statement.id.name === "App") {
        programNode.body.push(this.transformAppFunction(statement))
      }
    }

    return programNode
  }

  transformAppFunction(ast: any): ComponentNode {
    let componentNode: ComponentNode = {
      type: "component",
      name: "App",
      body: [],
    }

    for (const statement of ast.body.body) {
      componentNode.body.push(this.transformStatement(statement))
    }

    return componentNode
  }

  transformFunctionDeclaration(ast: any): FunctionNode {
    const functionNode: FunctionNode = {
      type: "function",
      name: ast.id.name,
      params: ast.params.map((param: any) => param.name),
      body: [],
    }

    for (const statement of ast.body.body) {
      functionNode.body.push(this.transformStatement(statement))
    }

    return functionNode
  }

  transformStatement(ast: any): Statement {
    if (ast.type === "VariableDeclaration") {
      return this.transformVariableDeclaration(ast)
    } else if (ast.type === "ReturnStatement") {
      return this.transformReturnStatement(ast)
    } else {
      throw new Error(`Unknown statement type: ${ast.type}`)
    }
  }

  transformVariableDeclaration(ast: any): any {
    return {
      type: "var",
      name: ast.declarations[0].id.name,
      value: ast.declarations[0].init.value,
    }
  }

  transformReturnStatement(ast: any): any {
    return {
      type: "return",
      arg: this.transformExpression(ast.argument),
    }
  }

  transformExpression(ast: any) {
    if (ast.type === "BinaryExpression") {
      return this.transformBinaryExpression(ast)
    } else if (ast.type === "Literal") {
      return this.transformLiteral(ast)
    }
  }

  transformLiteral(ast: any): any {
    return {
      type: typeof ast.value,
      value: ast.value,
    }
  }

  transformBinaryExpression(ast: any): any {
    return {
      type: "binary expression",
      operator: ast.operator,
      left: this.transformExpression(ast.left),
      right: this.transformExpression(ast.right),
    }
  }
}
