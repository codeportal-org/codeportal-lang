import { CheckCircleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

import { CodePortalLogo } from "@/components/icons/logo"
import { MakerLaunchIllustration } from "@/components/illustrations/makerLaunch"

import { EarlyAccessButton } from "./EarlyAccessButton"
import { LeftMenuLandingPage } from "./LeftMenuLandingPage"

export default function Home() {
  return (
    <div className="h-screen">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link className="flex items-center" href="/">
          <CodePortalLogo />
          <div className="ml-1 text-xl font-bold text-gray-700">CodePortal (alpha)</div>
        </Link>

        <LeftMenuLandingPage />
      </header>

      <main>
        <div className="mx-auto flex max-w-4xl flex-col items-center px-2 text-gray-700">
          <h1 className="mb-8 mt-10 text-center text-3xl font-bold sm:text-5xl">
            Build, and iterate ideas <span className="text-primary-500">— faster!</span>
          </h1>

          <p className="mx-2 mb-8 max-w-3xl text-center text-lg sm:text-xl">
            CodePortal is visual programming platform for modern makers who are frustrated with the
            limitations of traditional programming and tooling. It empowers you to build digital
            product faster without losing the power of code.
          </p>
          <div className="mb-16 flex justify-center">
            <EarlyAccessButton>Join our closed alpha!</EarlyAccessButton>
          </div>

          <MakerLaunchIllustration className="h-auto w-full sm:w-96" />

          <div className="max-w-2xl px-2">
            <h2 className="mb-6 mt-16 text-center text-2xl font-bold sm:text-4xl">
              Build faster, iterate faster
            </h2>

            <ul className="mb-8 list-none pl-4 sm:pl-5">
              <li className="mb-4 flex text-lg leading-7">
                <CheckCircleIcon className="text-primary-500 mr-2 h-7 w-7 flex-shrink-0" />
                <span>
                  Iterate faster! CodePortal shortens the feedback loop and let{"'"}s you quickly
                  prototype without the hassle.
                </span>
              </li>
              <li className="mb-4 flex text-lg leading-7">
                <CheckCircleIcon className="text-primary-500 mr-2 h-7 w-7 flex-shrink-0" />
                <span>
                  Make your apps easier to build and to maintain. We focus on readability and
                  simplicity to keep you focused on what matters.
                </span>
              </li>
              <li className="mb-4 flex text-lg leading-7">
                <CheckCircleIcon className="text-primary-500 mr-2 h-7 w-7 flex-shrink-0" />
                <span>
                  Harness the power of AI! CodePortal is thought from the ground up to integrate
                  with LLMs.
                </span>
              </li>
            </ul>

            <div className="mb-14 flex justify-center">
              <EarlyAccessButton>Get early access!</EarlyAccessButton>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-primary-100 mt-8 flex flex-col items-center justify-center text-center">
        <div className="p-2 text-center">
          Copyright © 2023 LikableApps, Inc. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
