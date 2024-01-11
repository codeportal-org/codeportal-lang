import { RedirectToSignIn, SignedIn, SignedOut, currentUser } from "@clerk/nextjs"
import React from "react"

import { PageContainer } from "./PageContainer"
import { WelcomeSVG } from "./WelcomeSVG"

export default async function DashboardEntry({ children }: { children: React.ReactNode }) {
  const user = await currentUser()

  const isInvited = (user?.publicMetadata.isInvited as boolean) || false

  return (
    <>
      <SignedIn>
        <DashboardLayout isInvited={isInvited}>{children}</DashboardLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function DashboardLayout({
  children,
  isInvited,
}: {
  children: React.ReactNode
  isInvited: boolean
}) {
  return (
    <div className="h-screen">
      {isInvited ? (
        children
      ) : (
        <PageContainer>
          <div className="flex flex-col items-center">
            <div className="flex max-w-2xl flex-col items-center px-2">
              <p className="mb-5 max-w-lg text-center text-xl leading-relaxed">
                You are in the closed alpha waitlist!
                <br /> We will get in touch with you soon!
              </p>
              <div className="max-w-md overflow-hidden">
                <WelcomeSVG />
              </div>
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  )
}
