import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

export const privateLiveClient: any = createClient({
  authEndpoint: "/api/live/auth",
})

export const privateLiveRoomContext: any = createRoomContext(privateLiveClient)

export const PrivateRoomProvider: any = privateLiveRoomContext.suspense.RoomProvider

export const publicLiveClient: any = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY || "",
})

export const publicLiveRoomContext: any = createRoomContext(publicLiveClient)

export const PublicRoomProvider: any = publicLiveRoomContext.suspense.RoomProvider
