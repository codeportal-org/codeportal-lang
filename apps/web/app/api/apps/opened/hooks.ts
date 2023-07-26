import { useAuth } from "@clerk/nextjs"
import { useSWRConfig } from "swr"

export const useTrackAppOpened = (appId: string) => {
  const { userId, getToken } = useAuth()
  const { mutate } = useSWRConfig()

  return async () => {
    if (!userId) return

    fetch("/api/apps/opened", {
      method: "POST",
      headers: { Authorization: `Bearer ${await getToken()}` },
      body: JSON.stringify({ id: appId, cc: 100 }),
    }).then(() => {
      mutate("/api/apps")
    })
  }
}
