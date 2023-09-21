"use client"

import React from "react"

import { devSitesEvents } from "./devSitesEvents"

export function DevClientComp({ appId }: { appId: string }) {
  React.useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      if (event.data.type === "refresh") {
        devSitesEvents.refresh()
        window.location.reload()
      }
    }

    window.addEventListener("message", messageListener)

    const unsubscribeOnRefresh = devSitesEvents.onRefresh(() => {
      window.location.reload()
    })

    const globalClickHandler = () => {
      // forward click to parent to close theme popover
      parent.postMessage({ type: "child-app-click" }, "*")
    }
    document.addEventListener("click", globalClickHandler)

    return () => {
      window.removeEventListener("message", messageListener)
      unsubscribeOnRefresh()
      document.removeEventListener("click", globalClickHandler)
    }
  }, [])

  return (
    <>
      <button
        onClick={() => {
          devSitesEvents.refresh()
        }}
      >
        Refresh
      </button>
    </>
  )
}
