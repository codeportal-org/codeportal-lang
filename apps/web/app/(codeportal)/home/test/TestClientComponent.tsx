"use client"

import React from "react"

export const TestClientComponent = () => {
  React.useEffect(() => {
    console.log("Test client component mounted")
  }, [])

  return (
    <div className="flex h-full justify-center p-10 text-lg">
      <div>Test client component</div>
      <button
        onClick={() => {
          console.log("Test client component button clicked")
        }}
      >
        Test Button
      </button>
    </div>
  )
}
