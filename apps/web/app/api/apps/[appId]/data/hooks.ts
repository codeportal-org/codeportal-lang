import { ApplicationData } from "@prisma/client"

import { useClerkSWR } from "@/lib/swr"

export const useGetAppData = (appId: string) =>
  useClerkSWR<{ entries: ApplicationData[] }>(`/api/apps/${appId}/data`)
