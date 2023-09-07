"use client"

import Script from "next/script"
import React from "react"

import { buildCode, getStyles, getTailwindCode } from "@/core/codeRuntime"

export function ClientComp({ mainModule }: { mainModule: any }) {
  React.useEffect(() => {
    // console.log("---- client side code")
  }, [])

  return (
    <>
      <Script src="https://unpkg.com/tailwindcss-jit-cdn@1.3.0"></Script>
      <div
        id="root"
        className={mainModule?.theme ? `${mainModule?.theme?.color}-theme` : "zinc-theme"}
      ></div>
      <style jsx global id="main-styles">
        {`
          ${getStyles(mainModule?.theme)}
        `}
      </style>
      <Script type="module" id="tailwind-module">
        {getTailwindCode()}
      </Script>
      <Script type="tailwind-config" id="tailwind-config">{`window.tailwindConfig`}</Script>
      <Script type="module" id="mainModule">
        {mainModule?.code ? buildCode(mainModule?.code) : ""}
      </Script>
    </>
  )
}
