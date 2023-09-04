"use client"

import { useCompletion } from "ai/react"
import { useSaveCode } from "app/api/apps/[appId]/code/hooks"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"

export default function Chat({
  appId,
  onFinish,
}: {
  appId: string
  onFinish?: (prompt: string, completion: string) => void
}) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const completionContainerRef = React.useRef<HTMLDivElement>(null)
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

  React.useEffect(() => {
    if (completionContainerRef.current) {
      completionContainerRef.current.scrollTop = completionContainerRef.current.scrollHeight
    }
  }, [completion])

  return (
    <div className="h-full rounded-xl border p-2">
      <form onSubmit={handleSubmit} ref={formRef}>
        <textarea
          className="mb-2 w-full max-w-md resize-y rounded-xl border p-2"
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
        <Button type="submit">Create app!</Button>
      </form>
      <div
        className="my-6 h-[calc(100%-200px)] overflow-auto whitespace-pre-wrap"
        ref={completionContainerRef}
      >
        {isLoading && <div>Creating app ...</div>}
        {completion}
      </div>
    </div>
  )
}
