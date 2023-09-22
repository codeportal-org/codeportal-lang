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
import { Square, Text } from "lucide-react"
import React, { PointerEvent } from "react"
import { createPortal } from "react-dom"
import TextareaAutosize from "react-textarea-autosize"

import { cn, isTouchEnabled } from "@/lib/utils"

import { CodeDB } from "./lang/codeDB"
import { useCodeDB, useNode } from "./lang/codeDBContext"
import {
  CodeNode,
  ExpressionNode,
  NumberLiteral,
  ProgramNode,
  ReferenceNode,
  StatementNode,
  StringLiteral,
  UINode,
  UITextNode,
  VarStatement,
  statementTypes,
  uiNodeTypes,
} from "./lang/interpreter"

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
          codeTree.body.map((node, idx) => {
            return <StatementView nodeId={node.id} key={node.id} />
          })}
      </div>
      {createPortal(
        <DragOverlay>
          {draggedNode ? (
            uiNodeTypes.includes(draggedNode.type) ? (
              <UINodeView node={draggedNode as UINode} isOverlay={true} />
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

  return (
    <DraggableNodeContainer nodeId={nodeId} isOverlay={isOverlay} kind="statement">
      {node.type === "component" && (
        <>
          <div className="flex flex-row">
            <span className="text-code-keyword">component</span>
            <span className="pl-1">{/* spacer */}</span>
            <span className="text-code-callable"> {node.name} </span>
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          <StatementList>
            {node.body.map((node) => {
              return <StatementView nodeId={node.id} key={node.id} />
            })}
          </StatementList>
        </>
      )}
      {node.type === "function" && (
        <>
          <div className="flex flex-row">
            <span className="text-code-keyword">fun</span>
            <span className="text-code-callable"> {node.name} </span>
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          <StatementList>
            {node.body.map((node) => {
              return <StatementView nodeId={node.id} key={node.id} />
            })}
          </StatementList>
        </>
      )}
      {node.type === "var" && <VariableStatementView node={node} />}
      {/* {node.type === "expression" && <ExpressionView node={node.expression} />} */}
      {node.type === "return" && (
        <div className="flex flex-row gap-1.5">
          <span className="text-code-keyword">return</span>
          <ExpressionView node={node.arg} />
        </div>
      )}
    </DraggableNodeContainer>
  )
}

export const VariableStatementView = ({ node }: { node: VarStatement }) => {
  return (
    <div className="flex flex-row gap-1.5">
      <span className="text-code-keyword">var</span>
      <span className="text-code-name">{node.name}</span>
      <span className="text-code-symbol">=</span>

      <ExpressionView node={node.value} />
    </div>
  )
}

export const ExpressionView = ({ node }: { node: ExpressionNode }) => {
  if (!node) return null

  return (
    <>
      {node.type === "string" && <StringView node={node} />}
      {node.type === "number" && <NumberView node={node} />}
      {node.type === "boolean" && <BooleanView node={node} />}
      {node.type === "ref" && <ReferenceView nodeId={node.id} />}
      {uiNodeTypes.includes(node.type) && <UINodeView node={node as UINode} />}
    </>
  )
}

export const UINodeView = ({ node, isOverlay }: { node: UINode; isOverlay?: boolean }) => {
  const nodeId = node.id

  return (
    <DraggableNodeContainer nodeId={nodeId} isOverlay={isOverlay} kind="ui node">
      {node.type === "ui text" && <UITextView node={node} />}
      {node.type === "ui element" && (
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
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          {node.children && (
            <div
              className={cn("flex flex-col gap-1.5 border-l border-l-slate-200", indentationClass)}
            >
              {node.children.map((node, idx) => {
                return <ExpressionView node={node} key={idx} />
              })}
            </div>
          )}
        </div>
      )}
      {node.type === "ui expression" && (
        <div className="flex flex-row gap-1.5">
          {"{"}
          <ExpressionView node={node.expression} />
          {"}"}
        </div>
      )}
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
  const node = useNode<ReferenceNode>(nodeId)

  const referencedNode = useNode<VarStatement>(node.refId)

  // TODO: implement highligh declaration on hover!

  return (
    <span className="text-code-name rounded-md bg-gray-100 px-1 transition-all hover:bg-gray-200">
      {referencedNode.name}
    </span>
  )
}

const StatementList = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn("flex flex-col border-l border-l-slate-200", indentationClass, className)}>
      {children}
    </div>
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
  const hasParent = node.meta?.parent !== undefined

  const [draggedNodeId] = useAtom(draggedNodeIdAtom)
  const [droppedOnNodeId] = useAtom(droppedOnNodeIdAtom)

  const isDroppedOnNode = !isOverlay && nodeId === droppedOnNodeId
  const isDraggedNode = !isOverlay && nodeId === draggedNodeId

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: nodeId,
    data: { type: node.type, kind } satisfies DropData,
    disabled: !hasParent,
  })

  const droppable = useDroppable({
    id: nodeId,
    data: { type: node.type, kind } satisfies DropData,
    disabled: !hasParent,
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

export const UITextView = ({ node }: { node: UITextNode }) => {
  const [text, setText] = React.useState(node.text)

  return (
    <div className="flex gap-1.5">
      <div className="flex h-[26px] w-6 items-center justify-center">
        <Text size={18} className="text-code-name" />
      </div>
      <TextareaAutosize
        className="text-code-ui-text w-full max-w-lg resize-none rounded border border-slate-300 px-1 py-0 focus-visible:outline-none focus-visible:ring-1"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
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

      const droppableContainerData: DropData = droppableContainer.data.current as any

      const droppableNode = codeDB?.getNodeByID(id as string)

      if (isActiveNodeUI) {
        // if moving a UI node, only allow dropping on UI nodes that have a parent UI node
        if (!uiNodeTypes.includes(droppableNode?.meta?.parent?.type as any)) {
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
