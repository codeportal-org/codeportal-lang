"use client"

import Script from "next/script"
import React from "react"

import { ASTtoCTTransformer } from "@/core/lang/astTransformer"
import { CodeProcessor } from "@/core/lang/codeProcessor"
import { Interpreter } from "@/core/lang/interpreter"
import { MainModule, ThemeConfig } from "@/db/schema"

const astTransformer = new ASTtoCTTransformer()
const codeProcessor = new CodeProcessor({ appId: "test" })

const testCode = `
function App() {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <h1>Title</h1>
      <p>Paragraph</p>
      <button onClick={() => {setCount(count + 1)}}>+</button>
      <button onClick={() => {setCount(count - 1)}}>-</button>
      <div>Count: {count}</div>
    </div>
  )
}
`

codeProcessor.extend((ast) => astTransformer.transform(ast))
const testCodeTree = codeProcessor.process(testCode)

export function ClientComp({
  mainModule,
  theme,
}: {
  mainModule: MainModule | null
  theme: ThemeConfig | null
}) {
  React.useEffect(() => {
    // console.log("---- client side code")
  }, [])

  // console.log("ClientComp---->")

  const interpreter = new Interpreter()

  return <>{interpreter.interpretComponent(testCodeTree)}</>
}
