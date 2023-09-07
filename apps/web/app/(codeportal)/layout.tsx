import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/react"

import "@/styles/globals.css"

export const metadata = {
  title: "CodePortal | Turn ideas into reality — faster!",
  description:
    "CodePortal is the open-source full-stack programming platform for indie hackers and makers!",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <link rel="shortcut icon" href="/favicon.png" />
        <body>{children}</body>
        <Analytics />
      </html>
    </ClerkProvider>
  )
}
