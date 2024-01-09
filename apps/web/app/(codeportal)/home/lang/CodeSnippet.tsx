import { importJS } from "@/core/lang/js-interop/importJS"

import { CodeSnippetClient } from "./CodeSnippet.client"

export function CodeSnippet({ code }: { code: string }) {
  const codeTree = importJS(code)

  return <CodeSnippetClient codeTree={codeTree} />
}
