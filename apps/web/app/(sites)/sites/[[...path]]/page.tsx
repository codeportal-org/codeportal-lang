import { desc, eq } from "drizzle-orm"
import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import React from "react"

import { ComponentNode, interpretComponent } from "@/core/interpreter"
import { db, schema } from "@/db/index"
import { MainModule } from "@/db/schema"

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

  const appId = path[0]!

  const app = await db.query.apps.findFirst({
    where: eq(schema.apps.id, appId),
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

  const appId = path[0]!

  const app = await db.query.apps.findFirst({
    where: eq(schema.apps.id, appId),
  })

  if (!app) {
    return notFound()
  }

  /*
   Server side code
  */

  // const siteRender = await portalServerRenderer({ mainModule: app.mainModule })

  return (
    <>
      {/* {siteRender} */}
      {/* <ClientComp mainModule={app.mainModule} theme={app.theme} /> */}
    </>
  )
}

export default SitePage

async function portalServerRenderer({
  mainModule,
}: {
  mainModule: MainModule | null
}): Promise<React.ReactNode> {
  if (!mainModule) {
    return <></>
  }

  const code: ComponentNode = mainModule.code

  return interpretComponent(code)
}
