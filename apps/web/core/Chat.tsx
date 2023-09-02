"use client"

import { useCompletion } from "ai/react"
import { useSaveCode } from "app/api/apps/[appId]/code/hooks"
import { useState } from "react"

export default function Chat({
  appId,
  onFinish,
}: {
  appId: string
  onFinish?: (prompt: string, completion: string) => void
}) {
  const saveCode = useSaveCode(appId)

  const [isFinished, setIsFinished] = useState(false)
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: `/api/apps/${appId}/completion`,
    onFinish: (prompt, completion) => {
      console.log(prompt, completion)
      setIsFinished(true)
      if (onFinish) {
        onFinish(prompt, completion)
      }
      saveCode.trigger({ code: completion })
    },
  })

  return (
    <div className="h-full rounded-xl border p-2">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="mb-2 w-full max-w-md resize-none rounded-xl border p-2"
          value={input}
          placeholder="Describe your app..."
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Create app!
        </button>
      </form>
      <div className="my-6 w-full overflow-auto whitespace-pre-wrap">
        {isLoading ? "Creating app ..." : completion}
      </div>
    </div>
  )
}
