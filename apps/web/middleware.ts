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
      console.log("->>>> dashboard")

      return NextResponse.next()
    }

    // rewrites for api endpoints
    if (path.startsWith("/api")) {
      console.log("->>>> api")

      return clerkMiddleware(request, event)
      // return NextResponse.next()
    }

    console.log("->>>> root")
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

  /**
   * Sites section
   */

  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.codeportal.io`, "").replace(".codeportal-bice.vercel.app", "")
      : hostname
          .replace(`.codeportal.test`, "")
          .replace(`.0.0.0.0:8090`, "")
          .replace(".localhost:8090", "")

  // Just dev URLs start with dev-
  if (currentHost.startsWith("dev-")) {
    console.log("->>>> dev sites", `/dev-sites/${currentHost}${path}`, request.url)

    if (path.startsWith("/api")) {
      const oldUrl = new URL(request.url)
      const newUrl = new URL(`/dev-sites-api/${currentHost}${path}`, oldUrl.origin)
      newUrl.search = oldUrl.search
      return NextResponse.rewrite(newUrl)
    }

    const oldUrl = new URL(request.url)
    const newUrl = new URL(`/dev-sites/${currentHost}${path}`, oldUrl.origin)
    newUrl.search = oldUrl.search
    return NextResponse.rewrite(newUrl)
  }

  // Production sites

  if (path.startsWith("/api")) {
    const oldUrl = new URL(request.url)
    const newUrl = new URL(`/sites-api/${currentHost}${path}`, oldUrl.origin)
    newUrl.search = oldUrl.search
    return NextResponse.rewrite(newUrl)
  }

  console.log("->>>> sites", `/sites/${currentHost}${path}`, request.url)
  const oldUrl = new URL(request.url)
  const newUrl = new URL(`/sites/${currentHost}${path}`, oldUrl.origin)
  newUrl.search = oldUrl.search
  return NextResponse.rewrite(newUrl)
}
