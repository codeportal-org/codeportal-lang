import { Parser } from "acorn"
import acornJSXParser from "acorn-jsx"

import { ASTtoCTTransformer } from "../astTransformer"
import { ProgramNode } from "../codeTree"

const JSXParser = Parser.extend(acornJSXParser())

export function importJS(code: string): ProgramNode | undefined {
  const astTransformer = new ASTtoCTTransformer()

  let ast: any
  try {
    ast = JSXParser.parse(code, { ecmaVersion: "latest" })
  } catch (e) {
    console.log(e)
  }

  const codeTree = astTransformer.transform(ast)

  return codeTree
}
