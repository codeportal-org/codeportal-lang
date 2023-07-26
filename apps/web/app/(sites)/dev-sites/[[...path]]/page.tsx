import {
  SitePage,
  SitePageProps,
  generateMetadata as generateMetadataProd,
} from "app/(sites)/sites/[[...path]]/page"
import { Metadata, ResolvingMetadata } from "next"
import React from "react"

import { DevClientComp } from "./DevClientComp"

export async function generateMetadata(
  { params, searchParams }: SitePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return generateMetadataProd(
    { params: { path: [params.path[0].replace("dev-", "")] }, searchParams },
    parent,
  )
}

export default async function DevSitePage({ params, searchParams }: SitePageProps) {
  console.log("DevSitePage", params, searchParams)

  const appId = params.path[0].replace("dev-", "")

  const SitePageComp = await SitePage({ params: { path: [appId] }, searchParams })

  return (
    <div className="h-full">
      <div>{SitePageComp}</div>
      <DevClientComp appId={appId} />
    </div>
  )
}
