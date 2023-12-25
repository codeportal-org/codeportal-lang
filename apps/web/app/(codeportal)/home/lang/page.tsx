"use client"

import { CodeTreeView } from "@/core/CodeTreeView"
import { ASTtoCTTransformer } from "@/core/lang/astTransformer"
import { CodeDB } from "@/core/lang/codeDB"
import { CodeProcessor } from "@/core/lang/codeProcessor"

const astTransformer = new ASTtoCTTransformer()
const codeProcessor = new CodeProcessor({ appId: "test" })

const testCode = `
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
}
`

codeProcessor.extend((ast) => astTransformer.transform(ast))
const testCodeTree = codeProcessor.process(testCode)

const codeDB = new CodeDB()

codeDB.load(testCodeTree)

export default function LangDemoPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-2 text-gray-700">
      <h1 className="text-primary-500 mb-8 mt-10 text-center text-3xl font-bold sm:text-5xl">
        Visual Language
      </h1>

      <p className="mx-2 mb-8 max-w-3xl text-center text-lg sm:text-xl">
        This is a demo of the visual language we are building.
      </p>

      <CodeTreeView codeTree={testCodeTree} codeDB={codeDB} />
    </div>
  )
}
