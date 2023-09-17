import { Parser } from "acorn"
import acornJSXParser from "acorn-jsx"

import { ASTtoCTTransformer } from "./astTransformer"
import { CodeTreeWalk } from "./codeTreeWalk"
import { ProgramNode } from "./interpreter"

describe("CodeTreeWalk", () => {
  it("should walk all the nodes in a Code Tree", () => {
    const codeTreeWalker = new CodeTreeWalk()
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
      function App() {
        let x = 0

        return <div></div>
      }
    `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    let counter = 0
    codeTreeWalker.full(codeTree as ProgramNode, (node, parent) => {
      node.meta = { extras: { counter } }
      counter += 1
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      meta: { extras: { counter: 0 } },
      body: [
        {
          type: "component",
          name: "App",
          meta: { extras: { counter: 1 } },
          body: [
            {
              type: "var",
              meta: { extras: { counter: 2 } },
              name: "x",
              value: {
                type: "number",
                meta: { extras: { counter: 3 } },
                value: 0,
              },
            },
            {
              type: "return",
              meta: { extras: { counter: 4 } },
              arg: {
                type: "ui element",
                name: "div",
                meta: { extras: { counter: 5 } },
                props: [],
                children: [],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })

  it("should walk all the nodes in a Code Tree containing a fragment and ui text nodes", () => {
    const codeTreeWalker = new CodeTreeWalk()
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
      function App() {
        let x = 0

        return <div>
          <><div>text 1</div>text 2</>
        </div>
      }
    `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    let counter = 0
    codeTreeWalker.full(codeTree as ProgramNode, (node, parent) => {
      node.meta = { extras: { counter } }
      counter += 1
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      meta: { extras: { counter: 0 } },
      body: [
        {
          type: "component",
          name: "App",
          meta: { extras: { counter: 1 } },
          body: [
            {
              type: "var",
              meta: { extras: { counter: 2 } },
              name: "x",
              value: {
                type: "number",
                meta: { extras: { counter: 3 } },
                value: 0,
              },
            },
            {
              type: "return",
              meta: { extras: { counter: 4 } },
              arg: {
                type: "ui element",
                name: "div",
                meta: { extras: { counter: 5 } },
                props: [],
                children: [
                  {
                    type: "ui fragment",
                    meta: { extras: { counter: 6 } },
                    children: [
                      {
                        type: "ui element",
                        name: "div",
                        meta: { extras: { counter: 7 } },
                        props: [],
                        children: [
                          {
                            type: "ui text",
                            meta: { extras: { counter: 8 } },
                            text: "text 1",
                          },
                        ],
                      },
                      {
                        type: "ui text",
                        meta: { extras: { counter: 9 } },
                        text: "text 2",
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
