"use client"

import { ClientSideSuspense } from "@liveblocks/react"

import Program from "@/components/engine/Program"
import { PrivateRoomProvider, privateLiveRoomContext } from "@/lib/liveblocks.config"

export function Editor({ appId }: { appId: string }) {
  return (
    <div className="h-full">
      <PrivateRoomProvider id={`editor-${appId}`} initialPresence={{}}>
        <ClientSideSuspense fallback={<div>Loading...</div>}>
          {() => <EditorContainer />}
        </ClientSideSuspense>
      </PrivateRoomProvider>
    </div>
  )
}

function EditorContainer() {
  const broadcast: any = privateLiveRoomContext.useBroadcastEvent()

  return (
    <div className="h-150">
      <Program />
    </div>
  )
}
