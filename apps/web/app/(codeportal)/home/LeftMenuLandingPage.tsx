"use client"

import { useUser } from "@clerk/nextjs"

import { Button } from "@/components/core/Button"

export const LeftMenuLandingPage = () => {
  const { isSignedIn, isLoaded } = useUser()

  return (
    <div>
      {!isLoaded && (
        <div className="animate-pulse">
          <div className="h-8 w-24 rounded-md bg-gray-200"></div>
        </div>
      )}
      {isLoaded && (
        <>
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
  )
}
