"use client"

import { useUser } from "@clerk/nextjs"

import { Button } from "@/components/core/Button"

export const EarlyAccessButton = ({ children }: { children?: React.ReactNode }) => {
  const { isSignedIn } = useUser()

  return (
    <Button size="lg" href={isSignedIn ? "/dashboard" : "/sign-up"}>
      {children}
    </Button>
  )
}
