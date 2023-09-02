"use client"

import { useGetApp } from "app/api/apps/[appId]/hooks"
import { useTrackAppOpened } from "app/api/apps/opened/hooks"
import { useEffect } from "react"

import { Editor } from "@/core/Editor"

export default function AppPage({ params }: { params: { appId: string } }) {
  const trackAppOpened = useTrackAppOpened(params.appId)
  const getApp = useGetApp(params.appId)

  useEffect(() => {
    trackAppOpened()
  }, [])

  useEffect(() => {
    document.title = `${getApp.data?.name} - Code Portal`
  }, [getApp.data?.name])

  if (getApp.isLoading) {
    return (
      <div className="p-10">
        <div>Loading ...</div>
      </div>
    )
  }

  const appName = getApp.data?.name
  const appId = params.appId

  return <Editor appId={appId} appName={appName} />
}
