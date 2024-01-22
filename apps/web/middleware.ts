import { authMiddleware } from "@clerk/nextjs"
import { NextFetchEvent, NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
}

const clerkMiddleware = authMiddleware()

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  console.log("middleware ---", request.nextUrl.pathname)

  const url = request.nextUrl

  const hostname = request.headers.get("host") || "demo.codeportal.io"
  console.log("hostname", hostname)

  const path = url.pathname

  // rewrite root application to `/home` folder
  if (
    hostname === "codeportal.test" ||
    hostname === "codeportal.io" ||
    hostname === "codeportal-bice.vercel.app" ||
    hostname === "localhost:8090"
  ) {
    // rewrites for dashboard pages
    if (path.startsWith("/dashboard")) {
      return clerkMiddleware(request, event)
    }

    // rewrites for api endpoints (api endpoint to be deprecated soon)
    if (path.startsWith("/api")) {
      return clerkMiddleware(request, event)
    }

    if (path === "/sign-in-redirect") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    // Reserved for future onboarding
    if (path === "/sign-up-redirect") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    return NextResponse.rewrite(new URL(`/home${path}`, request.url))
  }

  // not found
  return NextResponse.next()
}
