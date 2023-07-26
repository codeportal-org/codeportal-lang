import { Application } from "@prisma/client"

import { useClerkSWR, useClerkSWRMutation } from "@/lib/swr"

import { NewAppFormData, NewAppResponse } from "./types"

export const useGetAppsQuery = () => useClerkSWR<Application[]>("/api/apps")

export const useNewApp = () => useClerkSWRMutation<NewAppResponse, NewAppFormData>("/api/apps")
