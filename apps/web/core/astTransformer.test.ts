import { exampleAst } from "./astJS"
import { ASTtoCTTransformer } from "./astTransformer"

describe("astTransformer", () => {
  //   it("should be defined", () => {
  //     const transformer = new ASTtoCTTransformer()

  //     const codeTree = transformer.transform(exampleAst)

  //     expect(codeTree).toBe({})
  //   })

  it("should transform a program", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform({
      type: "Program",
      body: [],
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      body: [],
    })
  })

  it("should transform a program with a function declaration", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform({
      type: "Program",
      body: [
        {
          type: "FunctionDeclaration",
          id: {
            type: "Identifier",
            name: "App",
          },
          body: {
            type: "BlockStatement",
            body: [],
          },
        },
      ],
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      body: [
        {
          type: "component",
          name: "App",
          body: [],
        },
      ],
    })
  })

  it("should transform a program with a function declaration with a return statement", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform({
      type: "Program",
      body: [
        {
          type: "FunctionDeclaration",
          id: {
            type: "Identifier",
            name: "App",
          },
          body: {
            type: "BlockStatement",
            body: [
              {
                type: "ReturnStatement",
                argument: {
                  type: "Literal",
                  value: "Hello, World!",
                },
              },
            ],
          },
        },
      ],
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      body: [
        {
          type: "component",
          name: "App",
          body: [
            {
              type: "return",
              arg: {
                type: "string",
                value: "Hello, World!",
              },
            },
          ],
        },
      ],
    })
  })
})
