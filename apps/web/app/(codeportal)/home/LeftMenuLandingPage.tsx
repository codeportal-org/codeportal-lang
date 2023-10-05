"use client"

import { useUser } from "@clerk/nextjs"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Menu } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/Button"

export const LeftMenuLandingPage = () => {
  const { isSignedIn, isLoaded } = useUser()

  return (
    <>
      <div className="sm:hidden">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="rounded-md p-2 hover:bg-gray-200">
              <Menu size={24} className="text-gray-700" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="flex-col rounded-md bg-white py-2 shadow-lg">
            <DropdownMenu.Item className="text-gray-700 hover:bg-gray-100">
              {isSignedIn ? (
                <Link href="/dashboard" className="flex items-center px-3 py-2">
                  Go to dashboard
                </Link>
              ) : (
                <Link href="/sign-in" className="flex items-center px-3 py-2">
                  Sign in
                </Link>
              )}
            </DropdownMenu.Item>
            <DropdownMenu.Item className="text-gray-700 hover:bg-gray-100">
              <a
                href="https://github.com/codeportal-org/codeportal"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-2 py-1 text-gray-800 transition-colors hover:bg-gray-200"
              >
                <GitHubLogoIcon width={24} height={24} />
                Star us!
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        {!isLoaded && (
          <div className="animate-pulse">
            <div className="h-8 w-24 rounded-md bg-gray-200"></div>
          </div>
        )}
        {isLoaded && (
          <>
            <a
              href="https://github.com/codeportal-org/codeportal"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-gray-800 transition-colors hover:bg-gray-200"
            >
              <GitHubLogoIcon width={24} height={24} />
              Star us!
            </a>
            {isSignedIn ? (
              <Button size="sm" href="/dashboard">
                Go to dashboard
              </Button>
            ) : (
              <Button size="sm" href="/sign-in">
                Sign in
              </Button>
            )}
          </>
        )}
      </div>
    </>
  )
}
