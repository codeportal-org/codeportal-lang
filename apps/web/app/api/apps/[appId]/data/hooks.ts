import { ApplicationData } from "@prisma/client"

import { useClerkSWR } from "@/lib/swr"

export const useGetAppData = (appId: string) =>
  useClerkSWR<{ entries: Record<string, any>[] }>(`/api/apps/${appId}/data`)
