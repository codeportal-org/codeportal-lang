import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import cx from "classnames"
import { useAtom } from "jotai"
import React from "react"

import { useBlockDB } from "./BlockDBContext"
import { DropIndicatorPosition, useProgramUIState } from "./ProgramUIContext"
import { blockDefinition } from "./blockDefinitions"
import { EmptyBlock } from "./parts/EmptyBlock"
import { Keyword } from "./parts/Keyword"
import { StatementList } from "./parts/StatementList"

export const Block = ({
  blockID,
  onPartResize,
  overlay,
  root,
}: {
  blockID: string
  onPartResize?: () => void
  overlay?: boolean
  root?: boolean
}) => {
  const [isBlockHovered, setIsBlockHovered] = React.useState(false)
  const [isWidgetHovered, setIsWidgetHovered] = React.useState(false)

  const blockDB = useBlockDB()
  const [programUIState, setProgramUIState] = useProgramUIState()

  const active = programUIState.activeBlockID === blockID
  const dropIndicatorPresent = programUIState.dropBlockID === blockID
  const dropIndicatorPosition = programUIState.dropIndicatorPosition

  const blockAtom = React.useMemo(() => blockDB && blockDB.getAtomByID(blockID), [blockDB, blockID])

  const [blockAST] = useAtom(blockAtom!)

  const blockDef = blockAST ? blockDefinition[blockAST.name] : null

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: blockID,
    data: { type: blockDef?.type },
    disabled: root,
  })

  const droppable = useDroppable({
    id: blockID,
    data: { type: blockDef?.type },
    disabled: root,
  })

  const isWidgetOpen = isBlockHovered || isWidgetHovered

  function handleChildrenResize() {
    // if (blockDOMElement && widgetDOMElement) {
    //   placeWidget(blockDOMElement, widgetDOMElement)
    // }
    // dispatch("block-resize", blockID)
  }

  return (
    <div
      className={cx(
        "text-code-name relative w-fit cursor-grab select-none rounded bg-white leading-none transition-colors",
        isWidgetOpen ? " bg-code-bg-hover" : "",
        blockDef && blockDef.inline
          ? " inline-block"
          : blockDef?.name !== "empty statement"
          ? " pt-1"
          : "",
        {
          "shadow-2xl": overlay,
          "opacity-50": active && overlay,
        },
      )}
      ref={(ref) => {
        setNodeRef(ref)
        droppable.setNodeRef(ref)
      }}
      {...listeners}
      {...attributes}
      // bind:this="{blockDOMElement}"
      // on:mousemove="{(event) => {
      //   if (event.defaultPrevented) {
      //     return
      //   }

      //   event.preventDefault()
      //   if (!isBlockHovered) {
      //     isBlockHovered = true
      //   }
      // }}"
      // on:mouseleave="{() => {
      //   if (isBlockHovered) {
      //     isBlockHovered = false
      //   }
      // }}"
    >
      {!overlay && !active && dropIndicatorPresent && dropIndicatorPosition && (
        <DropIndicator position={dropIndicatorPosition} />
      )}
      {blockAST === undefined ? (
        <div>
          The block doesn{`'`}t exist, id: {blockID}
        </div>
      ) : blockDef === null ? (
        <div>The block type is not supported {blockAST.name}</div>
      ) : (
        blockDef.parts.map((part, index) => {
          if (part.type === "group") {
            return (
              <div
                key={index}
                className={
                  "flex items-baseline" +
                  (blockDef.inline ? "" : blockDef?.name !== "empty statement" ? " px-2 pb-1" : "")
                }
              >
                {part.parts.map((subPart, index) => {
                  if (subPart.type === "keyword") {
                    return (
                      <Keyword key={index} spaceRight={subPart.spaceRight}>
                        {subPart.text}
                      </Keyword>
                    )
                  } else if (subPart.type === "expression") {
                    if (blockAST.refs[subPart.name]) {
                      return (
                        <Block
                          key={index}
                          blockID={blockAST.refs[subPart.name]}
                          onPartResize={handleChildrenResize}
                        />
                      )
                    }
                  } else if (subPart.type === "empty expression") {
                    return (
                      <EmptyBlock
                        key={index}
                        type="expression"
                        blockID={blockID}
                        onPartResize={handleChildrenResize}
                      />
                    )
                  } else if (subPart.type === "empty statement") {
                    return (
                      <EmptyBlock
                        key={index}
                        type="statement"
                        blockID={blockID}
                        onPartResize={handleChildrenResize}
                      />
                    )
                  } else if (subPart.type === "statement list") {
                    return (
                      <StatementList key={subPart.name}>
                        {(blockAST.refs[subPart.name] as string[]).map((subBlockID) => (
                          <Block
                            key={subBlockID}
                            blockID={subBlockID}
                            onPartResize={handleChildrenResize}
                          />
                        ))}
                      </StatementList>
                    )
                  } else if (subPart.type === "text input") {
                    // <TextInput blockID="{blockID}" />
                    return <div key={index}>text</div>
                  } else if (subPart.type === "number input") {
                    return <div key={index}>number</div>
                  }
                })}
              </div>
            )
          }
        })
      )}
    </div>
  )
}

const DropIndicator = ({ position }: { position: DropIndicatorPosition }) => {
  return position === "middle" ? (
    <div className={"absolute left-0 h-full w-1"}>
      <div className="bg-primary-400 h-full w-full"></div>
    </div>
  ) : (
    <div className={cx("absolute h-1 w-full", position === "before" ? "top-0" : "bottom-0")}>
      <div className="bg-primary-400 h-full w-full"></div>
    </div>
  )
}
