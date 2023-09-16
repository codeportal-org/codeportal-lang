import { useDraggable, useDroppable } from "@dnd-kit/core"
import {
  ClientRect,
  CollisionDetection,
  DndContext,
  DragOverEvent,
  DragOverlay,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { atom, useAtom } from "jotai"
import { Square, Text } from "lucide-react"
import React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

import { CodeDB } from "./lang/codeDB"
import { useCodeDB } from "./lang/codeDBContext"
import {
  CodeNode,
  ExpressionNode,
  ProgramNode,
  StatementNode,
  expressionTypes,
} from "./lang/interpreter"

const draggedNodeIdAtom = atom<string | null>(null)

export const CodeTreeView = ({ codeTree }: { codeTree: ProgramNode | null }) => {
  const codeDB = useCodeDB()
  const sensors = useSensors(useSensor(PointerSensor))
  const [draggedNodeId, setDraggedNodeId] = useAtom(draggedNodeIdAtom)
  const [isCodeLoadedInDB, setIsCodeLoadedInDB] = React.useState(() => codeDB?.isCodeLoaded)

  const draggedNode = draggedNodeId ? codeDB?.getByID(draggedNodeId) : null

  console.log("--- draggedNode: ", draggedNode, draggedNodeId)

  const handleDragStart = ({ active }: any) => {
    console.log("drag start")
    setDraggedNodeId(active.id)
  }
  const handleDragOver = () => {
    console.log("drag over")
  }
  const handleDragEnd = () => {
    console.log("drag end")
    setDraggedNodeId(null)
  }
  const handleDragCancel = () => {
    console.log("drag cancel")
    setDraggedNodeId(null)
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

  if (!codeTree) return <div>loading...</div>

  const rootView = (
    <div className="h-full w-full overflow-auto whitespace-pre-wrap rounded-xl border px-4 py-2">
      {codeTree.type === "program" &&
        codeTree.body.map((node, idx) => {
          return <StatementView node={node} key={node?.meta?.id! || idx} />
        })}
    </div>
  )

  // If it doesn't have an ID, it's not draggable
  if (!isCodeLoadedInDB) {
    console.log("not loaded = -----", isCodeLoadedInDB)
    return rootView
  }

  console.log("loaded =----")

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetectionAlgorithm(codeDB)}
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
      {rootView}
      {createPortal(
        <DragOverlay>
          {draggedNode ? (
            <StatementView node={draggedNode as StatementNode} isOverlay={true} />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}

export const StatementView = ({
  node,
  isOverlay,
}: {
  node: StatementNode
  isOverlay?: boolean
}) => {
  const nodeId = node.meta?.id!
  // console.log("nodeId: ", nodeId)
  const hasParent = node.meta?.parent !== undefined

  // console.log("hasParent: ", hasParent)

  const [draggedNodeId] = useAtom(draggedNodeIdAtom)

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: nodeId,
    data: { type: node.type },
    disabled: !hasParent,
  })

  const droppable = useDroppable({
    id: nodeId,
    data: { type: node.type },
    disabled: !hasParent,
  })

  if (!node) return null

  return (
    <div
      className={cn(
        "bg-code-bg flex cursor-pointer select-none flex-col rounded-xl border border-slate-400 px-2 py-1",
        {
          "border-destructive": !isOverlay && nodeId === draggedNodeId,
          // "border-dashed opacity-90": isOverlay,
        },
      )}
      ref={(ref) => {
        setNodeRef(ref)
        droppable.setNodeRef(ref)
      }}
      {...listeners}
      {...attributes}
    >
      {node.type === "component" && (
        <>
          <div className="flex flex-row">
            <Keyword>component</Keyword>
            <Callable> {node.name} </Callable>
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          <StatementList>
            {node.body.map((node, idx) => {
              return <StatementView node={node} key={idx} />
            })}
          </StatementList>
        </>
      )}
      {node.type === "function" && (
        <>
          <div className="flex flex-row">
            <Keyword>fun</Keyword>
            <Callable> {node.name} </Callable>
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          <StatementList>
            {node.body.map((node, idx) => {
              return <StatementView node={node} key={idx} />
            })}
          </StatementList>
        </>
      )}
      {node.type === "var" && (
        <div className="flex flex-row gap-1.5">
          <Keyword>var</Keyword>
          <CodeName>{node.name}</CodeName>
          <CodeSymbol>=</CodeSymbol>

          <ExpressionView node={node.value} />
        </div>
      )}
      {/* {node.type === "expression" && <ExpressionView node={node.expression} />} */}
      {node.type === "return" && (
        <div className="flex flex-row gap-1.5">
          <Keyword>return</Keyword>
          <ExpressionView node={node.arg} />
        </div>
      )}
    </div>
  )
}

export const ExpressionView = ({ node }: { node: ExpressionNode }) => {
  if (!node) return null

  return (
    <>
      {node.type === "string" && <div className="text-code-string"> {node.value} </div>}
      {node.type === "number" && <div className="text-code-number"> {node.value} </div>}
      {node.type === "boolean" && <div className="text-code-boolean"> {node.value} </div>}
      {node.type === "ref" && <CodeName>{node.name}</CodeName>}
      {node.type === "ui text" && node.text}
      {node.type === "ui element" && (
        <div className="flex flex-col">
          <div className="text-code-ui-element-name flex items-center gap-1.5">
            {node.name === "div" ? (
              <>
                <Square size={16} className="text-code-name" />
                Box
              </>
            ) : node.name === "p" ? (
              <>
                <Text size={16} className="text-code-name" />
                Text
              </>
            ) : node.name === "h1" ? (
              <>
                <div className="text-code-ui-element-name">Heading 1</div>
              </>
            ) : node.name === "h2" ? (
              <>
                <div className="text-code-ui-element-name">Heading 2</div>
              </>
            ) : (
              node.name
            )}
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          {node.children && (
            <div className="flex flex-col gap-1.5 pl-9">
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
    </>
  )
}

function CodeName({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-code-name", className)}>{children}</span>
}

function Callable({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-code-callable", className)}>{children}</span>
}

function Keyword({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-code-keyword", className)}>{children}</span>
}

function CodeSymbol({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-code-symbol", className)}>{children}</span>
}

function StatementList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col border-l border-l-slate-200 pl-9", className)}>
      {children}
    </div>
  )
}

const customCollisionDetectionAlgorithm =
  (codeDB: CodeDB | null): CollisionDetection =>
  ({ collisionRect, droppableRects, droppableContainers, active, ...rest }) => {
    if (!codeDB) {
      return []
    }

    // console.log("collision calculation")

    if (!active.rect.current.initial || !active.rect.current.translated) {
      return []
    }

    // If the active block is not moved far enough, don't show any collision
    if (Math.abs(active.rect.current.initial.top - active.rect.current.translated.top) < 10) {
      // console.log(
      //   "---- comparison []",
      //   Math.abs(active.rect.current.initial.top - active.rect.current.translated.top),
      // )
      return []
    }

    const draggedNode = codeDB.getByID(active.id as string)

    const filteredDroppableContainers = droppableContainers.filter((droppableContainer) => {
      const { id } = droppableContainer
      const node = codeDB.getByID(id as string)

      if (draggedNode?.type !== node?.type) {
        return false
      }

      if (node && draggedNode && codeDB.isDescendantOf(node, draggedNode)) {
        return false
      }

      return true
    })

    if (expressionTypes.includes(draggedNode?.type as any)) {
      const rectIntersectionCollisions = rectIntersection({
        collisionRect,
        droppableRects,
        droppableContainers: filteredDroppableContainers,
        active,
        ...rest,
      })

      return rectIntersectionCollisions
    }

    const collisions = []

    for (const droppableContainer of filteredDroppableContainers) {
      const { id } = droppableContainer

      const rect = droppableRects.get(id)

      if (rect) {
        const intersectionRatio = getIntersection(collisionRect, rect)

        if (intersectionRatio > 0) {
          collisions.push({
            id,
            data: { droppableContainer, value: intersectionRatio },
          })
        }
      }
    }

    return collisions.sort(sortCollisionsDesc)
  }

/**
 * Sort collisions in descending order (from greatest to smallest value)
 */
export function sortCollisionsDesc({ data: { value: a } }: any, { data: { value: b } }: any) {
  return a - b
}

function getIntersection(reference: ClientRect, entry: ClientRect) {
  if (reference.top < entry.top) {
    return 0
  }

  return reference.top - entry.top
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
