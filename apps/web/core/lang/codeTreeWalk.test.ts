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

    let count = 0
    codeTreeWalker.full(codeTree as ProgramNode, (node, parent) => {
      node.meta = { extras: { count } }
      count += 1
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      meta: { extras: { count: 0 } },
      id: "0",
      idCounter: 6,
      body: [
        {
          type: "component",
          name: "App",
          id: "1",
          meta: { extras: { count: 1 } },
          body: [
            {
              type: "var",
              id: "2",
              meta: { extras: { count: 2 } },
              name: "x",
              value: {
                type: "number",
                id: "3",
                meta: { extras: { count: 3 } },
                value: 0,
              },
            },
            {
              type: "return",
              meta: { extras: { count: 4 } },
              id: "4",
              arg: {
                type: "ui element",
                id: "5",
                name: "div",
                meta: { extras: { count: 5 } },
                props: [],
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

    let count = 0
    codeTreeWalker.full(codeTree as ProgramNode, (node, parent) => {
      node.meta = { extras: { count, parentCount: parent?.meta?.extras?.count ?? null } }
      count += 1
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      meta: { extras: { count: 0, parentCount: null } },
      id: "0",
      idCounter: 10,
      body: [
        {
          type: "component",
          name: "App",
          id: "1",
          meta: { extras: { count: 1, parentCount: 0 } },
          body: [
            {
              type: "var",
              id: "2",
              meta: { extras: { count: 2, parentCount: 1 } },
              name: "x",
              value: {
                type: "number",
                id: "3",
                meta: { extras: { count: 3, parentCount: 2 } },
                value: 0,
              },
            },
            {
              type: "return",
              id: "4",
              meta: { extras: { count: 4, parentCount: 1 } },
              arg: {
                type: "ui element",
                id: "5",
                name: "div",
                meta: { extras: { count: 5, parentCount: 4 } },
                props: [],
                children: [
                  {
                    type: "ui fragment",
                    id: "6",
                    meta: { extras: { count: 6, parentCount: 5 } },
                    children: [
                      {
                        type: "ui element",
                        id: "7",
                        name: "div",
                        meta: { extras: { count: 7, parentCount: 6 } },
                        props: [],
                        children: [
                          {
                            type: "ui text",
                            id: "8",
                            meta: { extras: { count: 8, parentCount: 7 } },
                            text: "text 1",
                          },
                        ],
                      },
                      {
                        type: "ui text",
                        id: "9",
                        meta: { extras: { count: 9, parentCount: 6 } },
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
