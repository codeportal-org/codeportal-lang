"use client"

import { useCompletion } from "ai/react"
import { useState } from "react"

export default function Chat({
  appId,
  onFinish,
}: {
  appId: string
  onFinish?: (prompt: string, completion: string) => void
}) {
  const [isFinished, setIsFinished] = useState(false)
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: `/api/apps/${appId}/completion`,
    onFinish: (prompt, completion) => {
      console.log(prompt, completion)
      setIsFinished(true)
      if (onFinish) {
        onFinish(prompt, completion)
      }
    },
  })

  return (
    <div className="flex h-full flex-col items-center rounded-xl border">
      <form onSubmit={handleSubmit}>
        <textarea
          className="m-2 mb-8 w-full max-w-md resize-none  border-gray-300"
          value={input}
          placeholder="Describe your app..."
          onChange={handleInputChange}
        ></textarea>
        {isLoading && <div className="my-6 whitespace-pre-wrap">Creating app ...</div>}
      </form>
    </div>
  )
}
