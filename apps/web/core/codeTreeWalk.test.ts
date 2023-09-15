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
              type: "return",
              meta: { extras: { counter: 2 } },
              arg: {
                type: "ui element",
                name: "div",
                meta: { extras: { counter: 3 } },
                props: [],
                children: [],
              },
            },
          ],
        },
      ],
    } satisfies ProgramNode)
  })
})
