"use client"

import { ClientSideSuspense } from "@liveblocks/react"
import { useCompletion } from "ai/react"
import { useState } from "react"

import { PrivateRoomProvider, privateLiveRoomContext } from "@/lib/liveblocks.config"

import Chat from "./Chat"

export function CodeView({ appId }: { appId: string }) {
  return (
    <div className="h-full">
      <PrivateRoomProvider id={`editor-${appId}`} initialPresence={{}}>
        <ClientSideSuspense fallback={<div>Loading...</div>}>
          {() => <CodeContainer appId={appId} />}
        </ClientSideSuspense>
      </PrivateRoomProvider>
    </div>
  )
}

function CodeContainer({ appId }: { appId: string }) {
  const broadcast: any = privateLiveRoomContext.useBroadcastEvent()

  const [code, setCode] = useState("")

  return (
    <div className="h-full rounded-xl border">
      Code viewer
      <div>{code}</div>
    </div>
  )
}

function buildCode(completion: string) {
  const processedCompletion = completion.trim().split("\n").slice(1, -1).join("\n")

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        rel="stylesheet"
      />
      <title>My app</title>
    </head>
    <body>
      <div id="root"></div>
      <!--
      JSPM Generator Import Map
      Edit URL: https://generator.jspm.io/#U2VhYGBmT85PSS3ILypJzGHIKMl1MNYz1DPUL0pNTC5hAJO6Kfm5DoYWekZ6BhABKAcASnBWMz4A
    -->
      <script type="importmap">
        {
          "imports": {
            "htm/react": "https://ga.jspm.io/npm:htm@3.1.1/react/index.module.js",
            "react": "https://ga.jspm.io/npm:react@18.2.0/dev.index.js",
            "react-dom": "https://ga.jspm.io/npm:react-dom@18.2.0/dev.index.js"
          },
          "scopes": {
            "https://ga.jspm.io/": {
              "htm": "https://ga.jspm.io/npm:htm@3.1.1/dist/htm.module.js",
              "scheduler": "https://ga.jspm.io/npm:scheduler@0.23.0/dev.index.js"
            }
          }
        }
      </script>

      <!-- ES Module Shims: Import maps polyfill for older browsers without import maps support (eg Safari 16.3) -->
      <script
        async
        src="https://ga.jspm.io/npm:es-module-shims@1.8.0/dist/es-module-shims.js"
        crossorigin="anonymous"
      ></script>

      <script type="module">
        import { html } from "htm/react"
        import * as react from "react"
        import ReactDOM from "react-dom"

        ${processedCompletion}
      </script>
    </body>
  </html>
  `
}
