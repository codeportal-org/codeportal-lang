"use client"

import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxPopover,
  ComboboxProvider,
  useComboboxStore,
} from "@ariakit/react"
import {
  CollisionDescriptor,
  CollisionDetection,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core"
import {
  DndContext,
  DragOverEvent,
  DragOverlay,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { useVirtualizer } from "@tanstack/react-virtual"
import { atom, useAtom } from "jotai"
import { ChevronDown, ChevronRight, HelpCircle, PencilRuler, Square, Type, X } from "lucide-react"
import { matchSorter } from "match-sorter"
import React, { PointerEvent } from "react"
import ContentEditable from "react-contenteditable"
import { createPortal } from "react-dom"
import TextareaAutosize from "react-textarea-autosize"
import sanitizeHtml from "sanitize-html"

import { cn, isTouchEnabled } from "@/lib/utils"

import { CodeDB } from "./lang/codeDB"
import { useCodeDB, useNode } from "./lang/codeDBContext"
import {
  CodeNode,
  EmptyNode,
  ExpressionNode,
  FunctionNode,
  IfStatementNode,
  NAryExpression,
  NumberLiteral,
  ProgramNode,
  ReferenceNode,
  StateChangeNode,
  StateStatement,
  StatementNode,
  StringLiteral,
  UINode,
  UIStyleNode,
  UITextNode,
  VarStatement,
  areNodeTypesCompatible,
  baseNodeMetaList,
  isNodeKind,
  statementTypes,
  uiNodeTypes,
} from "./lang/codeTree"
import {
  TailwindShade,
  generateTailwindClassesData,
  tailwindColorPalette,
  tailwindDataMap,
} from "./tailwindData"

type DropData = { type: CodeNode["type"] }

const draggedNodeIdAtom = atom<string | null>(null)

const droppedOnNodeIdAtom = atom<string | null>(null)

export const indentationClass = "pl-6"

export const CodeTreeView = ({ codeTree }: { codeTree: ProgramNode | null }) => {
  const codeDB = useCodeDB()

  const pointerSensor = useSensor(CustomPointerSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: isTouchEnabled()
      ? {
          delay: 250,
          tolerance: 5,
        }
      : {
          distance: 10,
        },
  })
  const keyboardSensor = useSensor(CustomKeyboardSensor)

  const sensors = useSensors(pointerSensor, keyboardSensor)

  const [isCodeLoadedInDB, setIsCodeLoadedInDB] = React.useState(() => codeDB?.isCodeLoaded)

  const [draggedNodeId, setDraggedNodeId] = useAtom(draggedNodeIdAtom)

  const [droppedOnNodeId, setDroppedOnNodeId] = useAtom(droppedOnNodeIdAtom)

  const draggedNode = draggedNodeId ? codeDB?.getNodeByID(draggedNodeId) : null

  const handleDragStart = ({ active }: DragStartEvent) => {
    console.log("drag start")

    setDraggedNodeId(active.id as string)
    setDroppedOnNodeId(null)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    console.log("drag over", over?.id)
    setDroppedOnNodeId(over?.id as string)
  }

  const handleDragEnd = ({ over }: DragEndEvent) => {
    if (!droppedOnNodeId || !draggedNode) {
      return
    }

    const [targetParentId, targetProperty, targetIndexStr] = droppedOnNodeId.split("-")

    const targetIndex = Number(targetIndexStr)
    const targetParent = codeDB?.getNodeByID(targetParentId!)

    codeDB?.moveNodeFromListToList(
      draggedNode! as StatementNode,
      targetParent! as StatementNode,
      targetProperty!,
      targetIndex,
    )

    setDraggedNodeId(null)

    setDroppedOnNodeId(null)
  }

  const handleDragCancel = () => {
    console.log("drag cancel")
    setDraggedNodeId(null)

    setDroppedOnNodeId(null)
  }

  React.useEffect(() => {
    setIsCodeLoadedInDB(codeDB?.isCodeLoaded)

    console.log("***** codeDB?.onCodeLoaded")
    const unsubscribe = codeDB?.onCodeLoaded(() => {
      console.log("***** code loaded ----")
      setIsCodeLoadedInDB(true)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  if (!codeTree || !isCodeLoadedInDB) return <div>loading...</div>

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestTopRightCorner(codeDB)}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[clampModifier]}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <div className="h-full w-full overflow-auto whitespace-pre-wrap rounded-xl border px-4 py-2">
        {codeTree.type === "program" &&
          codeTree.body.map((node) => {
            return <StatementView nodeId={node.id} key={node.id} />
          })}
      </div>
      {createPortal(
        <DragOverlay>
          {draggedNode ? (
            uiNodeTypes.includes(draggedNode.type) ? (
              <UINodeView nodeId={draggedNode.id} isOverlay={true} />
            ) : draggedNode.type === "empty" ? (
              <EmptyNodeView nodeId={draggedNode.id} />
            ) : (
              <StatementView nodeId={draggedNode.id} isOverlay={true} />
            )
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}

export const StatementView = ({ nodeId, isOverlay }: { nodeId: string; isOverlay?: boolean }) => {
  const node = useNode<StatementNode>(nodeId)

  if (!node) return null

  let statementView: React.ReactNode

  if (node.type === "component") {
    statementView = (
      <>
        <div className="flex flex-row">
          <span className="text-code-keyword">component</span>
          <span className="pl-1">{/* spacer */}</span>
          <span className="text-code-callable"> {node.name} </span>
          <div className="text-gray-500">
            {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
          </div>
        </div>
        <div className="pt-1">{/* spacer */}</div>
        <NodeList
          nodeId={node.id}
          parentProperty="body"
          nodes={node.body}
          Component={StatementView}
        />
      </>
    )
  } else if (node.type === "function") {
    statementView = <FunctionView node={node} />
  } else if (node.type === "if") {
    statementView = <IfStatementView nodeId={node.id} />
  } else if (node.type === "var") {
    statementView = <VariableStatementView nodeId={node.id} />
  } else if (node.type === "return") {
    statementView = (
      <div className="flex flex-row gap-1.5">
        <span className="text-code-keyword">return</span>
        <ExpressionView nodeId={node.arg.id} />
      </div>
    )
  } else if (node.type === "state") {
    statementView = <StateStatementView nodeId={node.id} />
  } else if (node.type === "state change") {
    statementView = <StateChangeView node={node} />
  } else if (node.type === "empty" && node.kind === "statement") {
    statementView = <EmptyNodeView nodeId={node.id} />
  } else {
    statementView = (
      <div>
        unknown statement type: <span className="text-red-500">{node.type}</span>
      </div>
    )
  }

  return (
    <DraggableNodeContainer nodeId={nodeId} isOverlay={isOverlay}>
      {statementView}
      {/* {node.type === "expression" && <ExpressionView node={node.expression} />} */}
    </DraggableNodeContainer>
  )
}

export const VariableStatementView = ({ nodeId }: { nodeId: string }) => {
  const node = useNode<VarStatement>(nodeId)

  return (
    <div className="flex flex-row gap-1.5">
      <span className="text-code-keyword">var</span>
      <span
        className={cn(
          "text-code-name rounded-md bg-gray-100 px-1 transition-colors hover:bg-gray-200",
          {
            "bg-gray-200": node.meta?.ui?.isHovered,
          },
        )}
      >
        {node.name}
      </span>
      <span className="text-code-symbol">=</span>

      <ExpressionView nodeId={node.value.id} />
    </div>
  )
}

export const StateStatementView = ({ nodeId }: { nodeId: string }) => {
  const node = useNode<StateStatement>(nodeId)
  const codeDB = useCodeDB()

  return (
    <div className="flex flex-row gap-1.5">
      <span className="text-code-keyword ">state</span>
      <EditableNodeName nodeId={nodeId} />
      <span className="text-code-symbol">=</span>

      <ExpressionView nodeId={node.value.id} />
    </div>
  )
}

export const ExpressionView = ({ nodeId }: { nodeId: string }) => {
  const node = useNode<ExpressionNode>(nodeId)

  if (!node) return null

  if (node.type === "string") {
    return <StringView node={node} />
  } else if (node.type === "number") {
    return <NumberView node={node} />
  } else if (node.type === "boolean") {
    return <BooleanView node={node} />
  } else if (node.type === "function") {
    return <FunctionView node={node} />
  } else if (node.type === "ref") {
    return <ReferenceView nodeId={node.id} />
  } else if (node.type === "nary") {
    return <NaryExpressionView node={node} />
  } else if (node.type === "empty") {
    return <EmptyNodeView nodeId={node.id} />
  } else if (node.type === "state change") {
    return <StateChangeView node={node} />
  } else if (uiNodeTypes.includes(node.type)) {
    return <UINodeView nodeId={node.id} />
  } else {
    return <div>unknown expression type: {node.type}</div>
  }
}

export const UINodeView = ({ nodeId, isOverlay }: { nodeId: string; isOverlay?: boolean }) => {
  const node = useNode<UINode>(nodeId)
  const codeDB = useCodeDB()

  const isHovered = node.meta?.ui?.isHovered
  const isSelected = node.meta?.ui?.isSelected

  let uiNodeView: React.ReactNode

  if (node.type === "ui text") {
    uiNodeView = <UITextView nodeId={node.id} />
  } else if (node.type === "ui element") {
    uiNodeView = (
      <div className="flex flex-col">
        <div className="text-code-ui-element-name relative flex items-center gap-1.5">
          {node.name === "div" ? (
            <>
              <Square size={16} className="text-code-name" />
              Box
            </>
          ) : node.name === "p" ? (
            "Paragraph"
          ) : node.name.startsWith("h") && !isNaN(Number(node.name[1])) ? (
            `Heading ${node.name[1]}`
          ) : (
            node.name
          )}

          {(isHovered || isSelected) && node.style === undefined && (
            <>
              <div className="pl-0.5">{/* spacer */}</div>
              <div className="flex items-center gap-1.5">
                <button
                  className="text-code-ui-element-name transition-color rounded-md bg-gray-100 px-1 hover:bg-gray-200"
                  onClick={(event) => {
                    event.preventDefault()

                    codeDB?.updateNode(nodeId, {
                      style: [],
                    })
                  }}
                >
                  add style
                </button>
              </div>
            </>
          )}
        </div>
        {node.style !== undefined && <StylesView nodeId={node.id} style={node.style} />}
        {node.props && (
          <div className={indentationClass}>
            <div className={cn("flex flex-col gap-1.5 text-gray-500", indentationClass)}>
              {node.props.map((prop) =>
                prop.type === "ui prop" ? (
                  <div key={prop.id} className="flex flex-wrap gap-2">
                    <div className="col-span-1">{prop.name}:</div>
                    <div className="col-span-4">
                      <ExpressionView nodeId={prop.value.id} />
                    </div>
                  </div>
                ) : (
                  <div key={prop.id} className="flex flex-wrap gap-2">
                    <div className="col-span-1">... spread</div>
                    <div className="col-span-4">
                      <ExpressionView nodeId={prop.arg.id} />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
        {node.children && (
          <>
            <div className="pt-1">{/* spacer */}</div>
            <NodeList
              nodeId={node.id}
              parentProperty="children"
              nodes={node.children}
              Component={UINodeView}
            />
          </>
        )}
      </div>
    )
  } else if (node.type === "ui expression") {
    uiNodeView = (
      <div className="flex flex-row gap-1.5">
        {"{"}
        <ExpressionView nodeId={node.expression.id} />
        {"}"}
      </div>
    )
  } else if (node.type === "empty" && node.kind === "ui") {
    uiNodeView = <EmptyNodeView nodeId={node.id} />
  } else {
    uiNodeView = (
      <div>
        unknown ui node type: <span className="text-red-500">{node.type}</span>
      </div>
    )
  }

  return (
    <DraggableNodeContainer nodeId={nodeId} isOverlay={isOverlay}>
      {uiNodeView}
    </DraggableNodeContainer>
  )
}

export const StylesView = ({ nodeId, style }: { nodeId: string; style: UIStyleNode[] }) => {
  const node = useNode<CodeNode>(nodeId)
  const codeDB = useCodeDB()
  const [isOpen, setIsOpen] = React.useState(true)
  const containerID = React.useId()

  const [isComboboxOpen, setIsComboboxOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const comboboxStore = useComboboxStore({
    resetValueOnHide: true,
    setValue: (value) => {
      React.startTransition(() => {
        setSearchValue(value)
        setTimeout(() => {
          // Hack to select the first item, there should be another way to do this with the combobox API
          // Maybe we can dedupe it to improve the dev experience and make it not flash
          comboboxStore.move(comboboxStore.down())
        }, 100)
      })
    },
    focusLoop: false,
    setOpen: (isOpen) => {
      setIsComboboxOpen(isOpen)
    },
    open: isComboboxOpen,
  })

  const tailwindStyles = React.useMemo(
    () =>
      generateTailwindClassesData().map((style) => ({
        value: style.className,
        name: style.data.name,
        tag: style.data.tag,
        args: style.args,
        prefix: style.prefix,
        data: style.data,
      })),
    [],
  )

  const matches = React.useMemo(
    () =>
      matchSorter(tailwindStyles, searchValue, {
        keys: ["value", "title"],
        baseSort: (a, b) => (a.index > b.index ? 1 : -1),
      }),
    [searchValue],
  )

  const virtualizedListContainerRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: matches.length,
    getScrollElement: () => virtualizedListContainerRef.current,
    estimateSize: () => 28,
  })

  return (
    <div className={indentationClass}>
      <div className={indentationClass}>
        <div className="flex gap-1">
          <button
            aria-expanded={isOpen}
            aria-controls={containerID}
            className="flex cursor-pointer items-center gap-1.5 via-slate-100"
            onClick={(event) => {
              event.preventDefault()

              if (style.length === 0) {
                // remove node list if empty
                codeDB?.updateNode(nodeId, {
                  style: undefined,
                })
              } else {
                setIsOpen(!isOpen)
              }
            }}
          >
            {isOpen ? (
              <ChevronDown className="text-gray-400 transition-colors hover:text-gray-500" />
            ) : (
              <ChevronRight className="text-gray-400 transition-colors hover:text-gray-500" />
            )}
            <PencilRuler size={16} className="text-code-constant" />
          </button>
          {/* Style Autocomplete */}
          <div className={isOpen ? "block" : "hidden"}>
            <Combobox
              store={comboboxStore}
              placeholder="..."
              className="w-full max-w-sm border-0 p-0 pl-1 focus-visible:ring-0"
              autoFocus
            />
            <ComboboxPopover
              store={comboboxStore}
              gutter={4}
              className="z-50 h-72 w-72 overflow-auto rounded-sm border border-gray-300 bg-white px-1 py-1"
            >
              <ComboboxList
                store={comboboxStore}
                ref={virtualizedListContainerRef}
                className="h-full w-full overflow-auto"
              >
                {matches.length !== 0 ? (
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                      const match = matches[virtualItem.index]!

                      return (
                        <ComboboxItem
                          store={comboboxStore}
                          key={match.value}
                          value={match.value}
                          className="flex items-center justify-between rounded-sm px-1 transition-colors hover:bg-gray-100 data-[active-item]:bg-gray-200"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                          onClick={() => {
                            console.log("clicked", match)

                            const newNode = codeDB?.newNodeFromType<UIStyleNode>("ui style", {
                              name: match.name,
                              tag: match.tag,
                              args: match.args,
                              prefix: match.prefix,
                            })!

                            codeDB?.addStyleToList(nodeId, "style", newNode)
                          }}
                        >
                          {/* Left container */}
                          <div
                            className={cn("flex items-center gap-1.5", {
                              "w-1/3":
                                match.data.useScale &&
                                match.args &&
                                typeof match.args[0] === "object",
                            })}
                          >
                            {match.data.useColors && (
                              <div
                                className="ml-1 h-4 w-4 rounded-sm border shadow-sm"
                                style={
                                  match.args !== undefined
                                    ? {
                                        backgroundColor: tailwindColorPalette.find(
                                          (color) => match.args && color.name === match.args[0],
                                        )?.shades[match.args[1] as TailwindShade],
                                      }
                                    : {}
                                }
                              />
                            )}

                            {match.value}
                          </div>

                          {/* Right container */}
                          {match.data.useScale &&
                            match.args &&
                            typeof match.args[0] === "object" && (
                              <div className="flex w-2/3">
                                <div className="w-1/2 border-l border-gray-400 text-center">
                                  {match.args[0].pixels} px
                                </div>
                                <div className="w-1/2 border-l border-gray-400 text-center">
                                  {match.args[0].size}
                                </div>
                              </div>
                            )}
                        </ComboboxItem>
                      )
                    })}
                  </div>
                ) : (
                  <div className="no-results">No results found</div>
                )}
              </ComboboxList>
            </ComboboxPopover>
          </div>
        </div>
        <div
          id={containerID}
          className={cn("flex-col items-start", indentationClass, isOpen ? "flex" : "hidden")}
        >
          <div className="pt-1">{/* spacer */}</div>
          <div className="flex flex-wrap gap-1.5 text-gray-500">
            {style.map((styleNode) => (
              <StyleNodeView nodeId={styleNode.id} key={styleNode.id} />
            ))}
          </div>
          <div className="pt-1">{/* spacer */}</div>
        </div>
      </div>
    </div>
  )
}

export const StyleNodeView = ({ nodeId }: { nodeId: string }) => {
  const node = useNode<UIStyleNode>(nodeId)
  const codeDB = useCodeDB()

  const styleData = tailwindDataMap.get(node.name)!

  const isHovered = node.meta?.ui?.isHovered

  return (
    <div
      role="button"
      tabIndex={0}
      className="relative flex flex-wrap items-center gap-1 rounded-sm border border-gray-300 px-1"
      onClick={(event) => {
        event.preventDefault()

        codeDB?.selectNode(nodeId)
      }}
      onFocus={(event) => {
        event.preventDefault()

        codeDB?.selectNode(nodeId)
      }}
      onMouseOver={(event) => {
        event.preventDefault()

        codeDB?.hoverNode(nodeId)
      }}
      onMouseLeave={() => {
        codeDB?.hoverNodeOff(nodeId)
      }}
    >
      {styleData.useColors && (
        <div
          className="ml-1 h-4 w-4 rounded-sm border shadow-sm"
          style={
            node.args !== undefined
              ? {
                  backgroundColor: tailwindColorPalette.find(
                    (color) => node.args && color.name === node.args[0],
                  )?.shades[node.args[1] as TailwindShade],
                }
              : {}
          }
        />
      )}
      <div>
        {node.args
          ? `${styleData.tag}-${node.args
              .map((arg) => (typeof arg === "string" ? arg : arg.name))
              .join("-")}`
          : styleData.tag}
      </div>

      {/* Controls overlay */}
      {(isHovered || node.meta?.ui?.isSelected) && (
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-sm bg-gray-100 bg-opacity-20 px-0.5">
          <button
            className="rounded-full bg-gray-400 p-px text-white transition-colors hover:bg-gray-500"
            onClick={(event) => {
              event.preventDefault()

              codeDB?.deleteNode(nodeId)
            }}
          >
            <X size={16} />
          </button>

          <button
            className="ml-1 rounded-full bg-gray-400 p-px text-white transition-colors hover:bg-gray-500"
            onClick={(event) => {
              event.preventDefault()

              window.open(styleData.docsUrl)
            }}
          >
            <HelpCircle size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export const StringView = ({ node }: { node: StringLiteral }) => {
  return <div className="text-code-string"> {node.value} </div>
}

export const NumberView = ({ node }: { node: NumberLiteral }) => {
  return <div className="text-code-number"> {node.value} </div>
}

export const BooleanView = ({ node }: { node: { value: boolean } }) => {
  return <div className="text-code-boolean"> {node.value} </div>
}

export const ReferenceView = ({ nodeId }: { nodeId: string }) => {
  const codeDB = useCodeDB()
  const node = useNode<ReferenceNode>(nodeId)
  const referencedNode = useNode<VarStatement>(node.refId)

  return (
    <span
      className={cn(
        "text-code-name rounded-md bg-gray-100 px-1 transition-colors hover:bg-gray-200",
        {
          "bg-gray-200": referencedNode.meta?.ui?.isHovered,
        },
      )}
      onMouseOver={() => {
        codeDB?.hoverNode(node.refId)
      }}
      onMouseLeave={() => {
        codeDB?.hoverNodeOff(node.refId)
      }}
    >
      {referencedNode.name}
    </span>
  )
}

const StateChangeView = ({ node }: { node: StateChangeNode }) => {
  return (
    <div className="flex flex-row flex-wrap items-start gap-1.5">
      <div className="flex flex-row items-center gap-1.5 border-2 border-transparent">
        <span className="text-code-keyword">set</span>
        <ReferenceView nodeId={node.state.id} />
        <span className="text-code-symbol">to</span>
      </div>

      {node.body.length === 1 && node.body[0]!.type === "return" ? (
        <ExpressionView nodeId={node.body[0]?.arg.id} />
      ) : (
        <>
          <div className="pt-1">{/* spacer */}</div>
          <NodeList
            nodeId={node.id}
            parentProperty="body"
            nodes={node.body}
            Component={StatementView}
          />
        </>
      )}
    </div>
  )
}

const NaryExpressionView = ({ node }: { node: NAryExpression }) => {
  return (
    <div className="flex flex-row flex-wrap items-start gap-1.5 border-2 border-transparent">
      {node.args.map((arg, idx) => {
        return (
          <React.Fragment key={arg.id}>
            <ExpressionView nodeId={arg.id} />
            {idx < node.args.length - 1 && (
              <span className="text-code-symbol">{node.operators[idx]}</span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const NodeList = ({
  nodeId,
  parentProperty,
  nodes,
  Component,
  className,
}: {
  nodeId: string
  parentProperty: string
  nodes: CodeNode[]
  Component: React.FC<{ nodeId: string }>
  className?: string
}) => {
  const node = useNode<CodeNode>(nodeId)
  const codeDB = useCodeDB()
  const [isOpen, setIsOpen] = React.useState(true)
  const containerID = React.useId()

  const isHovered = node.meta?.ui?.isHovered

  const handleSpacerClick = (index: number) => {
    const newNode = codeDB?.newEmptyNode(uiNodeTypes.includes(node.type) ? "ui" : "statement", {
      ui: {
        isSelected: true,
        isHovered: false,
      },
    })!

    codeDB?.insertNodeInList(nodeId, parentProperty, index, newNode)
  }

  return (
    <div
      className={cn("relative border-l border-l-slate-200", indentationClass, className, {
        "pt-6": !isOpen,
      })}
    >
      <button
        aria-expanded={isOpen}
        aria-controls={containerID}
        className={`absolute left-0 top-0 cursor-pointer ${
          isOpen ? (isHovered ? "block" : "hidden") : ""
        }`}
        onClick={(event) => {
          event.preventDefault()
          setIsOpen(!isOpen)
        }}
      >
        {isOpen ? (
          <ChevronDown className="text-gray-400 transition-colors hover:text-gray-500" />
        ) : (
          <ChevronRight className="text-gray-400 transition-colors hover:text-gray-500" />
        )}
      </button>
      <div id={containerID} className={cn("flex-col items-start", isOpen ? "flex" : "hidden")}>
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <NodeListSpacer
              parentNodeId={nodeId}
              index={index}
              nodeType={node.type}
              parentProperty={parentProperty}
              onClick={handleSpacerClick}
            />
            <Component nodeId={node.id} />
          </React.Fragment>
        ))}
        <NodeListSpacer
          parentNodeId={nodeId}
          index={nodes.length}
          nodeType={nodes[nodes.length - 1]!.type}
          parentProperty={parentProperty}
          onClick={handleSpacerClick}
        />
      </div>
    </div>
  )
}

const NodeListSpacer = ({
  parentNodeId,
  onClick,
  index,
  nodeType,
  parentProperty,
}: {
  parentNodeId: string
  index: number
  nodeType: CodeNode["type"]
  parentProperty: string
  onClick: (index: number) => void
}) => {
  const codeDB = useCodeDB()

  const [droppedOnNodeId] = useAtom(droppedOnNodeIdAtom)

  const droppableId = `${parentNodeId}-${parentProperty}-${index}`

  const isDroppedOnNode = droppedOnNodeId === droppableId

  const { setNodeRef } = useDroppable({
    id: droppableId,
    data: { type: nodeType } satisfies DropData,
  })

  return (
    <button
      ref={setNodeRef}
      className={cn("w-full pb-1 transition-colors hover:bg-gray-100", {
        "bg-lime-600 hover:bg-lime-600": isDroppedOnNode,
      })}
      onClick={(event) => {
        event.preventDefault()
        onClick(index)
      }}
      onMouseOver={(event) => {
        event.preventDefault()
        codeDB?.removeHover()
      }}
    />
  )
}

const DraggableNodeContainer = ({
  nodeId,
  isOverlay,
  children,
}: {
  nodeId: string
  isOverlay?: boolean
  children: React.ReactNode
}) => {
  const codeDB = useCodeDB()
  const node = useNode(nodeId)

  const [draggedNodeId] = useAtom(draggedNodeIdAtom)

  const isDraggedNode = !isOverlay && nodeId === draggedNodeId

  const isSelected = node.meta?.ui?.isSelected
  const isHovered = node.meta?.ui?.isHovered

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: nodeId,
    data: { type: node.type } satisfies DropData,
  })

  if (!node) return null

  return (
    <div
      className={cn(
        "relative flex cursor-pointer touch-none select-none flex-col rounded-xl border-2 border-transparent",
        {
          "bg-code-bg border-dashed border-slate-400 opacity-95": isOverlay,
          "w-full": !isOverlay && isNodeKind(node, "statement"),
        },
      )}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseOver={(event) => {
        if (event.defaultPrevented) {
          return
        }
        event.preventDefault()
        console.log("hovering", nodeId)
        codeDB?.hoverNode(nodeId)

        const node = codeDB?.getNodeByID(nodeId)

        if (node?.type === "ui text") {
          const parentId = node.meta?.parentId
          codeDB?.hoverNode(parentId!)
        }
      }}
      onMouseLeave={() => {
        codeDB?.hoverNodeOff(nodeId)
      }}
      onClick={(event) => {
        if (event.defaultPrevented) {
          return
        }
        event.preventDefault()
        codeDB?.selectNode(nodeId)
      }}
      onFocus={(event) => {
        if (event.defaultPrevented) {
          return
        }
        event.preventDefault()

        codeDB?.selectNode(nodeId)
      }}
      onBlur={() => {
        codeDB?.selectNodeOff(nodeId)
      }}
      onKeyDown={(event) => {
        if (event.key === "Backspace" && event.target === event.currentTarget) {
          codeDB?.deleteNode(nodeId)
        }
      }}
    >
      {(isSelected || isHovered) && !isOverlay && (
        <div
          className={cn("absolute left-[-5px] top-0 h-full w-1 rounded opacity-50", {
            "bg-gray-300": isDraggedNode || isHovered,
            "bg-blue-500": isSelected,
          })}
        />
      )}
      {children}
    </div>
  )
}

export const UITextView = ({ nodeId }: { nodeId: string }) => {
  const codeDB = useCodeDB()
  const node = useNode<UITextNode>(nodeId)

  function handleChange(event: React.ChangeEvent<any>) {
    codeDB?.updateUIText(nodeId, event.target.value)
  }

  return (
    <div className="flex gap-1.5">
      <div className="flex h-[24px] w-6 items-center justify-center">
        <Type size={16} className="text-code-name" />
      </div>
      <TextareaAutosize
        className="text-code-ui-text w-full max-w-lg resize-none rounded border-none border-slate-300 bg-gray-100 px-2 py-0 focus-visible:bg-gray-200 focus-visible:outline-none focus-visible:ring-0"
        value={node.text}
        onChange={handleChange}
        autoFocus
      />
    </div>
  )
}

export const FunctionView = ({ node }: { node: FunctionNode }) => {
  return (
    <>
      <div className="flex flex-row">
        <span className="text-code-keyword">fun</span>
        <span className="text-code-callable"> {node.name} </span>
        <div className="text-gray-500">
          {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
        </div>
      </div>
      <div className="pt-1">{/* spacer */}</div>
      <NodeList
        nodeId={node.id}
        parentProperty="body"
        nodes={node.body}
        Component={StatementView}
      />
    </>
  )
}

export const IfStatementView = ({ nodeId }: { nodeId: string }) => {
  const node = useNode<IfStatementNode>(nodeId)

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-1.5">
        <span className="text-code-keyword">if</span>
        <ExpressionView nodeId={node.test.id} />
      </div>
      <div className="pt-1">{/* spacer */}</div>
      <NodeList
        nodeId={node.id}
        parentProperty="then"
        nodes={node.then}
        Component={StatementView}
      />
      {/* Missing else if TODO */}
      {node.else && (
        <>
          <div className="pt-1">{/* spacer */}</div>
          <div className="flex flex-row gap-1.5">
            <span className="text-code-keyword">else</span>
          </div>
          <div className="pt-1">{/* spacer */}</div>
          <NodeList
            nodeId={node.id}
            parentProperty="else"
            nodes={node.else}
            Component={StatementView}
          />
        </>
      )}
    </div>
  )
}

export const EditableNodeName = ({ nodeId }: { nodeId: string }) => {
  const codeDB = useCodeDB()

  const node = useNode<VarStatement>(nodeId)

  function handleChange(event: React.ChangeEvent<any>) {
    const valueWithoutWhitespace = event.target.value.replace(/(?:\r\n|\r|\n)/g, "")

    const sanitizedValue = sanitizeHtml(valueWithoutWhitespace, {
      allowedTags: [],
      allowedAttributes: {},
    })

    codeDB?.updateNodeName(nodeId, sanitizedValue)
  }

  return (
    <span
      className={cn("overflow-hidden rounded-md bg-gray-100 transition-colors hover:bg-gray-200", {
        "bg-gray-200": node.meta?.ui?.isHovered,
      })}
      onMouseOver={() => {
        codeDB?.hoverNode(nodeId)
      }}
      onMouseLeave={() => {
        codeDB?.hoverNodeOff(nodeId)
      }}
    >
      <ContentEditable
        tagName="span"
        role="textbox"
        className="text-code-name inline-block h-full px-1 outline-none focus-visible:bg-gray-200"
        html={node.name}
        onChange={handleChange}
      />
    </span>
  )
}

export const EmptyNodeView = ({ nodeId }: { nodeId: string }) => {
  const node = useNode<EmptyNode>(nodeId)
  const codeDB = useCodeDB()

  const isSelected = node.meta?.ui?.isSelected
  const isHovered = node.meta?.ui?.isHovered

  const [isComboboxOpen, setIsComboboxOpen] = React.useState(isSelected)

  const kind = node.kind

  const filteredBaseNodeMetaList = React.useMemo(
    () => baseNodeMetaList.filter((n) => n.kinds.includes(kind)),
    [kind],
  )

  const [searchValue, setSearchValue] = React.useState("")
  const matches = React.useMemo(
    () => matchSorter(filteredBaseNodeMetaList, searchValue, { keys: ["title"] }),
    [searchValue],
  )

  return (
    <div className="relative">
      {(isSelected || isHovered) && (
        <div className="absolute right-0 top-0 flex h-full w-[24px] items-center justify-start">
          <button
            className="rounded-full bg-gray-400 p-px text-white transition-colors hover:bg-gray-500"
            onClick={(event) => {
              event.preventDefault()

              codeDB?.deleteNode(nodeId)
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <ComboboxProvider
        setValue={(value) => {
          React.startTransition(() => setSearchValue(value))
        }}
        focusLoop={true}
        setOpen={(isOpen) => {
          setIsComboboxOpen(isOpen)
        }}
        open={isComboboxOpen}
      >
        <Combobox
          placeholder="..."
          className="w-full max-w-sm border-0 p-0 pl-1 focus-visible:ring-0"
          autoFocus={isSelected}
          autoSelect
        />
        <ComboboxPopover
          gutter={4}
          className="z-50 max-h-72 w-72 rounded-sm border border-gray-300 bg-white px-1 py-1"
        >
          {matches.length !== 0 ? (
            matches.map((match) => (
              <ComboboxItem
                key={match.title}
                value={match.title}
                className="rounded-sm px-1 transition-colors hover:bg-gray-100 data-[active-item]:bg-gray-200"
                onClick={() => {
                  codeDB?.replaceNodeInList(
                    nodeId,
                    codeDB?.newNodeFromType(
                      match.type,
                      match.name
                        ? {
                            name: match.name,
                          }
                        : {},
                    )!,
                  )
                }}
              />
            ))
          ) : (
            <div className="no-results">No results found</div>
          )}
        </ComboboxPopover>
      </ComboboxProvider>
    </div>
  )
}

/**
 * Clamp effect for better DX
 */
const clampModifier: Modifier = ({ transform }) => {
  if (euclideanDistance(transform, { x: 0, y: 0 }) < 5) {
    return { ...transform, x: 0, y: 0 }
  }

  return transform
}

type Point = { x: number; y: number }

const euclideanDistance = (a: Point, b: Point) => {
  const x = a.x - b.x
  const y = a.y - b.y
  return Math.sqrt(x * x + y * y)
}

const closestTopRightCorner =
  (codeDB: CodeDB | null): CollisionDetection =>
  ({ collisionRect, droppableRects, droppableContainers, active }) => {
    if (!codeDB) return []

    const activeData: DropData = active.data.current as any

    const corner = { x: collisionRect.left, y: collisionRect.top }
    const collisions: CollisionDescriptor[] = []

    const activeNode = codeDB?.getNodeByID(active.id as string)

    const isActiveNodeUI = uiNodeTypes.includes(activeNode?.type as any)

    for (const droppableContainer of droppableContainers) {
      const { id } = droppableContainer

      // node list droppable validation
      if ((id as string).includes("-")) {
        const [parentNodeId] = (id as string).split("-")

        const parentNode = codeDB?.getNodeByID(parentNodeId!)

        if (isActiveNodeUI) {
          // if moving a UI node, only allow dropping on UI nodes that have a parent UI node
          if (!uiNodeTypes.includes(parentNode?.type as any)) {
            continue
          }
        }

        if (codeDB.isDescendantOf(parentNode, activeNode!)) {
          continue
        }
      }

      const droppableContainerData: DropData = droppableContainer.data.current as any

      if (!areNodeTypesCompatible(activeData.type, droppableContainerData.type)) {
        continue
      }

      const rect = droppableRects.get(id)

      if (rect) {
        const rectCorner = { x: rect.left, y: rect.top }
        const distance = euclideanDistance(corner, rectCorner)

        collisions.push({
          id,
          data: { droppableContainer, value: Number(distance.toFixed(4)) },
        })
      }
    }

    return collisions.sort(sortCollisionsAsc)
  }

function sortCollisionsAsc(
  { data: { value: a } }: CollisionDescriptor,
  { data: { value: b } }: CollisionDescriptor,
) {
  return a - b
}

class CustomPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown",
      handler: ({ nativeEvent: event }: PointerEvent) => {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          isInteractiveElement(event.target as HTMLElement)
        ) {
          return false
        }

        return true
      },
    } as const,
  ]
}

class CustomKeyboardSensor extends KeyboardSensor {
  static activators = [
    {
      eventName: "onKeyDown",
      handler: ({ nativeEvent: event }: PointerEvent) => {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          isInteractiveElement(event.target as HTMLElement)
        ) {
          return false
        }

        return true
      },
    } as const,
  ]
}

function isInteractiveElement(element: HTMLElement) {
  const interactiveElements = ["button", "input", "textarea", "select", "option"]

  if (interactiveElements.includes(element.tagName.toLowerCase())) {
    return true
  }

  return false
}
