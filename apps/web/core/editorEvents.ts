class EditorEvents {
  private devIframe: HTMLIFrameElement | null = null

  setDevIframe(devIframe: HTMLIFrameElement) {
    this.devIframe = devIframe
  }

  refresh() {
    this.devIframe?.contentWindow?.postMessage({ type: "refresh" }, "*")
  }
}

export const editorEvents = new EditorEvents()
