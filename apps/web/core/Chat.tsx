"use client"

import React from "react"
import TextareaAutosize from "react-textarea-autosize"

import { Button } from "@/components/ui/button"

export default function Chat({
  existingPrompt,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isProcessing,
}: {
  existingPrompt: boolean
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  isProcessing: boolean
}) {
  const formRef = React.useRef<HTMLFormElement>(null)

  return (
    <div className="h-full rounded-xl border p-2">
      {isLoading && <div>Loading ...</div>}
      <form onSubmit={handleSubmit} ref={formRef} className={isLoading ? "hidden" : ""}>
        <TextareaAutosize
          className="mb-1 w-full max-w-md resize-none rounded-xl border border-slate-300 p-2"
          value={input}
          placeholder="Describe your app's requirements in detail ..."
          onChange={handleInputChange}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          minRows={4}
          maxRows={30}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              formRef.current?.requestSubmit()
            }
          }}
        />
        <Button type="submit">
          {existingPrompt ? "Recreate app!" : "Create app!"}{" "}
          <kbd className="ml-2 font-sans font-semibold dark:text-slate-500">
            <abbr title="Command" className="mr-1 text-slate-300 no-underline dark:text-slate-500">
              ⌘
            </abbr>
            + K
          </kbd>
        </Button>
      </form>
      <div className="my-6 h-[calc(100%-200px)] overflow-auto whitespace-pre-wrap">
        {isProcessing && <div>Creating app ...</div>}
      </div>
    </div>
  )
}
