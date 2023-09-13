"use client"

import { ClientSideSuspense } from "@liveblocks/react"
import React from "react"

import { PrivateRoomProvider, privateLiveRoomContext } from "@/lib/liveblocks.config"

import { ASTView } from "./ASTView"
import { editorEmitter } from "./editorSingleton"

export const CodeView = React.forwardRef<
  HTMLDivElement,
  { appId: string; code: string; isFinished: boolean; ast: any }
>(({ appId, code, isFinished, ast }, ref) => {
  return (
    <div className="h-full">
      <PrivateRoomProvider id={`editor-${appId}`} initialPresence={{}}>
        <ClientSideSuspense fallback={<div>Loading...</div>}>
          {() => <CodeContainer ref={ref} code={code} isFinished={isFinished} ast={ast} />}
        </ClientSideSuspense>
      </PrivateRoomProvider>
    </div>
  )
})

const CodeContainer = React.forwardRef<
  HTMLDivElement,
  { code: string; isFinished: boolean; ast: any }
>(({ code, isFinished, ast }, ref) => {
  const broadcast: any = privateLiveRoomContext.useBroadcastEvent()

  React.useEffect(() => {
    editorEmitter.on("refresh", () => {
      broadcast({ type: "refresh" })
    })
  }, [])

  React.useEffect(() => {
    if (isFinished) {
      broadcast({ type: "refresh" })
    }
  }, [code, isFinished])

  if (ast) {
    return <ASTView ast={ast} />
  }

  return (
    <div
      ref={ref}
      className="h-full w-full overflow-auto whitespace-pre-wrap rounded-xl border px-4 py-2"
    >
      {code}
    </div>
  )
})
