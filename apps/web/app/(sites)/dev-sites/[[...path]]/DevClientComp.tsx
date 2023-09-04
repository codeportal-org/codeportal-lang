"use client"

import { ClientSideSuspense } from "@liveblocks/react"
import React from "react"

import { PublicRoomProvider, publicLiveRoomContext } from "@/lib/liveblocks.config"

export function DevClientComp({ appId }: { appId: string }) {
  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "refresh") {
        window.location.reload()
      }
    })
  }, [])

  return (
    <PublicRoomProvider id={`editor-${appId}`} initialPresence={{}}>
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => <RealTimeListener />}
      </ClientSideSuspense>
    </PublicRoomProvider>
  )
}

function RealTimeListener() {
  publicLiveRoomContext.useEventListener(({ connectionId, event }: any) => {
    if (event.type === "refresh") {
      window.location.reload()
    }
  })

  return <></>
}
