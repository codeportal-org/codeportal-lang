"use client"

import { useRouter } from "next/navigation"

export const Card = ({
  className,
  href,
  onClick,
  children,
}: {
  className?: string
  href?: string
  onClick?: () => void
  children?: React.ReactNode
}) => {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (onClick) {
          onClick()
          return
        }
        if (href) {
          router.push(href)
        }
      }}
      className={
        "flex h-80 w-60 cursor-pointer select-none flex-col items-center justify-center rounded-2xl border border-gray-300 bg-white hover:shadow-lg" +
        (className ? ` ${className}` : "")
      }
    >
      {children}
    </button>
  )
}
