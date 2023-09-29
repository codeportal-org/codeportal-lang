import {
  SitePage,
  SitePageProps,
  generateMetadata as generateMetadataProd,
} from "app/(sites)/sites/[[...path]]/page"
import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import React from "react"

import { DevClientComp } from "./DevClientComp"

export type DevSitePageProps = Omit<SitePageProps, "isDev">

export async function generateMetadata(
  { params, searchParams }: DevSitePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  if (!params.path[0]) {
    return {
      title: "Not found",
    }
  }

  return generateMetadataProd(
    { params: { path: [params.path[0].replace("dev-", "")] }, searchParams },
    parent,
  )
}

export default async function DevSitePage({ params, searchParams }: DevSitePageProps) {
  if (!params.path[0]) {
    return notFound()
  }

  const appId = params.path[0].replace("dev-", "")

  const newPath = [...params.path]
  newPath[0] = appId

  const SitePageComp = await SitePage({
    params: { ...params, path: newPath },
    searchParams,
    isDev: true,
  })

  return (
    <>
      <div>{SitePageComp}</div>
      <DevClientComp appId={appId} />
    </>
  )
}
