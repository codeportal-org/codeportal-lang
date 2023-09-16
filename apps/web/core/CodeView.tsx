"use client"

import { ClientSideSuspense } from "@liveblocks/react"
import React from "react"

import { PrivateRoomProvider, privateLiveRoomContext } from "@/lib/liveblocks.config"

import { CodeTreeView } from "./CodeTreeView"
import { editorEmitter } from "./editorSingleton"
import { CodeDBProvider, useCodeDB } from "./lang/codeDBContext"
import { ProgramNode } from "./lang/interpreter"

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
      <PrivateRoomProvider id={`editor-${appId}`} initialPresence={{}}>
        <CodeDBProvider>
          <ClientSideSuspense fallback={<div>Loading...</div>}>
            {() => (
              <CodeContainer
                ref={ref}
                code={code}
                isFinished={isFinished}
                codeTree={codeTree}
                isLoading={isLoading}
              />
            )}
          </ClientSideSuspense>
        </CodeDBProvider>
      </PrivateRoomProvider>
    </div>
  )
})

const CodeContainer = React.forwardRef<
  HTMLDivElement,
  { code: string; isFinished: boolean; codeTree: ProgramNode | null; isLoading: boolean }
>(({ code, isFinished, codeTree, isLoading }, ref) => {
  const broadcast: any = privateLiveRoomContext.useBroadcastEvent()
  const codeDB = useCodeDB()

  React.useEffect(() => {
    const unsubscribe = editorEmitter.onRefresh(() => {
      broadcast({ type: "refresh" })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  React.useEffect(() => {
    if (isFinished) {
      broadcast({ type: "refresh" })
    }
  }, [code, isFinished])

  React.useEffect(() => {
    if (!codeTree) {
      return
    }

    if (isLoading) {
      codeDB?.reset()
      codeDB?.partialLoad(codeTree)
    } else {
      console.log("-----  load")
      codeDB?.reset()
      codeDB?.load(codeTree)
      console.log("-----  loaded")
    }
  }, [codeTree, isLoading])

  if (codeTree) {
    return <CodeTreeView codeTree={codeTree} />
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
