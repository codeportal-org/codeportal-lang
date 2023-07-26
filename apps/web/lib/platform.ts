export function getPlatform() {
  if (navigator.platform.indexOf("Mac") != -1) {
    return "Mac"
  } else if (navigator.platform.indexOf("Win") != -1) {
    return "Windows"
  } else {
    return "Other"
  }
}
