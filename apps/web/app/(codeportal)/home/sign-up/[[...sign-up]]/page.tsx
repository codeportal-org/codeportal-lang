import { SignUp } from "@clerk/nextjs"

import { clerkAppearance } from "@/components/clerk"

const SignUpPage = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
    <SignUp
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      appearance={clerkAppearance}
      afterSignInUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      afterSignUpUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
    />
  </div>
)

export default SignUpPage
