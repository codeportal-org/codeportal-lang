/**
 * Examples of PortalLang Code Trees (ASTs) to give GPT
 */

const ifStatement = {
  type: "IfStatement",
  condition: {
    type: "BinaryExpression",
    operator: ">",
    left: {
      type: "Reference",
      name: "x",
    },
    right: {
      type: "NumberLiteral",
      value: 10,
    },
  },
  then: {
    type: "StatementList",
    body: [
      {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: {
            type: "Reference",
            name: "print",
          },
          arguments: [
            {
              paramId: "@param/0",
              type: "StringLiteral",
              value: "x is greater than 10",
            },
          ],
        },
      },
    ],
  },
}
