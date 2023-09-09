import { App } from "@/db/schema"
import { useClerkSWR, useClerkSWRMutation } from "@/lib/swr"

import { NewAppFormData, NewAppResponse } from "./types"

export const useGetAppsQuery = () => useClerkSWR<App[]>("/api/apps")

export const useNewApp = () => useClerkSWRMutation<NewAppResponse, NewAppFormData>("/api/apps")
