import { Application } from "@prisma/client"

import { useClerkSWR } from "@/lib/swr"

export const useGetApp = (appId: string) => useClerkSWR<Application>(`/api/apps/${appId}`)
