import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import React from "react"

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

  console.log(app)

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

  // Interpreter runs and renders the site

  return (
    <div style={{ padding: 40 }}>
      <h1 className="py-3 text-3xl text-blue-400">{app.name}</h1>
      <p>Site page ID: {params.path.join(" / ")}</p>
      <p>Search params: {JSON.stringify(searchParams)}</p>
      <ClientComp />
    </div>
  )
}

export default SitePage
