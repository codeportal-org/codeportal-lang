"use client"

import Script from "next/script"
import React from "react"

import { buildCode, getStyles, getTailwindConfigCode } from "@/core/codeRuntime"
import { MainModule, ThemeConfig } from "@/db/schema"

export function ClientComp({
  mainModule,
  theme,
}: {
  mainModule: MainModule | null
  theme: ThemeConfig | null
}) {
  React.useEffect(() => {
    console.log("---- client side code")
  }, [])

  console.log("ClientComp---->")

  return <></>
}
