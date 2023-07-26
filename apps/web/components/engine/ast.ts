type ID = string

export type Block = {
  id: ID
  name: BlockName
  refs: Record<string, any>
  data: Record<string, any>
  state: Record<string, any>
  def: BlockDefinition
}

export const BlockName = {
  project: "project",
  app: "app",
  module: "module",
  section: "section",
  function: "function",
  emptyExpression: "empty expression",
  emptyStatement: "empty statement",
  number: "number",
  text: "text",
  ifStatement: "if statement",
} as const

export type BlockName = (typeof BlockName)[keyof typeof BlockName]

/** Data structures */

export const BlockType = {
  declaration: "declaration",
  expression: "expression",
  statement: "statement",
} as const

export type BlockType = (typeof BlockType)[keyof typeof BlockType]

const TypeCheck = {
  boolean: "boolean",
} as const

type TypeCheck = (typeof TypeCheck)[keyof typeof TypeCheck]

type Part =
  | {
      /** Each group is a line that can be flex wrapped */
      type: "group"
      parts: SubPart[]
    }
  | {
      /** Same as a group but can mutate the shape of the block */
      type: "dynamic group"
      name: string
      parts: SubPart[]
    }
  | {
      /** The last group in a block, ej: the "else" in an if-statement */
      type: "terminal group"
      parts: SubPart[]
    }

type SubPart =
  | {
      type: "subgroup"
      parts: SubPart[]
    }
  | {
      type: "keyword"
      spaceRight?: boolean
      text: string
    }
  | {
      type: "name"
      name: string
      placeholder?: string
    }
  | {
      type: "expression"
      name: string
      check?: TypeCheck
    }
  | {
      type: "text input"
      name: string
    }
  | {
      type: "number input"
      name: string
    }
  | {
      type: "statement list"
      name: string
    }
  | {
      type: "declaration list"
      name: string
    }
  | {
      type: "empty expression"
    }
  | {
      type: "empty statement"
    }

export type BlockDefinition = {
  id?: string
  name: BlockName
  description: string
  type: BlockType
  inline?: boolean
  parts: Part[]
}
