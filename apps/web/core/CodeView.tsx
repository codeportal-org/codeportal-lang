"use client"

import { ClientSideSuspense } from "@liveblocks/react"
import { useCompletion } from "ai/react"
import { type } from "os"
import React, { useState } from "react"

import { PrivateRoomProvider, privateLiveRoomContext } from "@/lib/liveblocks.config"

import Chat from "./Chat"

export function CodeView({ appId, code }: { appId: string; code: string }) {
  return (
    <div className="h-full">
      <PrivateRoomProvider id={`editor-${appId}`} initialPresence={{}}>
        <ClientSideSuspense fallback={<div>Loading...</div>}>
          {() => <CodeContainer appId={appId} code={code} />}
        </ClientSideSuspense>
      </PrivateRoomProvider>
    </div>
  )
}

function CodeContainer({ appId, code }: { appId: string; code: string }) {
  const broadcast: any = privateLiveRoomContext.useBroadcastEvent()

  React.useEffect(() => {
    broadcast({ type: "refresh" })
  }, [code])

  return (
    <>
      <button onClick={() => {}}>Send</button>
      <textarea className="h-full w-full rounded-xl border px-4 py-2">{code}</textarea>
    </>
  )
}
