import { useClerkSWR, useClerkSWRMutation } from "@/lib/swr"

export const useUpdateTheme = (appId: string) =>
  useClerkSWRMutation<void, { theme: { color: "zinc" | "blue"; radius: string } }>(
    `/api/apps/${appId}/theme`,
    "PUT",
  )

export const useGetTheme = (appId: string) =>
  useClerkSWR<{ theme: { color: "zinc" | "blue"; radius: string } }>(`/api/apps/${appId}/theme`)
