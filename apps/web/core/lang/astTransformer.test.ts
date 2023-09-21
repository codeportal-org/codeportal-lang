import { Parser } from "acorn"
import acornJSXParser from "acorn-jsx"

import { ASTtoCTTransformer, collapseWhitespace } from "./astTransformer"
import { ProgramNode } from "./interpreter"

describe("collapseWhitespace", () => {
  it("should collapse whitespace", () => {
    const withWhitespace = `\n     Text    with   \t \n\n whitespace \n\n\n`
    const withoutWhitespace = `Text with whitespace`

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
                children: [],
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
                            text: "This is a list item",
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
            properties: [
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
                operator: "+",
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
                operator: "==",
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
                operator: "==",
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
                    operator: ">",
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
                    operator: "<",
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
                    properties: [
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
                              properties: [
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

  return

  it("should transform a small app example that uses fetch, React.useState, and a small form", () => {
    const transformer = new ASTtoCTTransformer()

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

    expect(codeTree).toBe({
      type: "program",
      id: "0",
      idCounter: 21,
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
              body: [
                // {
                //   type: "try",
                //   body: [
                //     {
                //       type: "fetch",
                //       url: "/api/data/form-submission",
                //       method: "POST",
                //       body: {
                //         type: "json",
                //         value: { name: "name" },
                //       },
                //     },
                //     {
                //       type: "json",
                //       name: "data",
                //       value: "response",
                //     },
                //     {
                //       type: "state update",
                //       name: "setName",
                //       value: "data.name",
                //     },
                //   ],
                //   catch: {
                //     type: "console",
                //     method: "error",
                //     value: "error",
                //   },
                // },
              ],
            },
            {
              type: "return",
              id: "5",
              arg: {
                type: "ui element",
                id: "6",
                name: "div",
                props: [],
                children: [
                  {
                    type: "ui element",
                    id: "7",
                    name: "h1",
                    props: [],
                    children: [
                      {
                        type: "ui text",
                        id: "8",
                        text: "Hello, {name}!",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    id: "9",
                    name: "form",
                    props: [
                      {
                        type: "ui prop",
                        id: "10",
                        name: "onSubmit",
                        value: {
                          type: "ref",
                          id: "11",
                          refId: "4",
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui element",
                        id: "12",
                        name: "input",
                        props: [
                          {
                            type: "ui prop",
                            id: "13",
                            name: "type",
                            value: {
                              type: "string",
                              id: "14",
                              value: "text",
                            },
                          },
                          {
                            type: "ui prop",
                            id: "15",
                            name: "value",
                            value: {
                              type: "string",
                              id: "16",
                              value: "name",
                            },
                          },
                          {
                            type: "ui prop",
                            id: "17",
                            name: "onChange",
                            value: {
                              type: "function",
                              id: "18",
                              params: [
                                {
                                  type: "param",
                                  id: "19",
                                  name: "event",
                                },
                              ],
                              body: [
                                {
                                  type: "function call",
                                  id: "20",
                                  callee: {
                                    type: "ref",
                                    id: "21",
                                    refId: "setName",
                                  },
                                  args: [
                                    {
                                      type: "ref",
                                      id: "22",
                                      refId: "event.target.value",
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        ],
                      },
                      {
                        type: "ui element",
                        id: "23",
                        name: "button",
                        props: [
                          {
                            type: "ui prop",
                            id: "24",
                            name: "type",
                            value: {
                              type: "string",
                              id: "25",
                              value: "submit",
                            },
                          },
                        ],
                        children: [
                          {
                            type: "ui text",
                            id: "26",
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
