import { CodeNode } from "./lang/codeTree"

export type CodeChangeMessage = {
  type: "codeChange"
  nodeId: string
  node: CodeNode | null
}
