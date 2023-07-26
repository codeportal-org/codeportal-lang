"use client"

import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

import { CodePortalLogo } from "@/components/icons/logo"

export const DashboardHeader = () => {
  return (
    <>
      <div className="h-20">{/* Header spacer */}</div>
      <header className="fixed left-0 top-0 flex h-20 w-full items-center border-b border-gray-300 bg-white px-5">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link className="flex items-center" href="/dashboard">
            <CodePortalLogo />
            <div className="ml-1 text-xl font-bold text-gray-700">CodePortal</div>
          </Link>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </header>
    </>
  )
}
