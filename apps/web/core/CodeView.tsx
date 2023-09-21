"use client"

import React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

import { CodeTreeView } from "./CodeTreeView"
import { CodeDBProvider, useCodeDB } from "./lang/codeDBContext"
import { ProgramNode } from "./lang/interpreter"

const testCodeTree = {
  type: "program",
  id: "0",
  idCounter: 1,
  body: [
    {
      type: "component",
      name: "App",
      id: "1",
      body: [
        {
          type: "var",
          id: "2",
          name: "title",
          value: {
            type: "string",
            id: "3",
            value: "Welcome to HelloWorld App",
          },
        },
        {
          type: "var",
          id: "4",
          name: "description",
          value: {
            type: "string",
            id: "5",
            value:
              "This app is designed to display a simple ‘Hello World’ message. It’s a classic example of a basic yet powerful web application.",
          },
        },
        {
          type: "return",
          id: "6",
          arg: {
            type: "ui element",
            id: "7",
            name: "div",
            props: [
              {
                type: "ui prop",
                id: "8",
                name: "className",
                value: {
                  type: "string",
                  id: "9",
                  value: "max-w-3xl mx-auto p-4",
                },
              },
            ],
            children: [
              {
                type: "ui element",
                id: "10",
                name: "h1",
                props: [
                  {
                    type: "ui prop",
                    id: "11",
                    name: "className",
                    value: {
                      type: "string",
                      id: "12",
                      value: "text-3xl font-bold mb-4",
                    },
                  },
                ],
                children: [
                  {
                    type: "ui expression",
                    id: "13",
                    expression: {
                      type: "ref",
                      id: "14",
                      refId: "2",
                    },
                  },
                ],
              },
              {
                type: "ui element",
                id: "15",
                name: "p",
                props: [
                  {
                    type: "ui prop",
                    id: "16",
                    name: "className",
                    value: {
                      type: "string",
                      id: "17",
                      value: "text-lg mb-4",
                    },
                  },
                ],
                children: [
                  {
                    type: "ui expression",
                    id: "18",
                    expression: {
                      type: "ref",
                      id: "19",
                      refId: "4",
                    },
                  },
                ],
              },
              {
                type: "ui element",
                id: "20",
                name: "div",
                props: [
                  {
                    type: "ui prop",
                    id: "21",
                    name: "className",
                    value: {
                      type: "string",
                      id: "22",
                      value: "bg-blue-100 p-4 rounded-md",
                    },
                  },
                ],
                children: [
                  {
                    type: "ui element",
                    id: "23",
                    name: "p",
                    props: [
                      {
                        type: "ui prop",
                        id: "24",
                        name: "className",
                        value: {
                          type: "string",
                          id: "25",
                          value: "text-2xl font-bold",
                        },
                      },
                    ],
                    children: [
                      {
                        type: "ui text",
                        id: "26",
                        text: "Hello World",
                      },
                      {
                        type: "ui element",
                        id: "27",
                        name: "span",
                        children: [
                          {
                            type: "ui text",
                            id: "28",
                            text: "!",
                          },
                        ],
                      },
                      {
                        type: "ui text",
                        id: "29",
                        text: " :)",
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
} satisfies ProgramNode

export const CodeView = React.forwardRef<
  HTMLDivElement,
  {
    appId: string
    code: string
    isFinished: boolean
    codeTree: ProgramNode | null
    isLoading: boolean
  }
>(({ appId, code, isFinished, codeTree, isLoading }, ref) => {
  return (
    <div className="h-full">
      <TooltipProvider>
        <CodeDBProvider>
          <CodeContainer
            ref={ref}
            code={code}
            isFinished={isFinished}
            codeTree={codeTree}
            isLoading={isLoading}
          />
        </CodeDBProvider>
      </TooltipProvider>
    </div>
  )
})

const CodeContainer = React.forwardRef<
  HTMLDivElement,
  { code: string; isFinished: boolean; codeTree: ProgramNode | null; isLoading: boolean }
>(({ code, isFinished, codeTree, isLoading }, ref) => {
  const codeDB = useCodeDB()

  // React.useEffect(() => {
  //   if (isFinished) {
  //     broadcast({ type: "refresh" })
  //   }
  // }, [code, isFinished])

  // React.useEffect(() => {
  //   if (!codeTree) {
  //     return
  //   }

  //   if (isLoading) {
  //     codeDB?.reset()
  //     codeDB?.partialLoad(codeTree)
  //   } else {
  //     console.log("-----  load")
  //     codeDB?.reset()
  //     codeDB?.load(codeTree)
  //     console.log("-----  loaded")
  //   }
  // }, [codeTree, isLoading])

  React.useEffect(() => {
    codeDB?.reset()
    codeDB?.load(testCodeTree)
  }, [])

  if (testCodeTree) {
    return <CodeTreeView codeTree={testCodeTree} />
  }

  // at this point this is just for debugging purposes
  return (
    <div
      ref={ref}
      className="h-full w-full overflow-auto whitespace-pre-wrap rounded-xl border px-4 py-2"
    >
      {code}
    </div>
  )
})
