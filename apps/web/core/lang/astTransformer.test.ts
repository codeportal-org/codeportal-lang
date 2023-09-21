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

  return

  it("should transform a program with a TryStatement, and the ", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
          try {
            var num1 = 2
          } catch (error) {
            var num2 = 3
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
      idCounter: 7,
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
          catch: [
            {
              type: "var",
              id: "4",
              name: "num2",
              value: {
                type: "number",
                id: "5",
                value: 3,
              },
            },
          ],
          finally: [
            {
              type: "var",
              id: "6",
              name: "num3",
              value: {
                type: "number",
                id: "7",
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
      idCounter: 6,
      body: [
        {
          type: "function call",
          id: "1",
          callee: {
            type: "ref",
            id: "2",
            name: "setFn",
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
                  name: "b",
                },
              ],
              body: [
                {
                  type: "return",
                  arg: {
                    type: "ref",
                    name: "b",
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
      idCounter: 6,
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
                    id: "6",
                    name: "a",
                  },
                  {
                    type: "ref",
                    id: "7",
                    name: "b",
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
      idCounter: 5,
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

    // fs.writeFileSync("./codeTree.json", JSON.stringify(codeTree, null, 2))

    expect(codeTree).toBe({
      type: "program",
      body: [
        {
          type: "component",
          name: "App",
          body: [
            {
              type: "state",
              name: "name",
              value: {
                type: "string",
                value: "",
              },
            },
            {
              type: "function",
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
              arg: {
                type: "ui element",
                name: "div",
                props: [],
                children: [
                  {
                    type: "ui element",
                    name: "h1",
                    props: [],
                    children: [
                      {
                        type: "ui text",
                        text: "Hello, {name}!",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    name: "form",
                    props: [
                      {
                        type: "ui prop",
                        name: "onSubmit",
                        value: {
                          type: "ref",
                          name: "handleSubmit",
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui element",
                        name: "input",
                        props: [
                          {
                            type: "ui prop",
                            name: "type",
                            value: {
                              type: "string",
                              value: "text",
                            },
                          },
                          {
                            type: "ui prop",
                            name: "value",
                            value: {
                              type: "string",
                              value: "name",
                            },
                          },
                          {
                            type: "ui prop",
                            name: "onChange",
                            value: {
                              type: "inline function",
                              params: [
                                {
                                  type: "param",
                                  name: "event",
                                },
                              ],
                              body: [
                                {
                                  type: "function call",
                                  callee: {
                                    type: "ref",
                                    name: "setName",
                                  },
                                  args: [
                                    {
                                      type: "ref",
                                      name: "event.target.value",
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
                        name: "button",
                        props: [
                          {
                            type: "ui prop",
                            name: "type",
                            value: {
                              type: "string",
                              value: "submit",
                            },
                          },
                        ],
                        children: [
                          {
                            type: "ui text",
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
