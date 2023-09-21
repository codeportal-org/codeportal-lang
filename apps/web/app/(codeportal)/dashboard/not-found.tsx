import Link from "next/link"

import { Button } from "@/components/Button"

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center gap-3 p-10">
      <h2 className="text-primary-500 text-3xl font-bold">App not Found</h2>
      <p className="text-xl">Sorry, we couldn't find the app you're looking for.</p>

      <Button href="/dashboard">Go to dashboard</Button>
    </div>
  )
}
