"use client"

import { ClientSideSuspense } from "@liveblocks/react"
import React from "react"

import { PublicRoomProvider, publicLiveRoomContext } from "@/lib/liveblocks.config"

export function DevClientComp({ appId }: { appId: string }) {
  React.useEffect(() => {
    console.log("---- client side code", appId)
  }, [])

  return (
    <PublicRoomProvider id={`editor-${appId}`} initialPresence={{}}>
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => (
          <div>
            {`editor-${appId}`}
            <LiveExperiment />
          </div>
        )}
      </ClientSideSuspense>
    </PublicRoomProvider>
  )
}

function LiveExperiment() {
  const [messageList, setMessageList] = React.useState<string[]>([])

  publicLiveRoomContext.useEventListener(({ connectionId, event }: any) => {
    console.log("--- event", connectionId, event)
    setMessageList((messageList) => [...messageList, event])
  })

  return (
    <div>
      <div>Client side component</div>
      {JSON.stringify(messageList)}
    </div>
  )
}
