const devSitesChannel = new BroadcastChannel("dev-sites")

/**
 * Used for Dev Sites global events.
 */
class DevSitesEvents {
  onRefresh(callback: () => void): () => void {
    const refreshCallback = (event: MessageEvent) => {
      if (event.data.type === "refresh") {
        callback()
      }
    }
    devSitesChannel.addEventListener("message", refreshCallback)

    return () => {
      devSitesChannel.removeEventListener("message", refreshCallback)
    }
  }

  /**
   * Refreshes the editor on every development tab/instance in the same browser instance.
   */
  refresh() {
    devSitesChannel.postMessage({ type: "refresh" })
  }
}

export const devSitesEvents = new DevSitesEvents()
