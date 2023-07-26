"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const Program = dynamic(() => import("@/components/engine/Program"), {
  ssr: false,
})

const YCApplicationPage = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [])

  return (
    <div className="flex h-full flex-col items-center pt-24">
      <p className="m-4">Hey YC! This is a very early prototype of the block-based editor.</p>
      <div className="h-2/3 w-4/5 overflow-auto rounded-lg border border-gray-200">
        {loading && <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" />}
        {!loading && <Program />}
      </div>
    </div>
  )
}

export default YCApplicationPage
