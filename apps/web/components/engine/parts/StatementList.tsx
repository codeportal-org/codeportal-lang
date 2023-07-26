import { useDroppable } from "@dnd-kit/core"
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import React, { useState } from "react"

export const StatementList = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const containerID = React.useId()

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const handleMouseEnter = () => {
    if (!isHovered) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (isHovered) {
      setIsHovered(false)
    }
  }

  const containerClass = `relative flex flex-col ${
    isOpen ? "border-l border-code-delimiter pl-4" : ""
  }`
  const buttonClass = `group cursor-pointer ${
    isOpen
      ? `absolute left-0 top-0 ${isHovered ? "block" : "hidden"}`
      : "rounded hover:bg-code-empty-expression"
  }`

  return (
    <div className={containerClass} onMouseMove={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        aria-expanded={isOpen}
        aria-controls={containerID}
        className={buttonClass}
        onClick={toggleOpen}
      >
        {isOpen ? (
          <ChevronDownIcon className="fill-gray-400 group-hover:fill-gray-500" />
        ) : (
          <ChevronRightIcon className="fill-gray-400 group-hover:fill-gray-500" />
        )}
      </button>

      <div id={containerID} className={`mt-1 ${isOpen ? "block" : "hidden"}`}>
        {children}
      </div>
    </div>
  )
}
