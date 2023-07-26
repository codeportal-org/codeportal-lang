import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

export const privateLiveClient = createClient({
  authEndpoint: "/api/live/auth",
})

export const privateLiveRoomContext = createRoomContext(privateLiveClient)

export const PrivateRoomProvider = privateLiveRoomContext.suspense.RoomProvider

export const publicLiveClient = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY || "",
})

export const publicLiveRoomContext = createRoomContext(publicLiveClient)

export const PublicRoomProvider = publicLiveRoomContext.suspense.RoomProvider
