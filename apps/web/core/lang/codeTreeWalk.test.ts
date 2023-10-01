import { Parser } from "acorn"
import acornJSXParser from "acorn-jsx"
import { writeFileSync } from "fs"

import { ASTtoCTTransformer } from "./astTransformer"
import { ProgramNode } from "./codeTree"
import { CodeTreeWalk } from "./codeTreeWalk"

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
    codeTreeWalker.full(codeTree as ProgramNode, (node, parentMeta) => {
      node.meta = { extras: { count, parentProp: parentMeta?.property ?? null } }
      count += 1
    })

    expect(codeTree).toStrictEqual({
      type: "program",
      meta: { extras: { count: 0, parentProp: null } },
      id: "0",
      idCounter: 6,
      body: [
        {
          type: "component",
          name: "App",
          id: "1",
          meta: { extras: { count: 1, parentProp: "body" } },
          body: [
            {
              type: "var",
              id: "2",
              meta: { extras: { count: 2, parentProp: "body" } },
              name: "x",
              value: {
                type: "number",
                id: "3",
                meta: { extras: { count: 3, parentProp: "value" } },
                value: 0,
              },
            },
            {
              type: "return",
              meta: { extras: { count: 4, parentProp: "body" } },
              id: "4",
              arg: {
                type: "ui element",
                id: "5",
                name: "div",
                meta: { extras: { count: 5, parentProp: "arg" } },
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
    codeTreeWalker.full(codeTree as ProgramNode, (node, parentMeta) => {
      node.meta = { extras: { count, parentCount: parentMeta?.parent.meta?.extras?.count ?? null } }
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

  it("should walk all the nodes in a Code Tree containing an if-elseIf-else chain and + and - unary expressions", () => {
    const codeTreeWalker = new CodeTreeWalk()
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
        function calc() {
          let x = 0

          if (x === 0) {
            return 0
          } else if (x === 1) {
            return 1
          } else if (x === 2) {
            return 2
          } else if (x === 3) {
            return +3
          } else {
            return -1
          }
        }
      `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    let count = 0
    codeTreeWalker.full(codeTree as ProgramNode, (node, parentMeta) => {
      node.meta = { extras: { count, parentCount: parentMeta?.parent.meta?.extras?.count ?? null } }
      count += 1
    })

    // writeFileSync("./codeTree-file.ts", JSON.stringify(codeTree, null, 2))
    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 31,
      meta: {
        extras: {
          count: 0,
          parentCount: null,
        },
      },
      body: [
        {
          type: "function",
          id: "1",
          name: "calc",
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
                meta: {
                  extras: {
                    count: 3,
                    parentCount: 2,
                  },
                },
              },
              meta: {
                extras: {
                  count: 2,
                  parentCount: 1,
                },
              },
            },
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
                    meta: {
                      extras: {
                        count: 6,
                        parentCount: 5,
                      },
                    },
                  },
                  {
                    type: "number",
                    id: "6",
                    value: 0,
                    meta: {
                      extras: {
                        count: 7,
                        parentCount: 5,
                      },
                    },
                  },
                ],
                meta: {
                  extras: {
                    count: 5,
                    parentCount: 4,
                  },
                },
              },
              then: [
                {
                  type: "return",
                  id: "8",
                  arg: {
                    type: "number",
                    id: "9",
                    value: 0,
                    meta: {
                      extras: {
                        count: 9,
                        parentCount: 8,
                      },
                    },
                  },
                  meta: {
                    extras: {
                      count: 8,
                      parentCount: 4,
                    },
                  },
                },
              ],
              elseIf: [
                {
                  type: "else if",
                  id: "10",
                  test: {
                    type: "nary",
                    id: "11",
                    operator: "==",
                    args: [
                      {
                        type: "ref",
                        id: "13",
                        refId: "2",
                        meta: {
                          extras: {
                            count: 12,
                            parentCount: 11,
                          },
                        },
                      },
                      {
                        type: "number",
                        id: "12",
                        value: 1,
                        meta: {
                          extras: {
                            count: 13,
                            parentCount: 11,
                          },
                        },
                      },
                    ],
                    meta: {
                      extras: {
                        count: 11,
                        parentCount: 10,
                      },
                    },
                  },
                  then: [
                    {
                      type: "return",
                      id: "14",
                      arg: {
                        type: "number",
                        id: "15",
                        value: 1,
                        meta: {
                          extras: {
                            count: 15,
                            parentCount: 14,
                          },
                        },
                      },
                      meta: {
                        extras: {
                          count: 14,
                          parentCount: 10,
                        },
                      },
                    },
                  ],
                  meta: {
                    extras: {
                      count: 10,
                      parentCount: 4,
                    },
                  },
                },
                {
                  type: "else if",
                  id: "16",
                  test: {
                    type: "nary",
                    id: "17",
                    operator: "==",
                    args: [
                      {
                        type: "ref",
                        id: "19",
                        refId: "2",
                        meta: {
                          extras: {
                            count: 18,
                            parentCount: 17,
                          },
                        },
                      },
                      {
                        type: "number",
                        id: "18",
                        value: 2,
                        meta: {
                          extras: {
                            count: 19,
                            parentCount: 17,
                          },
                        },
                      },
                    ],
                    meta: {
                      extras: {
                        count: 17,
                        parentCount: 16,
                      },
                    },
                  },
                  then: [
                    {
                      type: "return",
                      id: "20",
                      arg: {
                        type: "number",
                        id: "21",
                        value: 2,
                        meta: {
                          extras: {
                            count: 21,
                            parentCount: 20,
                          },
                        },
                      },
                      meta: {
                        extras: {
                          count: 20,
                          parentCount: 16,
                        },
                      },
                    },
                  ],
                  meta: {
                    extras: {
                      count: 16,
                      parentCount: 4,
                    },
                  },
                },
                {
                  type: "else if",
                  id: "22",
                  test: {
                    type: "nary",
                    id: "23",
                    operator: "==",
                    args: [
                      {
                        type: "ref",
                        id: "25",
                        refId: "2",
                        meta: {
                          extras: {
                            count: 24,
                            parentCount: 23,
                          },
                        },
                      },
                      {
                        type: "number",
                        id: "24",
                        value: 3,
                        meta: {
                          extras: {
                            count: 25,
                            parentCount: 23,
                          },
                        },
                      },
                    ],
                    meta: {
                      extras: {
                        count: 23,
                        parentCount: 22,
                      },
                    },
                  },
                  then: [
                    {
                      type: "return",
                      id: "26",
                      arg: {
                        type: "number",
                        id: "27",
                        value: 3,
                        meta: {
                          extras: {
                            count: 27,
                            parentCount: 26,
                          },
                        },
                      },
                      meta: {
                        extras: {
                          count: 26,
                          parentCount: 22,
                        },
                      },
                    },
                  ],
                  meta: {
                    extras: {
                      count: 22,
                      parentCount: 4,
                    },
                  },
                },
              ],
              else: [
                {
                  type: "return",
                  id: "28",
                  arg: {
                    type: "unary",
                    id: "29",
                    operator: "-",
                    arg: {
                      type: "number",
                      id: "30",
                      value: 1,
                      meta: {
                        extras: {
                          count: 30,
                          parentCount: 29,
                        },
                      },
                    },
                    meta: {
                      extras: {
                        count: 29,
                        parentCount: 28,
                      },
                    },
                  },
                  meta: {
                    extras: {
                      count: 28,
                      parentCount: 4,
                    },
                  },
                },
              ],
              meta: {
                extras: {
                  count: 4,
                  parentCount: 1,
                },
              },
            },
          ],
          meta: {
            extras: {
              count: 1,
              parentCount: 0,
            },
          },
        },
      ],
    } satisfies ProgramNode)
  })

  it("should walk all the nodes in a Code Tree containing a nested JSX structure", () => {
    const codeTreeWalker = new CodeTreeWalk()
    const transformer = new ASTtoCTTransformer()

    const codeTree = transformer.transform(
      Parser.extend(acornJSXParser()).parse(
        `
      function App() {
        return <div>
          <div>
            <h1>Header</h1>
            <p>Paragraph</p>
            <div>Some text</div>
          </div>
        </div>
      }
    `,
        { ecmaVersion: "latest" },
      ) as any,
    )

    let count = 0
    codeTreeWalker.full(codeTree as ProgramNode, (node, parentMeta) => {
      node.meta = {
        extras: {
          count,
          parentCount: parentMeta?.parent.meta?.extras?.count ?? null,
          parentProperty: parentMeta?.property ?? null,
        },
      }
      count += 1
    })

    writeFileSync("./codeTree-file.ts", JSON.stringify(codeTree, null, 2))

    expect(codeTree).toStrictEqual({
      type: "program",
      id: "0",
      idCounter: 11,
      meta: {
        extras: {
          count: 0,
          parentCount: null,
          parentProperty: null,
        },
      },
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
                    name: "div",
                    props: [],
                    children: [
                      {
                        type: "ui element",
                        id: "5",
                        name: "h1",
                        props: [],
                        children: [
                          {
                            type: "ui text",
                            id: "6",
                            text: "Header",
                            meta: {
                              extras: {
                                count: 6,
                                parentCount: 5,
                                parentProperty: "children",
                              },
                            },
                          },
                        ],
                        meta: {
                          extras: {
                            count: 5,
                            parentCount: 4,
                            parentProperty: "children",
                          },
                        },
                      },
                      {
                        type: "ui element",
                        id: "7",
                        name: "p",
                        props: [],
                        children: [
                          {
                            type: "ui text",
                            id: "8",
                            text: "Paragraph",
                            meta: {
                              extras: {
                                count: 8,
                                parentCount: 7,
                                parentProperty: "children",
                              },
                            },
                          },
                        ],
                        meta: {
                          extras: {
                            count: 7,
                            parentCount: 4,
                            parentProperty: "children",
                          },
                        },
                      },
                      {
                        type: "ui element",
                        id: "9",
                        name: "div",
                        props: [],
                        children: [
                          {
                            type: "ui text",
                            id: "10",
                            text: "Some text",
                            meta: {
                              extras: {
                                count: 10,
                                parentCount: 9,
                                parentProperty: "children",
                              },
                            },
                          },
                        ],
                        meta: {
                          extras: {
                            count: 9,
                            parentCount: 4,
                            parentProperty: "children",
                          },
                        },
                      },
                    ],
                    meta: {
                      extras: {
                        count: 4,
                        parentCount: 3,
                        parentProperty: "children",
                      },
                    },
                  },
                ],
                meta: {
                  extras: {
                    count: 3,
                    parentCount: 2,
                    parentProperty: "arg",
                  },
                },
              },
              meta: {
                extras: {
                  count: 2,
                  parentCount: 1,
                  parentProperty: "body",
                },
              },
            },
          ],
          meta: {
            extras: {
              count: 1,
              parentCount: 0,
              parentProperty: "body",
            },
          },
        },
      ],
    } satisfies ProgramNode)
  })
})
