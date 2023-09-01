import React from "react"

interface KeywordProps {
  spaceRight?: boolean
}

export const Keyword = ({ spaceRight = true, children }: React.PropsWithChildren<KeywordProps>) => {
  const containerClass = `inline text-code-keyword ${spaceRight ? "mr-3" : ""}`

  return <div className={containerClass}>{children}</div>
}
