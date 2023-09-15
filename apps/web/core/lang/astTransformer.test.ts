import { Parser } from "acorn"
import acornJSXParser from "acorn-jsx"
import { Program } from "estree"
import fs from "fs"

import { ASTtoCTTransformer } from "./astTransformer"
import { ProgramNode } from "./interpreter"

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
      body: [
        {
          type: "component",
          name: "App",
          body: [
            {
              type: "return",
              arg: {
                type: "ui element",
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
        function App() {
          return "Hello, World!";
        }
        `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    expect(codeTree).toStrictEqual({
      type: "program",
      body: [
        {
          type: "function",
          name: "App",
          params: [],
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
    } satisfies ProgramNode)
  })

  it("should transform a program with a React component and a lot of JSX", () => {
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
                  <li>This is a list item</li>
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
      body: [
        {
          type: "component",
          name: "App",
          body: [
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
                        text: "Hello, World!",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    name: "p",
                    props: [],
                    children: [
                      {
                        type: "ui text",
                        text: "This is a paragraph",
                      },
                    ],
                  },
                  {
                    type: "ui element",
                    name: "ul",
                    props: [],
                    children: [
                      {
                        type: "ui element",
                        name: "li",
                        props: [],
                        children: [
                          {
                            type: "ui text",
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
      body: [
        {
          type: "component",
          name: "App",
          body: [
            {
              type: "state",
              name: "state",
              value: {
                type: "string",
                value: "initial state",
              },
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
      body: [
        {
          type: "component",
          name: "App",
          body: [
            {
              type: "var",
              name: "message",
              value: {
                type: "string",
                value: "Hello, World!",
              },
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
                        type: "ui expression",
                        expression: {
                          type: "ref",
                          name: "message",
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
      body: [
        {
          type: "assignment",
          operator: "=",
          left: {
            type: "path access",
            path: [
              {
                type: "ref",
                name: "obj",
              },
              {
                type: "ref",
                name: "value",
              },
            ],
          },
          right: {
            type: "number",
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
      body: [
        {
          type: "var",
          name: "obj",
          value: {
            type: "object",
            properties: [
              {
                type: "property",
                name: {
                  type: "ref",
                  name: "value",
                },
                value: {
                  type: "number",
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
      body: [
        {
          type: "try",
          body: [
            {
              type: "var",
              name: "num1",
              value: {
                type: "number",
                value: 2,
              },
            },
          ],
          catch: [
            {
              type: "var",
              name: "num2",
              value: {
                type: "number",
                value: 3,
              },
            },
          ],
          finally: [
            {
              type: "var",
              name: "num3",
              value: {
                type: "number",
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
      body: [
        {
          type: "function call",
          callee: {
            type: "ref",
            name: "setFn",
          },
          args: [
            {
              type: "function",
              params: [
                {
                  type: "param",
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
      body: [
        {
          type: "function",
          name: "myFunc",
          params: [
            {
              type: "param",
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
                type: "nary",
                operator: "+",
                args: [
                  {
                    type: "ref",
                    name: "a",
                  },
                  {
                    type: "ref",
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
