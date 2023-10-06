import { CodeChangeMessage } from "./CodeChangeMessage"
import { CodeNode } from "./lang/codeTree"

class EditorEvents {
  private devIframe: HTMLIFrameElement | null = null

  setDevIframe(devIframe: HTMLIFrameElement) {
    this.devIframe = devIframe
  }

  refresh() {
    this.devIframe?.contentWindow?.postMessage({ type: "refresh" }, "*")
  }

  notifyCodeChange(nodeId: string, node: CodeNode | null) {
    let newNode = node

    if (node && node.meta) {
      newNode = { ...node }
      delete newNode.meta
    }

    this.devIframe?.contentWindow?.postMessage(
      { type: "codeChange", nodeId, node } satisfies CodeChangeMessage,
      "*",
    )
  }
}

export const editorEvents = new EditorEvents()
