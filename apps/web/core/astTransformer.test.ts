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
    } as ProgramNode)
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
                attributes: [],
                children: [],
              },
            },
          ],
        },
      ],
    } as ProgramNode)
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
    } as ProgramNode)
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
                attributes: [],
                children: [
                  {
                    type: "ui element",
                    name: "h1",
                    attributes: [],
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
                    attributes: [],
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
                    attributes: [],
                    children: [
                      {
                        type: "ui element",
                        name: "li",
                        attributes: [],
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
    } as ProgramNode)
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
                attributes: [],
                children: [
                  {
                    type: "ui element",
                    name: "h1",
                    attributes: [],
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
    } as ProgramNode)
  })

  // it("should transform a small app example that uses fetch, React.useState, and a small form", () => {
  //   const transformer = new ASTtoCTTransformer()

  //   const codeTree = transformer.transform(
  //     Parser.extend(acornJSXParser()).parse(
  //       `
  //         function App() {
  //           const [name, setName] = React.useState("")

  //           const handleSubmit = async (event) => {
  //             event.preventDefault()
  //             try {
  //               const response =  await fetch("/api/data/form-submission", {
  //                 method: "POST",
  //                 body: JSON.stringify({ name }),
  //               })

  //               const data = await response.json()
  //               setName(data.name)
  //             } catch (error) {
  //               console.error(error)
  //             }
  //           }

  //           return (
  //             <div>
  //               <h1>Hello, {name}!</h1>
  //               <form
  //                 onSubmit={handleSubmit}
  //               >
  //                 <input
  //                   type="text"
  //                   value={name}
  //                   onChange={(event) => setName(event.target.value)}
  //                 />
  //                 <button type="submit">Submit</button>
  //               </form>
  //             </div>
  //           )
  //         }
  //       `,
  //       { ecmaVersion: "latest" },
  //     ),
  //   )

  //   fs.writeFileSync("./codeTree.json", JSON.stringify(codeTree, null, 2))

  //   expect(codeTree).toBe({
  //     type: "program",
  //     body: [
  //       {
  //         type: "component",
  //         name: "App",
  //         body: [
  //           {
  //             type: "state",
  //             name: "name",
  //             value: "",
  //           },
  //           {
  //             type: "function",
  //             name: "handleSubmit",
  //             body: [
  //               {
  //                 type: "try",
  //                 body: [
  //                   {
  //                     type: "fetch",
  //                     url: "/api/data/form-submission",
  //                     method: "POST",
  //                     body: {
  //                       type: "json",
  //                       value: { name: "name" },
  //                     },
  //                   },
  //                   {
  //                     type: "json",
  //                     name: "data",
  //                     value: "response",
  //                   },
  //                   {
  //                     type: "state update",
  //                     name: "setName",
  //                     value: "data.name",
  //                   },
  //                 ],
  //                 catch: {
  //                   type: "console",
  //                   method: "error",
  //                   value: "error",
  //                 },
  //               },
  //             ],
  //           },
  //           {
  //             type: "return",
  //             arg: {
  //               type: "ui element",
  //               name: "div",
  //               attributes: [],
  //               children: [
  //                 {
  //                   type: "ui element",
  //                   name: "h1",
  //                   attributes: [],
  //                   children: [
  //                     {
  //                       type: "ui text",
  //                       text: "Hello, {name}!",
  //                     },
  //                   ],
  //                 },
  //                 {
  //                   type: "ui element",
  //                   name: "form",
  //                   attributes: [
  //                     {
  //                       type: "attribute",
  //                       name: "onSubmit",
  //                       value: "handleSubmit",
  //                     },
  //                   ],
  //                   children: [
  //                     {
  //                       type: "ui element",
  //                       name: "input",
  //                       attributes: [
  //                         {
  //                           type: "attribute",
  //                           name: "type",
  //                           value: "text",
  //                         },
  //                         {
  //                           type: "attribute",
  //                           name: "value",
  //                           value: "name",
  //                         },
  //                         {
  //                           type: "attribute",
  //                           name: "onChange",
  //                           // TODO: implement this
  //                           value: "(event) => setName(event.target.value)",
  //                         },
  //                       ],
  //                     },
  //                     {
  //                       type: "ui element",
  //                       name: "button",
  //                       attributes: [
  //                         {
  //                           type: "attribute",
  //                           name: "type",
  //                           value: "submit",
  //                         },
  //                       ],
  //                       children: [
  //                         {
  //                           type: "ui text",
  //                           text: "Submit",
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   } as ProgramNode)
  // })
})
