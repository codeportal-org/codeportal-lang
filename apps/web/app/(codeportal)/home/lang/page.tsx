"use client"

import React from "react"

import { CodeTreeView } from "@/core/CodeTreeView"
import { CodeDB } from "@/core/lang/codeDB"
import { importJS } from "@/core/lang/js-interop/importJS"

export function CodeSnippet({ code }: { code: string }) {
  const codeTree = React.useMemo(() => importJS(code), [code])

  const [codeDB] = React.useState<CodeDB>(() => {
    const _codeDB = new CodeDB()

    if (codeTree) {
      _codeDB.load(codeTree)
    }

    return _codeDB
  })

  return <CodeTreeView codeDB={codeDB} codeTree={codeTree} />
}

export default function LangDemoPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-2 pb-10 text-gray-700">
      <h1 className="text-primary-500 mb-8 mt-10 text-center text-3xl font-bold sm:text-5xl">
        ⬥ Portal Visual Language
      </h1>

      <h2 className="text-primary-500 mx-2 mb-4 w-full text-left text-lg font-bold sm:text-xl">
        If statement
      </h2>

      <CodeSnippet
        code={`
    let count = 0
    if (count > 10) {
      count = 0
      count = 1 + 2 + 3
    }
  `}
      />

      <div className="pt-8">{/* spacer */}</div>

      <h2 className="text-primary-500 mx-2 mb-4 w-full text-left text-lg font-bold sm:text-xl">
        React component
      </h2>

      <CodeSnippet
        code={`
function App() {
  const [count, setCount] = React.useState(0)

  let x = "hey there"

  return (
    <div>
      <h1>Counter</h1>
      <button onClick={() => {setCount(c => {return c + 1})}}>+</button>
      <button onClick={() => {setCount(count - 1)}}>-</button>
      <div>Count: {count}</div>
    </div>
  )
  }`}
      />
    </div>
  )
}
