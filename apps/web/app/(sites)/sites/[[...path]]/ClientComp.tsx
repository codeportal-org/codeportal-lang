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
    // console.log("---- client side code")
  }, [])

  return (
    <>
      <Script src="https://cdn.tailwindcss.com/3.3.3"></Script>
      <div id="root" className={theme ? `${theme?.color}-theme` : "zinc-theme"}></div>
      <style jsx global id="main-styles">
        {`
          ${getStyles(theme)}
        `}
      </style>
      <Script id="tailwind-module" type="module" defer>
        {getTailwindConfigCode()}
      </Script>
      <Script type="tailwind-config" id="tailwind-config">{`window.tailwindConfig`}</Script>
      <Script type="module" id="mainModule">
        {mainModule?.code ? buildCode(mainModule?.code) : ""}
      </Script>
    </>
  )
}
