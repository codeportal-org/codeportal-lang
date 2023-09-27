import { CodeNode } from "./lang/codeTree"

class EditorEvents {
  private devIframe: HTMLIFrameElement | null = null

  setDevIframe(devIframe: HTMLIFrameElement) {
    this.devIframe = devIframe
  }

  refresh() {
    this.devIframe?.contentWindow?.postMessage({ type: "refresh" }, "*")
  }

  notifyCodeChange(node: CodeNode) {
    const newNode = { ...node }

    delete newNode.meta

    this.devIframe?.contentWindow?.postMessage({ type: "codeChange", node }, "*")
  }
}

export const editorEvents = new EditorEvents()
