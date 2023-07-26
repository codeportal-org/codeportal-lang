import { DashboardHeader } from "./Header"

export const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <>
    <DashboardHeader />
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-10">{children}</div>
  </>
)
