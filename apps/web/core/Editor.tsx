"use client"

import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { useCompletion } from "ai/react"
import { useGetCode, useSaveCode } from "app/api/apps/[appId]/code/hooks"
import { useGetTheme, useUpdateTheme } from "app/api/apps/[appId]/theme/hooks"
import { Palette } from "lucide-react"
import React, { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { CommandBar } from "@/components/CommandBar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Chat from "./Chat"
import { CodeView } from "./CodeView"
import { editorEmitter } from "./editorSingleton"

export function Editor({ appId, appName }: { appId: string; appName?: string }) {
  const completionContainerRef = React.useRef<HTMLDivElement>(null)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  const [isLeftResizing, setIsLeftResizing] = useState(false)
  const [isRightResizing, setRightIsResizing] = useState(false)

  const codeQuery = useGetCode(appId)
  const saveCode = useSaveCode(appId)

  const [isFinished, setIsFinished] = useState(false)

  const { completion, input, handleInputChange, handleSubmit, isLoading, setInput } = useCompletion(
    {
      api: `/api/apps/${appId}/completion`,
      onResponse: (response) => {
        if (response.ok) {
          setIsFinished(false)
        }
      },
      onFinish: (prompt, completion) => {
        saveCode.trigger({ code: completion, prompt }).then(() => {
          setIsFinished(true)
        })
      },
    },
  )

  const prodAppURL = `${window.location.protocol}//${appId}.${window.location.host}`
  const devAppURL = `${window.location.protocol}//dev-${appId}.${window.location.host}`

  React.useEffect(() => {
    if (completionContainerRef.current) {
      completionContainerRef.current.scrollTop = completionContainerRef.current.scrollHeight
    }
  }, [completion])

  // Sets the initial prompt if there is one
  React.useEffect(() => {
    if (codeQuery.data?.prompt) {
      setInput(codeQuery.data.prompt)
    }
  }, [codeQuery.data?.prompt])

  return (
    <div className="overflow-hidden" style={{ height: "calc(100% - 32px)" }}>
      <PanelGroup direction="horizontal" disablePointerEventsDuringResize={true} className="h-full">
        <Panel defaultSize={20} minSize={15} className="pb-3 pl-2">
          <Chat
            isLoading={codeQuery.isLoading}
            existingPrompt={Boolean(codeQuery.data?.prompt)}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isProcessing={isLoading}
          />
        </Panel>
        <PanelResizeHandle
          className={
            "mb-3 ml-1 mr-1 flex w-3 cursor-ew-resize items-center justify-center rounded-lg transition-colors" +
            (isLeftResizing ? " bg-slate-300" : " hover:bg-slate-200")
          }
          onDragging={(isDragging) => {
            setIsLeftResizing(isDragging)
          }}
        >
          <div className="h-12 w-0.5 bg-gray-400"></div>
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={30} className="pb-3">
          <CodeView
            appId={appId}
            ref={completionContainerRef}
            isFinished={isFinished}
            code={
              completion !== ""
                ? completion
                : codeQuery.data && codeQuery.data.code !== null
                ? codeQuery.data.code
                : ""
            }
          />
        </Panel>
        <PanelResizeHandle
          className={
            "mb-3 ml-1 mr-1 flex w-3 cursor-ew-resize items-center justify-center rounded-lg transition-colors" +
            (isRightResizing ? " bg-slate-300" : " hover:bg-slate-200")
          }
          onDragging={(isDragging) => {
            setRightIsResizing(isDragging)
          }}
        >
          <div className="h-12 w-0.5 bg-gray-400"></div>
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={30} className="pb-3 pr-2">
          <div className="h-full overflow-hidden rounded-xl border border-slate-300 shadow-md">
            <div className="flex h-8 items-center  justify-center bg-slate-300 pl-4">
              <ThemePopover appId={appId} isLoading={codeQuery.isLoading} />
              <button
                className="mr-1 h-6 cursor-pointer rounded px-1 py-1 transition-colors hover:bg-slate-400"
                onClick={() => {
                  iframeRef.current?.contentWindow?.postMessage({ type: "refresh" }, "*")
                }}
              >
                <ArrowPathIcon className="h-full" />
              </button>
              <div className="mr-1 w-4/5 rounded-md bg-white px-2 py-1 text-sm">{devAppURL}</div>
              <a
                href={devAppURL}
                target="_blank"
                rel="noreferrer"
                className="h-6 cursor-pointer rounded px-1 py-1 transition-colors hover:bg-slate-400"
              >
                <ArrowTopRightOnSquareIcon className="h-full" />
              </a>
            </div>
            <iframe
              ref={iframeRef}
              src={devAppURL}
              title={appName || ""}
              className="w-full"
              style={{
                height: "calc(100% - 52px)",
              }}
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock"
            ></iframe>
            <div className="h-5 bg-slate-300"></div>
          </div>
        </Panel>
      </PanelGroup>

      <CommandBar
        commandList={[
          {
            title: "Open dev page (in new tab)",
            icon: <ArrowTopRightOnSquareIcon className="h-6" />,
            onSelect: () => {
              window.open(devAppURL, "_blank")
            },
          },
        ]}
      />
    </div>
  )
}

function ThemePopover({ appId, isLoading }: { appId: string; isLoading: boolean }) {
  const themeQuery = useGetTheme(appId)
  const updateTheme = useUpdateTheme(appId)

  const handleColorChanged = (color: "zinc" | "blue") => {
    updateTheme.trigger({ theme: { color } }).then(() => {
      editorEmitter.emit("refresh")
    })
  }

  const theme = themeQuery.data?.theme

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="mr-1 h-6 cursor-pointer rounded px-1 py-1 transition-colors hover:bg-slate-400">
          <Palette className="h-full" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Customize</h4>
            <p className="text-muted-foreground text-sm">
              Customize the look and feel of your app.
            </p>
          </div>
          <div className="grid gap-2">
            {isLoading && <div className="grid grid-cols-3 items-center gap-4">Loading...</div>}
            {!isLoading && (
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="theme">Theme</Label>
                <Select onValueChange={handleColorChanged} defaultValue={theme?.color || "zinc"}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" id="theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="zinc">
                        <div className="flex items-center gap-2">
                          Zinc
                          <div
                            style={{
                              backgroundColor: "hsl(240 5.9% 10%)",
                            }}
                            className="h-4 w-4 rounded"
                          ></div>
                        </div>
                      </SelectItem>
                      <SelectItem value="blue">
                        <div className="flex items-center gap-2">
                          Blue
                          <div
                            style={{
                              backgroundColor: "hsl(221.2 83.2% 53.3%)",
                            }}
                            className="h-4 w-4 rounded"
                          ></div>
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
