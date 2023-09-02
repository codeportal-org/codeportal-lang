import { useClerkSWR, useClerkSWRMutation } from "@/lib/swr"

export const useSaveCode = (appId: string) =>
  useClerkSWRMutation<void, { code: string }>(`/api/apps/${appId}/code`)

export const useGetCode = (appId: string) =>
  useClerkSWR<{ code: string }>(`/api/apps/${appId}/code`)
