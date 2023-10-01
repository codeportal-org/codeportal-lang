import {
  ClientRect,
  CollisionDescriptor,
  CollisionDetection,
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
import { atom, useAtom } from "jotai"
import { ChevronDown, ChevronRight, Square, Type } from "lucide-react"
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
  UITextNode,
  VarStatement,
  statementTypes,
  uiNodeTypes,
} from "./lang/codeTree"

type NodeKind = "statement" | "ui node"

type DropData = { type: CodeNode["type"]; kind: NodeKind }

const draggedNodeIdAtom = atom<string | null>(null)
const draggedNodeKindAtom = atom<NodeKind | null>(null)
const draggedNodeRectAtom = atom<ClientRect | null>(null)

const droppedOnNodeIdAtom = atom<string | null>(null)
const droppedOnNodeRectAtom = atom<ClientRect | null>(null)

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
  const [draggedNodeKind, setDraggedNodeKind] = useAtom(draggedNodeKindAtom)

  const [droppedOnNodeId, setDroppedOnNodeId] = useAtom(droppedOnNodeIdAtom)

  const draggedNode = draggedNodeId ? codeDB?.getNodeByID(draggedNodeId) : null
  const droppedOnNode = droppedOnNodeId ? codeDB?.getNodeByID(droppedOnNodeId) : null

  const handleDragStart = ({ active }: DragStartEvent) => {
    console.log("drag start")

    setDraggedNodeId(active.id as string)
    setDraggedNodeKind((active.data.current as DropData).kind)
    setDroppedOnNodeId(null)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    console.log("drag over")
    setDroppedOnNodeId(over?.id as string)
  }

  const handleDragEnd = () => {
    console.log("drag end", draggedNodeKind)
    if (draggedNodeKind === "statement") {
      codeDB?.moveStatementNode(draggedNode! as StatementNode, droppedOnNode! as StatementNode)
    } else if (draggedNodeKind === "ui node") {
      codeDB?.moveUINode(draggedNode! as UINode, droppedOnNode! as UINode)
    }

    setDraggedNodeId(null)
    setDraggedNodeKind(null)

    setDroppedOnNodeId(null)
  }

  const handleDragCancel = () => {
    console.log("drag cancel")
    setDraggedNodeId(null)
    setDraggedNodeKind(null)

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
        <NodeList nodeId={node.id} nodes={node.body} Component={StatementView} />
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
        <ExpressionView node={node.arg} />
      </div>
    )
  } else if (node.type === "state") {
    statementView = <StateStatementView nodeId={node.id} />
  } else if (node.type === "state change") {
    statementView = <StateChangeView node={node} />
  } else if (node.type === "empty" && node.kind === "statement") {
    statementView = <EmptyNode nodeId={node.id} />
  } else {
    statementView = (
      <div>
        unknown statement type: <span className="text-red-500">{node.type}</span>
      </div>
    )
  }

  return (
    <DraggableNodeContainer nodeId={nodeId} isOverlay={isOverlay} kind="statement">
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

      <ExpressionView node={node.value} />
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

      <ExpressionView node={node.value} />
    </div>
  )
}

export const ExpressionView = ({ node }: { node: ExpressionNode }) => {
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

  let uiNodeView: React.ReactNode

  if (node.type === "ui text") {
    uiNodeView = <UITextView nodeId={node.id} />
  } else if (node.type === "ui element") {
    uiNodeView = (
      <div className="flex flex-col">
        <div className="text-code-ui-element-name flex items-center gap-1.5">
          {node.name === "div" ? (
            <>
              <Square size={16} className="text-code-name" />
              Box
            </>
          ) : node.name === "p" ? (
            <div className="text-code-ui-element-name">Paragraph</div>
          ) : node.name.startsWith("h") && !isNaN(Number(node.name[1])) ? (
            <div className="text-code-ui-element-name">Heading {node.name[1]}</div>
          ) : (
            node.name
          )}
        </div>
        {node.props && (
          <>
            <div className={indentationClass}>
              <div className={cn("flex flex-col gap-1.5 text-gray-500", indentationClass)}>
                {node.props.map((prop) =>
                  prop.type === "ui prop" ? (
                    <div key={prop.id} className="flex flex-wrap gap-2">
                      <div className="col-span-1">{prop.name}:</div>
                      <div className="col-span-4">
                        <ExpressionView node={prop.value} />
                      </div>
                    </div>
                  ) : (
                    <div key={prop.id} className="flex flex-wrap gap-2">
                      <div className="col-span-1">... spread</div>
                      <div className="col-span-4">
                        <ExpressionView node={prop.arg} />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="pt-1">{/* spacer */}</div>
          </>
        )}
        {node.children && (
          <NodeList nodeId={node.id} nodes={node.children} Component={UINodeView} />
        )}
      </div>
    )
  } else if (node.type === "ui expression") {
    uiNodeView = (
      <div className="flex flex-row gap-1.5">
        {"{"}
        <ExpressionView node={node.expression} />
        {"}"}
      </div>
    )
  } else if (node.type === "empty" && node.kind === "ui") {
    uiNodeView = <EmptyNode nodeId={node.id} />
  } else {
    uiNodeView = (
      <div>
        unknown ui node type: <span className="text-red-500">{node.type}</span>
      </div>
    )
  }

  return (
    <DraggableNodeContainer nodeId={nodeId} isOverlay={isOverlay} kind="ui node">
      {uiNodeView}
    </DraggableNodeContainer>
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

      {Array.isArray(node.body) ? (
        <NodeList nodeId={node.id} nodes={node.body} Component={StatementView} />
      ) : (
        <ExpressionView node={node.body} />
      )}
    </div>
  )
}

const NaryExpressionView = ({ node }: { node: NAryExpression }) => {
  return (
    <div className="flex flex-row flex-wrap items-start gap-1.5">
      {node.args.map((arg, idx) => {
        return (
          <React.Fragment key={arg.id}>
            <ExpressionView node={arg} />
            {idx < node.args.length - 1 && (
              <span className="text-code-symbol">{node.operator}</span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const NodeList = ({
  nodeId,
  nodes,
  Component,
  className,
}: {
  nodeId: string
  nodes: CodeNode[]
  Component: React.FC<{ nodeId: string }>
  className?: string
}) => {
  const node = useNode<CodeNode>(nodeId)
  const codeDB = useCodeDB()
  const [isOpen, setIsOpen] = React.useState(true)
  const containerID = React.useId()

  const isHovered = node.meta?.ui?.isHovered

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const handleSpacerClick = (nodeId: string) => {
    const newNode = codeDB?.newEmptyNode(uiNodeTypes.includes(node.type) ? "ui" : "statement")!

    if (nodeId === "<end>") {
      codeDB?.insertNodeAfter(nodes[nodes.length - 1]!.id, newNode)
    } else {
      codeDB?.insertNodeBefore(nodeId, newNode)
    }
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
        onClick={toggleOpen}
      >
        {isOpen ? (
          <ChevronDown className="text-gray-400 transition-colors hover:text-gray-500" />
        ) : (
          <ChevronRight className="text-gray-400 transition-colors hover:text-gray-500" />
        )}
      </button>
      <div id={containerID} className={cn("flex-col items-start", isOpen ? "flex" : "hidden")}>
        {nodes.map((node) => (
          <React.Fragment key={node.id}>
            <NodeListSpacer nodeId={node.id} onClick={handleSpacerClick} />
            <Component nodeId={node.id} />
          </React.Fragment>
        ))}
        <NodeListSpacer nodeId="<end>" onClick={handleSpacerClick} />
      </div>
    </div>
  )
}

const NodeListSpacer = ({
  nodeId,
  onClick,
}: {
  nodeId: string
  onClick: (nodeId: string) => void
}) => {
  return (
    <button
      className="w-full pb-1 transition-colors hover:bg-gray-100"
      onClick={() => onClick(nodeId)}
    />
  )
}

const DraggableNodeContainer = ({
  nodeId,
  isOverlay,
  children,
  kind,
}: {
  kind: "statement" | "ui node"
  nodeId: string
  isOverlay?: boolean
  children: React.ReactNode
}) => {
  const codeDB = useCodeDB()
  const node = useNode(nodeId)

  const [draggedNodeId] = useAtom(draggedNodeIdAtom)
  const [droppedOnNodeId] = useAtom(droppedOnNodeIdAtom)

  const isDroppedOnNode = !isOverlay && nodeId === droppedOnNodeId
  const isDraggedNode = !isOverlay && nodeId === draggedNodeId

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: nodeId,
    data: { type: node.type, kind } satisfies DropData,
  })

  const droppable = useDroppable({
    id: nodeId,
    data: { type: node.type, kind } satisfies DropData,
  })

  if (!node) return null

  return (
    <div
      className={cn(
        "relative flex cursor-pointer touch-none select-none flex-col rounded-xl border-2 border-transparent",
        {
          "bg-code-bg border-dashed border-slate-400 opacity-95": isOverlay,
        },
      )}
      ref={(ref) => {
        setNodeRef(ref)
        droppable.setNodeRef(ref)
      }}
      {...listeners}
      {...attributes}
      onMouseOver={() => {
        codeDB?.hoverNode(nodeId)
      }}
      onMouseLeave={() => {
        codeDB?.hoverNodeOff(nodeId)
      }}
      onFocus={() => {
        codeDB?.selectNode(nodeId)
      }}
      onBlur={() => {
        codeDB?.selectNodeOff(nodeId)
      }}
    >
      {isDroppedOnNode && (
        <div
          className={cn("absolute left-0 top-0 h-full w-1 opacity-50", {
            "bg-lime-600": !isDraggedNode,
            "bg-gray-300": isDraggedNode,
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
      <NodeList nodeId={node.id} nodes={node.body} Component={StatementView} />
    </>
  )
}

export const IfStatementView = ({ nodeId }: { nodeId: string }) => {
  const node = useNode<IfStatementNode>(nodeId)

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-1.5">
        <span className="text-code-keyword">if</span>
        <ExpressionView node={node.test} />
      </div>
      <NodeList nodeId={node.id} nodes={node.then} Component={StatementView} />
      {/* Missing else if TODO */}
      {node.else && (
        <>
          <div className="pt-1">{/* spacer */}</div>
          <div className="flex flex-row gap-1.5">
            <span className="text-code-keyword">else</span>
          </div>
          <NodeList nodeId={node.id} nodes={node.else} Component={StatementView} />
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

export const EmptyNode = ({ nodeId }: { nodeId: string }) => {
  const node = useNode(nodeId)

  return (
    <button className="flex cursor-pointer flex-row items-center gap-1.5 rounded-sm bg-gray-100 px-1 transition-colors hover:bg-gray-200">
      <span className="text-code-name-light">...</span>
    </button>
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

      const droppableContainerData: DropData = droppableContainer.data.current as any

      const droppableNode = codeDB?.getNodeByID(id as string)

      if (isActiveNodeUI) {
        // if moving a UI node, only allow dropping on UI nodes that have a parent UI node
        const droppableNodeParent = codeDB.getNodeByID(droppableNode?.meta?.parentId!)
        if (!uiNodeTypes.includes(droppableNodeParent?.type as any)) {
          continue
        }
      }

      if (codeDB.isDescendantOf(droppableNode!, activeNode!) && id !== active.id) {
        continue
      }

      if (activeData.kind !== droppableContainerData.kind) {
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
