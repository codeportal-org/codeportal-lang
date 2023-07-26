import { TestClientComponent } from "./TestClientComponent"

export default async function TestPage() {
  return (
    <div className="flex h-full justify-center p-10 text-lg">
      <div>Test page</div>
      <TestClientComponent />
    </div>
  )
}
