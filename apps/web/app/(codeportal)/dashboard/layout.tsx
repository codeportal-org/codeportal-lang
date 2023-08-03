"use client"

import { RedirectToSignIn, SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import React from "react"

import { PageContainer } from "./PageContainer"

export default function DashboardEntry({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <DashboardLayout>{children}</DashboardLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const isInvited = user?.publicMetadata.isInvited

  return (
    <div className="h-screen">
      {isInvited || !user ? (
        children
      ) : (
        <PageContainer>
          <div className="flex flex-col items-center">
            <div className="flex max-w-2xl flex-col items-center px-2">
              {
                <p className="mb-5 max-w-lg text-center text-xl leading-relaxed">
                  You are in the closed alpha waitlist!
                  <br /> We will get in touch with you soon!
                </p>
              }
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  )
}
