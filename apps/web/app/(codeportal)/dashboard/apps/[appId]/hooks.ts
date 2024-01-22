import { App } from "@/db/schema"
import { useClerkSWR } from "@/lib/swr"

export const useGetApp = (appId: string) => useClerkSWR<App>(`/api/apps/${appId}`)
