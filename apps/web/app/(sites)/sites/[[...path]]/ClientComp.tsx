"use client"

import React from "react"

export function ClientComp() {
  React.useEffect(() => {
    console.log("---- client side code")
  }, [])

  return <>Client Comp</>
}
