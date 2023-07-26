import { SignIn } from "@clerk/nextjs"

import { clerkAppearance } from "@/components/clerk"

const SignInPage = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      appearance={clerkAppearance}
      afterSignInUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      afterSignUpUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
    />
  </div>
)

export default SignInPage
