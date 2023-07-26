"use client"

import { SquaresPlusIcon } from "@heroicons/react/24/outline"
import { Command } from "carloslfu-cmdk-internal"
import { useRouter } from "next/navigation"
import React from "react"
import { tinykeys } from "tinykeys"

import { getPlatform } from "@/lib/platform"

import "./index.scss"
import { useCommandBarStore } from "./store"

export type CommandItemData = {
  title: string
  icon: React.ReactNode
  onSelect: () => void
}

export const CommandBar = ({ commandList }: { commandList: CommandItemData[] }) => {
  const isOpen = useCommandBarStore((state) => state.isOpen)
  const toggle = useCommandBarStore((state) => state.toggle)
  const router = useRouter()

  React.useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "$mod+k": () => {
        toggle()
      },
    })

    return () => {
      unsubscribe()
    }
  })

  const generalCommandList = [
    {
      title: "Go to dashboard",
      icon: <SquaresPlusIcon className="h-6" />,
      onSelect: () => {
        router.push("/dashboard")
      },
    },
  ]

  return (
    <Command.Dialog
      loop={true}
      open={isOpen}
      onOpenChange={toggle}
      label="Command bar"
      contentClassName="data-[state=open]:animate-contentShow fixed top-[20%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
      overlayClassName="bg-gray-200 data-[state=open]:animate-overlayShow fixed inset-0 opacity-40"
    >
      <Command.Input className="mb-2 w-full rounded-md border border-gray-200" />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        {[...commandList, ...generalCommandList].map((command, idx) => (
          <CommandItem
            key={idx}
            id={idx}
            icon={command.icon}
            onSelect={() => {
              command.onSelect()
              toggle()
            }}
          >
            {command.title}
          </CommandItem>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}

function CommandItem({
  id,
  icon,
  macShortcut,
  otherShortcut,
  children,
  onSelect,
}: {
  id: string | number
  icon: React.ReactNode
  macShortcut?: string
  otherShortcut?: string
  children?: React.ReactNode
  onSelect?: () => void
}) {
  const shortcut = getPlatform() === "Mac" && macShortcut ? macShortcut : otherShortcut

  return (
    <Command.Item
      key={id}
      className="flex cursor-pointer items-center rounded-md px-4 py-2 text-gray-400 transition-colors hover:bg-gray-100 data-[selected='true']:bg-gray-100"
      onSelect={onSelect}
    >
      <div className="flex-shrink-0">
        <div className="flex h-6 w-6 items-center justify-center text-gray-400">{icon}</div>
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{children}</div>
      </div>
      {shortcut && <div>{shortcut}</div>}
    </Command.Item>
  )
}
