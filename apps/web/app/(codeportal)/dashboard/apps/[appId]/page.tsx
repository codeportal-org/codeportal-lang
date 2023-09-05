"use client"

import { useGetApp } from "app/api/apps/[appId]/hooks"

import { Editor } from "@/core/Editor"

export default function AppPage({ params }: { params: { appId: string } }) {
  const getApp = useGetApp(params.appId)

  const appName = getApp.data?.name
  const appId = params.appId

  return <Editor appId={appId} appName={appName} />
}
