import { useClerkSWR, useClerkSWRMutation } from "@/lib/swr"

export const useSaveCode = (appId: string) =>
  useClerkSWRMutation<
    void,
    {
      code: string
      prompt: string
    }
  >(`/api/apps/${appId}/code`)

export const useGetCode = (appId: string) =>
  useClerkSWR<{
    code: string
    prompt: string
  }>(`/api/apps/${appId}/code`)
