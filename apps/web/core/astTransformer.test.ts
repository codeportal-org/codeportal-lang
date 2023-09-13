import { Parser } from "acorn"
import acornJSXParser from "acorn-jsx"
import fs from "fs"

import { ASTtoCTTransformer } from "./astTransformer"
import { ProgramNode } from "./interpreter"

describe("astTransformer", () => {
  it("should transform a program", () => {
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform({
      type: "Program",
      body: [],
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
      ),
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
      ),
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
      ),
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
      ),
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
      ),
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
        ),
      )
    }).toThrow()
  })

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
      ),
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
