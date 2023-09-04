import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import Script from "next/script"
import React from "react"

import { buildCode } from "@/core/codeRuntime"
import prisma from "@/lib/prisma"

import { ClientComp } from "./ClientComp"

export type SitePageProps = {
  params: { path: string[] }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: SitePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const path = params.path

  // temporarily the appId will be the subdomain before we allow custom subdomains
  const appId = path[0]

  const app = await prisma.application.findFirst({
    where: { id: appId },
    orderBy: { lastOpenedAt: "desc" },
  })

  if (!app) {
    return {
      title: "Not found",
    }
  }

  return {
    title: app.name,
    description: "Awesome app!",
  }
}

export async function SitePage({ params, searchParams }: SitePageProps) {
  console.log("SitePage", params, searchParams)

  const path = params.path

  // temporarily the appId will be the subdomain before we allow custom subdomains
  const appId = path[0]

  const app = await prisma.application.findFirst({
    where: { id: appId },
    orderBy: { lastOpenedAt: "desc" },
  })

  if (!app) {
    return notFound()
  }

  /*
   Server side code
  */

  // Interpreter runs and renders the site GG!
  const siteRender = await portalServerRenderer({ mainModule: app.mainModuleCodeTree })

  return (
    <>
      {siteRender}
      <ClientComp />
    </>
  )
}

export default SitePage

async function portalServerRenderer({ mainModule }: { mainModule: any }) {
  return (
    <Script type="module" id="mainModule">
      {mainModule?.code ? buildCode(mainModule?.code) : ""}
    </Script>
  )
}
