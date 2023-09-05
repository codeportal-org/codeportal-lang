"use client"

import { useGetApp } from "app/api/apps/[appId]/hooks"
import { useTrackAppOpened } from "app/api/apps/opened/hooks"
import { Code, Command, Database, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useCommandBarStore } from "@/components/CommandBar/store"
import { getPlatform } from "@/lib/platform"

export default function AppEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { appId: string }
}) {
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

  return (
    <div className="h-screen">
      <TopBar appName={appName || ""} appId={appId} />
      {children}
    </div>
  )
}

function TopBar({ appName, appId }: { appName: string; appId: string }) {
  const router = useRouter()
  const toggleCommandBar = useCommandBarStore((state) => state.toggle)

  return (
    <div className="flex h-8 items-center justify-between px-2">
      <div>
        <span>{appName}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="flex h-6 items-center gap-1 rounded px-2 hover:bg-slate-300"
          onClick={() => {
            router.push(`/dashboard/apps/${appId}`)
          }}
        >
          <Code className="h-4 w-4" />
          Code
        </button>
        <button
          className="flex h-6 items-center gap-1 rounded px-2 hover:bg-slate-300"
          onClick={() => {
            router.push(`/dashboard/apps/${appId}/data`)
          }}
        >
          <Database className="h-4 w-4" />
          Database
        </button>
        <button
          className="flex h-6 items-center gap-1 rounded px-2 hover:bg-slate-300"
          onClick={() => {
            toggleCommandBar()
          }}
        >
          <Command className="h-4 w-4" />
          <span className="flex items-baseline">
            Cmd bar (
            {getPlatform() === "Mac" ? (
              <kbd className="font-sans text-xs dark:text-slate-500">
                <abbr title="Command" className="text-slate-400 no-underline dark:text-slate-500">
                  ⌘
                </abbr>
                + K
              </kbd>
            ) : (
              <kbd className="font-sans text-xs dark:text-slate-500">
                <abbr title="Control" className="no-underline ">
                  Ctrl
                </abbr>
                + K
              </kbd>
            )}
            )
          </span>
        </button>
        <Link
          href="/dashboard"
          className="flex h-6 items-center gap-1 rounded  px-2  hover:bg-slate-300"
        >
          <LayoutGrid className="h-4 w-4" />
          Apps
        </Link>
      </div>
    </div>
  )
}
