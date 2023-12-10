import { Parser } from "acorn"
import acornJSXParser from "acorn-jsx"
import { writeFileSync } from "fs"

import { ASTtoCTTransformer, collapseWhitespace } from "./astTransformer"
import { ProgramNode } from "./codeTree"

describe("collapseWhitespace", () => {
  it("should collapse whitespace", () => {
    const withWhitespace = `\n     Text    with   \t \n\n whitespace \n\n\n`
    const withoutWhitespace = ` Text with whitespace `

    expect(collapseWhitespace(withWhitespace)).toBe(withoutWhitespace)
  })
})

describe("ASTtoCTTransformer - astTransformer", () => {
  it("should transform a program", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform({
      type: "Program",
      body: [],
      sourceType: "module",
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 1,
      body: [],
    } satisfies ProgramNode)
  })

  it("should transform a program with a React component declaration", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
      function App() {
        return <div></div>
      }
    `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 4,
      body: [
        {
          type: "component",
          id: "1",
          name: "App",
          body: [
            {
              type: "return",
              id: "2",
              arg: {
                type: "ui element",
                id: "3",
                name: "div",
                props: [],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform a program with a function declaration with a return statement", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
        function myFunc() {
          return "Hello, World!";
        }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 4,
      body: [
        {
          type: "function",
          id: "1",
          name: "myFunc",
          params: [],
          body: [
            {
              type: "return",
              id: "2",
              arg: {
                type: "string",
                id: "3",
                value: "Hello, World!",
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform a program with a React component and a lot of JSX and collapse whitespace", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function App() {
            return (
              <div>
                <h1>Hello, World!</h1>
                <p>This is a paragraph</p>
                <ul>
                  <li>
                    This   is a list item
                  </li>
                </ul>
              </div>
            );
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 11,
      body: [
        {
          type: "component",
          id: "1",
          name: "App",
          body: [
            {
              type: "return",
              id: "2",
              arg: {
                type: "ui element",
                id: "3",
                name: "div",
                props: [],
                children: [
                  {
                    type: "ui element",
                    id: "4",
                    name: "h1",
                    props: [],
                    children: [
                      {
                        type: "ui text",
                        id: "5",
                        text: "Hello, World!",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "6",
                    name: "p",
                    props: [],
                    children: [
                      {
                        type: "ui text",
                        id: "7",
                        text: "This is a paragraph",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "8",
                    name: "ul",
                    props: [],
                    children: [
                      {
                        type: "ui element",
                        id: "9",
                        name: "li",
                        props: [],
                        children: [
                          {
                            type: "ui text",
                            id: "10",
                            text: " This is a list item ",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform a program with a variable and function declarations and references and resolve the references", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function myFunc() {
            let x = 0

            if (false) {
              myFunc()
            }

            return x
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 10,
      body: [
        {
          type: "function",
          id: "1",
          name: "myFunc",
          params: [],
          body: [
            {
              type: "var",
              id: "2",
              name: "x",
              value: {
                type: "number",
                id: "3",
                value: 0,
              },
            },
            {
              type: "if",
              id: "4",
              test: {
                type: "boolean",
                id: "5",
                value: false,
              },
              then: [
                {
                  type: "function call",
                  id: "6",
                  callee: {
                    type: "ref",
                    id: "7",
                    refId: "1",
                  },
                  args: [],
                },
              ],
            },
            {
              type: "return",
              id: "8",
              arg: {
                type: "ref",
                id: "9",
                refId: "2",
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should detect and transform the use of React.useState", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function App() {
            const [state, setState] = React.useState("initial state")

            return (
              <div>
                <h1>React State Transform</h1>
              </div>
            );
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 8,
      body: [
        {
          type: "component",
          id: "1",
          name: "App",
          body: [
            {
              type: "state",
              id: "2",
              name: "state",
              value: {
                type: "string",
                id: "3",
                value: "initial state",
              },
            },
            {
              type: "return",
              id: "4",
              arg: {
                type: "ui element",
                id: "5",
                name: "div",
                props: [],
                children: [
                  {
                    type: "ui element",
                    id: "6",
                    name: "h1",
                    props: [],
                    children: [
                      {
                        type: "ui text",
                        id: "7",
                        text: "React State Transform",
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform the use of JSX expressions", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function App() {
            const message = "Hello, World!"

            return (
              <div>
                <h1>{message}</h1>
              </div>
            );
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 9,
      body: [
        {
          type: "component",
          id: "1",
          name: "App",
          body: [
            {
              type: "var",
              id: "2",
              name: "message",
              value: {
                type: "string",
                id: "3",
                value: "Hello, World!",
              },
            },
            {
              type: "return",
              id: "4",
              arg: {
                type: "ui element",
                id: "5",
                name: "div",
                props: [],
                children: [
                  {
                    type: "ui element",
                    id: "6",
                    name: "h1",
                    props: [],
                    children: [
                      {
                        type: "ui expression",
                        id: "7",
                        expression: {
                          type: "ref",
                          id: "8",
                          refId: "2",
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should throw an error if a variable declaration has multiple declarators", () => {
    const transformer = new ASTtoCTTransformer()

    expect(() => {
      transformer.transform(
        Parser.extend(acornJSXParser()).parse(
          `
            function App() {
              const message = "Hello, World!", name = "John Doe"

              return (
                <div>
                  <h1>{message}</h1>
                </div>
              );
            }
          `,
          { ecmaVersion: "latest" },
        ) as any,
      )
    }).toThrow()
  })

  it("should transform a program with MemberExpression like obj.value", () => {
    const transformer = new ASTtoCTTransformer()

    transformer.addGlobal("obj", "<obj-id>")

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          obj.value = 0
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 6,
      body: [
        {
          type: "assignment",
          id: "1",
          operator: "=",
          left: {
            type: "path access",
            id: "2",
            path: [
              {
                type: "ref",
                id: "4",
                refId: "<obj-id>",
              },
              {
                type: "string",
                id: "3",
                value: "value",
              },
            ],
          },
          right: {
            type: "number",
            id: "5",
            value: 0,
          },
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform a program with an ObjectExpression like { value: 0 }", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          const obj = { value: 0 }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 6,
      body: [
        {
          type: "var",
          id: "1",
          name: "obj",
          value: {
            type: "object",
            id: "2",
            props: [
              {
                type: "property",
                id: "3",
                name: {
                  type: "string",
                  id: "4",
                  value: "value",
                },
                value: {
                  type: "number",
                  id: "5",
                  value: 0,
                },
              },
            ],
          },
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform a program with a TryStatement, and the ", () => {
    const transformer = new ASTtoCTTransformer()

    transformer.addGlobal("log", "<log>")

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          try {
            var num1 = 2
          } catch (error) {
            var num2 = 3
            log(error)
          } finally {
            var num3 = 1
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 12,
      body: [
        {
          type: "try",
          id: "1",
          body: [
            {
              type: "var",
              id: "2",
              name: "num1",
              value: {
                type: "number",
                id: "3",
                value: 2,
              },
            },
          ],
          catchParam: {
            type: "param",
            id: "4",
            name: "error",
          },
          catch: [
            {
              type: "var",
              id: "5",
              name: "num2",
              value: {
                type: "number",
                id: "6",
                value: 3,
              },
            },
            {
              type: "function call",
              id: "7",
              callee: {
                type: "ref",
                id: "8",
                refId: "<log>",
              },
              args: [
                {
                  type: "ref",
                  id: "9",
                  refId: "4",
                },
              ],
            },
          ],
          finally: [
            {
              type: "var",
              id: "10",
              name: "num3",
              value: {
                type: "number",
                id: "11",
                value: 1,
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform arrow functions", () => {
    const transformer = new ASTtoCTTransformer()

    transformer.addGlobal("setFn", "<setFn>")

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          setFn((a, b) => b)
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 8,
      body: [
        {
          type: "function call",
          id: "1",
          callee: {
            type: "ref",
            id: "2",
            refId: "<setFn>",
          },
          args: [
            {
              type: "function",
              id: "3",
              params: [
                {
                  type: "param",
                  id: "4",
                  name: "a",
                },
                {
                  type: "param",
                  id: "5",
                  name: "b",
                },
              ],
              body: [
                {
                  type: "return",
                  id: "6",
                  arg: {
                    type: "ref",
                    id: "7",
                    refId: "5",
                  },
                },
              ],
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform arrow functions with a variable declaration into named functions", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          const myFunc = (a, b) => a + b
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 8,
      body: [
        {
          type: "function",
          id: "1",
          name: "myFunc",
          params: [
            {
              type: "param",
              id: "2",
              name: "a",
            },
            {
              type: "param",
              id: "3",
              name: "b",
            },
          ],
          body: [
            {
              type: "return",
              id: "4",
              arg: {
                type: "nary",
                id: "5",
                operators: ["+"],
                args: [
                  {
                    type: "ref",
                    id: "7",
                    refId: "2",
                  },
                  {
                    type: "ref",
                    id: "6",
                    refId: "3",
                  },
                ],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform a component with JSX elements with props", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function Comp() {
            return (
              <div className="class1 class2">Hello</div>
            );
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 7,
      body: [
        {
          type: "component",
          id: "1",
          name: "Comp",
          body: [
            {
              type: "return",
              id: "2",
              arg: {
                type: "ui element",
                id: "3",
                name: "div",
                props: [
                  {
                    type: "ui prop",
                    id: "4",
                    name: "className",
                    value: {
                      type: "string",
                      id: "5",
                      value: "class1 class2",
                    },
                  },
                ],
                children: [
                  {
                    type: "ui text",
                    id: "6",
                    text: "Hello",
                  },
                ],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform a function with an if-else statement", () => {
    const transformer = new ASTtoCTTransformer()

    transformer.addGlobal("setFn", "<setFn>")

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function myFunc(a, b) {
            if (a === b) {
              setFn()
            } else {
              let c = 0
            }
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 12,
      body: [
        {
          type: "function",
          id: "1",
          name: "myFunc",
          params: [
            {
              type: "param",
              id: "2",
              name: "a",
            },
            {
              type: "param",
              id: "3",
              name: "b",
            },
          ],
          body: [
            {
              type: "if",
              id: "4",
              test: {
                type: "nary",
                id: "5",
                operators: ["=="],
                args: [
                  {
                    type: "ref",
                    id: "7",
                    refId: "2",
                  },
                  {
                    type: "ref",
                    id: "6",
                    refId: "3",
                  },
                ],
              },
              then: [
                {
                  type: "function call",
                  id: "8",
                  callee: {
                    type: "ref",
                    id: "9",
                    refId: "<setFn>",
                  },
                  args: [],
                },
              ],
              else: [
                {
                  type: "var",
                  id: "10",
                  name: "c",
                  value: {
                    type: "number",
                    id: "11",
                    value: 0,
                  },
                },
              ],
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should throw an error if array destructuring (ArrayPattern) is used in a variable declaration", () => {
    const transformer = new ASTtoCTTransformer()

    expect(() => {
      transformer.transform(
        Parser.extend(acornJSXParser()).parse(
          `
            const [a, b] = [1, 2]
          `,
          { ecmaVersion: "latest" },
        ) as any,
      )
    }).toThrow()
  })

  it("should throw an error if object destructuring (ObjectPattern) is used in a variable declaration", () => {
    const transformer = new ASTtoCTTransformer()

    expect(() => {
      transformer.transform(
        Parser.extend(acornJSXParser()).parse(
          `
            const { a, b } = { a: 1, b: 2 }
          `,
          { ecmaVersion: "latest" },
        ) as any,
      )
    }).toThrow()
  })

  it("should transform a function with an if-elseif-else chain", () => {
    const transformer = new ASTtoCTTransformer()

    transformer.addGlobal("setFn", "<setFn>")

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function myFunc(a, b) {
            if (a === b) {
              setFn()
            } else if (a > b) {
              let x = 1
            } else if (a < b) {
              let y = 2
            } else {
              let c = 0
            }
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 24,
      body: [
        {
          type: "function",
          id: "1",
          name: "myFunc",
          params: [
            {
              type: "param",
              id: "2",
              name: "a",
            },
            {
              type: "param",
              id: "3",
              name: "b",
            },
          ],
          body: [
            {
              type: "if",
              id: "4",
              test: {
                type: "nary",
                id: "5",
                operators: ["=="],
                args: [
                  {
                    type: "ref",
                    id: "7",
                    refId: "2",
                  },
                  {
                    type: "ref",
                    id: "6",
                    refId: "3",
                  },
                ],
              },
              then: [
                {
                  type: "function call",
                  id: "8",
                  callee: {
                    type: "ref",
                    id: "9",
                    refId: "<setFn>",
                  },
                  args: [],
                },
              ],
              elseIf: [
                {
                  type: "else if",
                  id: "10",
                  test: {
                    type: "nary",
                    id: "11",
                    operators: [">"],
                    args: [
                      {
                        type: "ref",
                        id: "13",
                        refId: "2",
                      },
                      {
                        type: "ref",
                        id: "12",
                        refId: "3",
                      },
                    ],
                  },
                  then: [
                    {
                      type: "var",
                      id: "14",
                      name: "x",
                      value: {
                        type: "number",
                        id: "15",
                        value: 1,
                      },
                    },
                  ],
                },
                {
                  type: "else if",
                  id: "16",
                  test: {
                    type: "nary",
                    id: "17",
                    operators: ["<"],
                    args: [
                      {
                        type: "ref",
                        id: "19",
                        refId: "2",
                      },
                      {
                        type: "ref",
                        id: "18",
                        refId: "3",
                      },
                    ],
                  },
                  then: [
                    {
                      type: "var",
                      id: "20",
                      name: "y",
                      value: {
                        type: "number",
                        id: "21",
                        value: 2,
                      },
                    },
                  ],
                },
              ],
              else: [
                {
                  type: "var",
                  id: "22",
                  name: "c",
                  value: {
                    type: "number",
                    id: "23",
                    value: 0,
                  },
                },
              ],
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform a program that uses an async function and awaits values", () => {
    const transformer = new ASTtoCTTransformer()

    transformer.addGlobal("fetch", "<fetch>")
    transformer.addGlobal("setName", "<setName>")
    transformer.addGlobal("JSON", "<JSON>")

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
        async function myFunc(name) {
          const response = await fetch("/api/data/form-submission", {
            method: "POST",
            body: JSON.stringify({ name }),
          })

          const data = await response.json()
          setName(data.name)
        }
      `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 31,
      body: [
        {
          type: "function",
          id: "1",
          name: "myFunc",
          params: [
            {
              type: "param",
              id: "2",
              name: "name",
            },
          ],
          body: [
            {
              type: "var",
              id: "3",
              name: "response",
              value: {
                type: "function call",
                id: "4",
                callee: {
                  type: "ref",
                  id: "5",
                  refId: "<fetch>",
                },
                args: [
                  {
                    type: "string",
                    id: "6",
                    value: "/api/data/form-submission",
                  },
                  {
                    type: "object",
                    id: "7",
                    props: [
                      {
                        type: "property",
                        id: "8",
                        name: {
                          type: "string",
                          id: "9",
                          value: "method",
                        },
                        value: {
                          type: "string",
                          id: "10",
                          value: "POST",
                        },
                      },
                      {
                        type: "property",
                        id: "11",
                        name: {
                          type: "string",
                          id: "12",
                          value: "body",
                        },
                        value: {
                          type: "function call",
                          id: "13",
                          callee: {
                            type: "path access",
                            id: "14",
                            path: [
                              {
                                type: "ref",
                                id: "16",
                                refId: "<JSON>",
                              },
                              {
                                type: "string",
                                id: "15",
                                value: "stringify",
                              },
                            ],
                          },
                          args: [
                            {
                              type: "object",
                              id: "17",
                              props: [
                                {
                                  type: "property",
                                  id: "18",
                                  name: {
                                    type: "string",
                                    id: "19",
                                    value: "name",
                                  },
                                  value: {
                                    type: "ref",
                                    id: "20",
                                    refId: "2",
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              type: "var",
              id: "21",
              name: "data",
              value: {
                type: "function call",
                id: "22",
                callee: {
                  type: "path access",
                  id: "23",
                  path: [
                    {
                      type: "ref",
                      id: "25",
                      refId: "3",
                    },
                    {
                      type: "string",
                      id: "24",
                      value: "json",
                    },
                  ],
                },
                args: [],
              },
            },
            {
              type: "function call",
              id: "26",
              callee: {
                type: "ref",
                id: "27",
                refId: "<setName>",
              },
              args: [
                {
                  type: "path access",
                  id: "28",
                  path: [
                    {
                      type: "ref",
                      id: "30",
                      refId: "21",
                    },
                    {
                      type: "string",
                      id: "29",
                      value: "name",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should transform an app with state changes", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function App() {
            const [count, setCount] = React.useState(0)

            return (
              <div>
                <button onClick={() => setCount((c) => c + 1)}>Increment</button>
                <button onClick={() => setCount((c) => c + 1)}>Increment</button>
                <button onClick={() => setCount(count + 1)}>Increment</button>
                <button onClick={() => setCount((c2) => c2 + 1)}>Increment</button>
                <button onClick={() => setCount(count + 1)}>Increment</button>
                <div>{count}</div>
              </div>
            )
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    // writeFileSync("./codeTree.ts", JSON.stringify(codeTree, null, 2))
    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 74,
      body: [
        {
          type: "component",
          id: "1",
          name: "App",
          body: [
            {
              type: "state",
              id: "2",
              name: "count",
              value: {
                type: "number",
                id: "3",
                value: 0,
              },
            },
            {
              type: "return",
              id: "4",
              arg: {
                type: "ui element",
                id: "5",
                name: "div",
                props: [],
                children: [
                  {
                    type: "ui element",
                    id: "6",
                    name: "button",
                    props: [
                      {
                        type: "ui prop",
                        id: "7",
                        name: "onClick",
                        value: {
                          type: "function",
                          id: "8",
                          params: [],
                          body: [
                            {
                              type: "return",
                              id: "9",
                              arg: {
                                type: "state change",
                                id: "16",
                                state: {
                                  type: "ref",
                                  id: "17",
                                  refId: "2",
                                },
                                body: [
                                  {
                                    type: "return",
                                    id: "12",
                                    arg: {
                                      type: "nary",
                                      id: "13",
                                      operators: ["+"],
                                      args: [
                                        {
                                          type: "ref",
                                          id: "15",
                                          refId: "2",
                                        },
                                        {
                                          type: "number",
                                          id: "14",
                                          value: 1,
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui text",
                        id: "18",
                        text: "Increment",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "19",
                    name: "button",
                    props: [
                      {
                        type: "ui prop",
                        id: "20",
                        name: "onClick",
                        value: {
                          type: "function",
                          id: "21",
                          params: [],
                          body: [
                            {
                              type: "return",
                              id: "22",
                              arg: {
                                type: "state change",
                                id: "29",
                                state: {
                                  type: "ref",
                                  id: "30",
                                  refId: "2",
                                },
                                body: [
                                  {
                                    type: "return",
                                    id: "25",
                                    arg: {
                                      type: "nary",
                                      id: "26",
                                      operators: ["+"],
                                      args: [
                                        {
                                          type: "ref",
                                          id: "28",
                                          refId: "2",
                                        },
                                        {
                                          type: "number",
                                          id: "27",
                                          value: 1,
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui text",
                        id: "31",
                        text: "Increment",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "32",
                    name: "button",
                    props: [
                      {
                        type: "ui prop",
                        id: "33",
                        name: "onClick",
                        value: {
                          type: "function",
                          id: "34",
                          params: [],
                          body: [
                            {
                              type: "return",
                              id: "35",
                              arg: {
                                type: "state change",
                                id: "42",
                                state: {
                                  type: "ref",
                                  id: "43",
                                  refId: "2",
                                },
                                body: [
                                  {
                                    type: "return",
                                    id: "38",
                                    arg: {
                                      type: "nary",
                                      id: "39",
                                      operators: ["+"],
                                      args: [
                                        {
                                          type: "ref",
                                          id: "41",
                                          refId: "2",
                                        },
                                        {
                                          type: "number",
                                          id: "40",
                                          value: 1,
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui text",
                        id: "44",
                        text: "Increment",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "45",
                    name: "button",
                    props: [
                      {
                        type: "ui prop",
                        id: "46",
                        name: "onClick",
                        value: {
                          type: "function",
                          id: "47",
                          params: [],
                          body: [
                            {
                              type: "return",
                              id: "48",
                              arg: {
                                type: "state change",
                                id: "55",
                                state: {
                                  type: "ref",
                                  id: "56",
                                  refId: "2",
                                },
                                body: [
                                  {
                                    type: "return",
                                    id: "51",
                                    arg: {
                                      type: "nary",
                                      id: "52",
                                      operators: ["+"],
                                      args: [
                                        {
                                          type: "ref",
                                          id: "54",
                                          refId: "2",
                                        },
                                        {
                                          type: "number",
                                          id: "53",
                                          value: 1,
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui text",
                        id: "57",
                        text: "Increment",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "58",
                    name: "button",
                    props: [
                      {
                        type: "ui prop",
                        id: "59",
                        name: "onClick",
                        value: {
                          type: "function",
                          id: "60",
                          params: [],
                          body: [
                            {
                              type: "return",
                              id: "61",
                              arg: {
                                type: "state change",
                                id: "68",
                                state: {
                                  type: "ref",
                                  id: "69",
                                  refId: "2",
                                },
                                body: [
                                  {
                                    type: "return",
                                    id: "64",
                                    arg: {
                                      type: "nary",
                                      id: "65",
                                      operators: ["+"],
                                      args: [
                                        {
                                          type: "ref",
                                          id: "67",
                                          refId: "2",
                                        },
                                        {
                                          type: "number",
                                          id: "66",
                                          value: 1,
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui text",
                        id: "70",
                        text: "Increment",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "71",
                    name: "div",
                    props: [],
                    children: [
                      {
                        type: "ui expression",
                        id: "72",
                        expression: {
                          type: "ref",
                          id: "73",
                          refId: "2",
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    })
  })

  return

  it("should transform a small app example that uses fetch, React.useState, and a small form", () => {
    const transformer = new ASTtoCTTransformer()

    transformer.addGlobal("fetch", "<fetch>")
    transformer.addGlobal("JSON", "<JSON>")
    transformer.addGlobal("console", "<console>")

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          function App() {
            const [name, setName] = React.useState("")

            const handleSubmit = async (event) => {
              event.preventDefault()
              try {
                const response =  await fetch("/api/data/form-submission", {
                  method: "POST",
                  body: JSON.stringify({ name }),
                })

                const data = await response.json()
                setName(data.name)
              } catch (error) {
                console.error(error)
              }
            }

            return (
              <div>
                <h1>Hello, {name}!</h1>
                <form
                  onSubmit={handleSubmit}
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              </div>
            )
          }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    // writeFileSync("./codeTree.ts", JSON.stringify(codeTree, null, 2))

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 74,
      body: [
        {
          type: "component",
          id: "1",
          name: "App",
          body: [
            {
              type: "state",
              id: "2",
              name: "name",
              value: {
                type: "string",
                id: "3",
                value: "",
              },
            },
            {
              type: "function",
              id: "4",
              name: "handleSubmit",
              params: [
                {
                  type: "param",
                  id: "5",
                  name: "event",
                },
              ],
              body: [
                {
                  type: "function call",
                  id: "6",
                  callee: {
                    type: "path access",
                    id: "7",
                    path: [
                      {
                        type: "ref",
                        id: "9",
                        refId: "5",
                      },
                      {
                        type: "string",
                        id: "8",
                        value: "preventDefault",
                      },
                    ],
                  },
                  args: [],
                },
                {
                  type: "try",
                  id: "10",
                  body: [
                    {
                      type: "var",
                      id: "11",
                      name: "response",
                      value: {
                        type: "function call",
                        id: "12",
                        callee: {
                          type: "ref",
                          id: "13",
                          refId: "<fetch>",
                        },
                        args: [
                          {
                            type: "string",
                            id: "14",
                            value: "/api/data/form-submission",
                          },
                          {
                            type: "object",
                            id: "15",
                            props: [
                              {
                                type: "property",
                                id: "16",
                                name: {
                                  type: "string",
                                  id: "17",
                                  value: "method",
                                },
                                value: {
                                  type: "string",
                                  id: "18",
                                  value: "POST",
                                },
                              },
                              {
                                type: "property",
                                id: "19",
                                name: {
                                  type: "string",
                                  id: "20",
                                  value: "body",
                                },
                                value: {
                                  type: "function call",
                                  id: "21",
                                  callee: {
                                    type: "path access",
                                    id: "22",
                                    path: [
                                      {
                                        type: "ref",
                                        id: "24",
                                        refId: "<JSON>",
                                      },
                                      {
                                        type: "string",
                                        id: "23",
                                        value: "stringify",
                                      },
                                    ],
                                  },
                                  args: [
                                    {
                                      type: "object",
                                      id: "25",
                                      props: [
                                        {
                                          type: "property",
                                          id: "26",
                                          name: {
                                            type: "string",
                                            id: "27",
                                            value: "name",
                                          },
                                          value: {
                                            type: "ref",
                                            id: "28",
                                            refId: "2",
                                          },
                                        },
                                      ],
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        ],
                      },
                    },
                    {
                      type: "var",
                      id: "29",
                      name: "data",
                      value: {
                        type: "function call",
                        id: "30",
                        callee: {
                          type: "path access",
                          id: "31",
                          path: [
                            {
                              type: "ref",
                              id: "33",
                              refId: "11",
                            },
                            {
                              type: "string",
                              id: "32",
                              value: "json",
                            },
                          ],
                        },
                        args: [],
                      },
                    },
                    {
                      type: "function call",
                      id: "34",
                      callee: {
                        type: "ref",
                        id: "35",
                        refId: "<setName>",
                      },
                      args: [
                        {
                          type: "path access",
                          id: "36",
                          path: [
                            {
                              type: "ref",
                              id: "38",
                              refId: "29",
                            },
                            {
                              type: "string",
                              id: "37",
                              value: "name",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  catch: [
                    {
                      type: "function call",
                      id: "40",
                      callee: {
                        type: "path access",
                        id: "41",
                        path: [
                          {
                            type: "ref",
                            id: "43",
                            refId: "<console>",
                          },
                          {
                            type: "string",
                            id: "42",
                            value: "error",
                          },
                        ],
                      },
                      args: [
                        {
                          type: "ref",
                          id: "44",
                          refId: "39",
                        },
                      ],
                    },
                  ],
                  catchParam: {
                    type: "param",
                    id: "39",
                    name: "error",
                  },
                },
              ],
            },
            {
              type: "return",
              id: "45",
              arg: {
                type: "ui element",
                id: "46",
                name: "div",
                props: [],
                children: [
                  {
                    type: "ui element",
                    id: "47",
                    name: "h1",
                    props: [],
                    children: [
                      {
                        type: "ui text",
                        id: "48",
                        text: "Hello, ",
                      },
                      {
                        type: "ui expression",
                        id: "49",
                        expression: {
                          type: "ref",
                          id: "50",
                          refId: "2",
                        },
                      },
                      {
                        type: "ui text",
                        id: "51",
                        text: "!",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "52",
                    name: "form",
                    props: [
                      {
                        type: "ui prop",
                        id: "53",
                        name: "onSubmit",
                        value: {
                          type: "ref",
                          id: "54",
                          refId: "4",
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui element",
                        id: "55",
                        name: "input",
                        props: [
                          {
                            type: "ui prop",
                            id: "56",
                            name: "type",
                            value: {
                              type: "string",
                              id: "57",
                              value: "text",
                            },
                          },
                          {
                            type: "ui prop",
                            id: "58",
                            name: "value",
                            value: {
                              type: "ref",
                              id: "59",
                              refId: "2",
                            },
                          },
                          {
                            type: "ui prop",
                            id: "60",
                            name: "onChange",
                            value: {
                              type: "function",
                              id: "61",
                              params: [
                                {
                                  type: "param",
                                  id: "62",
                                  name: "event",
                                },
                              ],
                              body: [
                                {
                                  type: "return",
                                  id: "63",
                                  arg: {
                                    type: "function call",
                                    id: "64",
                                    callee: {
                                      type: "ref",
                                      id: "65",
                                      refId: "<setName>",
                                    },
                                    args: [
                                      {
                                        type: "path access",
                                        id: "66",
                                        path: [
                                          {
                                            type: "ref",
                                            id: "69",
                                            refId: "62",
                                          },
                                          {
                                            type: "string",
                                            id: "68",
                                            value: "target",
                                          },
                                          {
                                            type: "string",
                                            id: "67",
                                            value: "value",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                      {
                        type: "ui element",
                        id: "70",
                        name: "button",
                        props: [
                          {
                            type: "ui prop",
                            id: "71",
                            name: "type",
                            value: {
                              type: "string",
                              id: "72",
                              value: "submit",
                            },
                          },
                        ],
                        children: [
                          {
                            type: "ui text",
                            id: "73",
                            text: "Submit",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })
})
