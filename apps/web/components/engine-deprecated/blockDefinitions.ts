import { BlockDefinition, BlockName } from "./ast"

/** Definitions */

let blockDefinitions: BlockDefinition[] = [
  {
    name: BlockName.project,
    type: "declaration",
    description: "A project is a set of related apps and modules.",
    parts: [
      {
        type: "group",
        parts: [
          {
            name: "declarations",
            type: "declaration list",
          },
        ],
      },
    ],
  },
  {
    name: BlockName.app,
    type: "declaration",
    description: "An app is a piece of software intended to be independently launched.",
    parts: [
      {
        type: "group",
        parts: [
          {
            name: "statements",
            type: "statement list",
          },
        ],
      },
    ],
  },
  {
    name: BlockName.module,
    type: "declaration",
    description:
      "A module is a group of related functionality. Modules allow logical grouping and reuse.",
    parts: [
      {
        type: "group",
        parts: [
          {
            name: "statements",
            type: "statement list",
          },
        ],
      },
    ],
  },
  {
    name: BlockName.section,
    type: "statement",
    description:
      "A sections is a way to divide your code without having to extract it as a function or action which are meant to be reusable pieces.",
    parts: [
      {
        type: "group",
        parts: [
          {
            type: "name",
            name: "name",
            placeholder: "name your section here!",
          },
          {
            name: "statements",
            type: "statement list",
          },
        ],
      },
      {
        type: "group",
        parts: [
          {
            name: "statements",
            type: "statement list",
          },
        ],
      },
    ],
  },
  {
    name: BlockName.emptyExpression,
    type: "expression",
    inline: true,
    description: "This block represents and empty expression",
    parts: [
      {
        type: "group",
        parts: [
          {
            type: "empty expression",
          },
        ],
      },
    ],
  },
  {
    name: BlockName.emptyStatement,
    type: "statement",
    description: "This block represents and empty statement",
    parts: [
      {
        type: "group",
        parts: [
          {
            type: "empty statement",
          },
        ],
      },
    ],
  },
  {
    name: BlockName.number,
    type: "expression",
    inline: true,
    description: "This block lets you hold numbers",
    parts: [
      {
        type: "group",
        parts: [
          {
            name: "value",
            type: "number input",
          },
        ],
      },
    ],
  },
  {
    name: BlockName.text,
    type: "expression",
    description: "This block lets you hold text",
    inline: true,
    parts: [
      {
        type: "group",
        parts: [
          {
            name: "value",
            type: "text input",
          },
        ],
      },
    ],
  },
  {
    name: BlockName.ifStatement,
    type: "statement",
    description:
      "Conditional block (if, if-else). This block lets you control the flow of your program based on certain conditions",
    parts: [
      {
        type: "group",
        parts: [
          {
            type: "keyword",
            text: "if",
            spaceRight: true,
          },
          {
            name: "condition",
            type: "expression",
            check: "boolean",
          },
        ],
      },
      {
        type: "group",
        parts: [
          {
            name: "then",
            type: "statement list",
          },
        ],
      },
      {
        name: "elseIf",
        type: "dynamic group",
        parts: [
          {
            text: "else if",
            type: "keyword",
          },
          {
            name: "condition",
            type: "expression",
          },
          {
            type: "statement list",
            name: "statements",
          },
        ],
      },
      {
        type: "terminal group",
        parts: [
          {
            text: "else",
            type: "keyword",
          },
          {
            type: "statement list",
            name: "else",
          },
        ],
      },
    ],
  },
]

blockDefinitions = blockDefinitions.map((def) => ({ ...def, id: `core/${def.name}` }))

export const blockDefinition = blockDefinitions.reduce(
  (prev, current) => ({ ...prev, [current.name]: current }),
  {},
) as Record<BlockName, BlockDefinition>

export const blockDefinitionsNoEmpty = blockDefinitions.filter(
  (def) => def.name !== "empty expression" && def.name !== "empty statement",
)
