import { ThemeConfig } from "@/db/schema"
import { useClerkSWR, useClerkSWRMutation } from "@/lib/swr"

export const useUpdateTheme = (appId: string) =>
  useClerkSWRMutation<void, { theme: ThemeConfig }>(`/api/apps/${appId}/theme`, "PUT")

export const useGetTheme = (appId: string) =>
  useClerkSWR<{ theme: ThemeConfig }>(`/api/apps/${appId}/theme`)
