/**
 * Handles outside an element clicks. Useful for popups, and other widgets.
 * Take from https://stackoverflow.com/questions/152975/how-do-i-detect-a-click-outside-an-element
 */
export function onClickOutside(
  staticElements: HTMLElement[],
  elementsFn: () => HTMLElement[],
  callback: (event: any) => void,
): () => void {
  const outsideClickListener = (event: any) => {
    const elements = elementsFn()
    if (
      elements.every(
        (element) => !element || (!element.contains(event.target) && isElementVisible(element)),
      ) &&
      staticElements.every((element) => !element || !element.contains(event.target))
    ) {
      removeClickListener()
      callback(event)
    }
  }

  const removeClickListener = () => {
    document.removeEventListener("click", outsideClickListener)
  }

  document.addEventListener("click", outsideClickListener)

  return removeClickListener
}

export const isElementVisible = (elem: HTMLElement): boolean =>
  !!elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
