"use client"

import { useCompletion } from "ai/react"
import { useSaveCode } from "app/api/apps/[appId]/code/hooks"
import React, { useState } from "react"

export default function Chat({
  appId,
  onFinish,
}: {
  appId: string
  onFinish?: (prompt: string, completion: string) => void
}) {
  const formRef = React.useRef<HTMLFormElement>(null)
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
      <form onSubmit={handleSubmit} ref={formRef}>
        <textarea
          className="mb-2 w-full max-w-md resize-none rounded-xl border p-2"
          value={input}
          placeholder="Describe your app..."
          onChange={handleInputChange}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          rows={4}
          onKeyDown={(e) => {
            console.log("keydown", e.key, e.shiftKey)
            if (e.key === "Enter" && !e.shiftKey) {
              formRef.current?.requestSubmit()
            }
          }}
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Create app!
        </button>
      </form>
      <div className="my-6 w-full overflow-auto whitespace-pre-wrap">
        {isLoading && <div>Creating app ...</div>}
        {completion}
      </div>
    </div>
  )
}
