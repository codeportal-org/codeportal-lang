import { DragStartEvent, closestCorners, useDraggable, useDroppable } from "@dnd-kit/core"
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
import React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

import { CodeDB } from "./lang/codeDB"
import { useCodeDB } from "./lang/codeDBContext"
import {
  CodeNode,
  ExpressionNode,
  NumberLiteral,
  ProgramNode,
  StatementNode,
  StringLiteral,
  UINode,
  VarStatement,
  expressionTypes,
  uiNodeTypes,
} from "./lang/interpreter"

const draggedNodeIdAtom = atom<string | null>(null)
const droppedOnNodeIdAtom = atom<string | null>(null)

export const CodeTreeView = ({ codeTree }: { codeTree: ProgramNode | null }) => {
  const codeDB = useCodeDB()
  const sensors = useSensors(useSensor(PointerSensor))
  const [isCodeLoadedInDB, setIsCodeLoadedInDB] = React.useState(() => codeDB?.isCodeLoaded)

  const [draggedNodeId, setDraggedNodeId] = useAtom(draggedNodeIdAtom)
  const [droppedOnNodeId, setDroppedOnNodeId] = useAtom(droppedOnNodeIdAtom)

  const draggedNode = draggedNodeId ? codeDB?.getByID(draggedNodeId) : null

  console.log("--- draggedNode: ", draggedNode, draggedNodeId)

  const handleDragStart = ({ active }: DragStartEvent) => {
    console.log("drag start", active.id)
    setDraggedNodeId(active.id as string)
    setDroppedOnNodeId(null)
  }
  function handleDragOver({ active, over }: DragOverEvent) {
    console.log("drag over", over?.id)
    setDroppedOnNodeId(over?.id as string)
  }
  const handleDragEnd = () => {
    console.log("drag end")
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
      collisionDetection={closestCorners}
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
            uiNodeTypes.includes(draggedNode.type) ? (
              <UINodeView node={draggedNode as UINode} isOverlay={true} />
            ) : (
              <StatementView node={draggedNode as StatementNode} isOverlay={true} />
            )
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
  const hasParent = node.meta?.parent !== undefined

  const [draggedNodeId] = useAtom(draggedNodeIdAtom)
  const [droppedOnNodeId] = useAtom(droppedOnNodeIdAtom)

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
          "ring-4 ring-lime-600": !isOverlay && nodeId === droppedOnNodeId,
          "border-dashed opacity-90": isOverlay,
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
            <span className="text-code-keyword">component</span>
            <span className="pl-1">{/* spacer */}</span>
            <span className="text-code-callable"> {node.name} </span>
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
            <span className="text-code-keyword">fun</span>
            <span className="text-code-callable"> {node.name} </span>
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
      {node.type === "var" && <VariableStatementView node={node} />}
      {/* {node.type === "expression" && <ExpressionView node={node.expression} />} */}
      {node.type === "return" && (
        <div className="flex flex-row gap-1.5">
          <span className="text-code-keyword">return</span>
          <ExpressionView node={node.arg} />
        </div>
      )}
    </div>
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
      {node.type === "ref" && <ReferenceView node={node} />}
      {uiNodeTypes.includes(node.type) && <UINodeView node={node as UINode} />}
    </>
  )
}

export const UINodeView = ({ node, isOverlay }: { node: UINode; isOverlay?: boolean }) => {
  const nodeId = node.meta?.id!
  const hasNonUIParent = uiNodeTypes.includes(node.meta?.parent?.type!)

  const [draggedNodeId] = useAtom(draggedNodeIdAtom)
  const [droppedOnNodeId] = useAtom(droppedOnNodeIdAtom)

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: nodeId,
    data: { type: node.type },
    disabled: hasNonUIParent,
  })

  const droppable = useDroppable({
    id: nodeId,
    data: { type: node.type },
    disabled: hasNonUIParent,
  })

  return (
    <div
      className={cn(
        "bg-code-bg flex cursor-pointer select-none flex-col rounded-xl border border-slate-400 px-2 py-1",
        {
          "border-destructive": !isOverlay && nodeId === draggedNodeId,
          "ring-4 ring-lime-600": !isOverlay && nodeId === droppedOnNodeId,
          "border-dashed opacity-90": isOverlay,
        },
      )}
      ref={(ref) => {
        setNodeRef(ref)
        droppable.setNodeRef(ref)
      }}
      {...listeners}
      {...attributes}
    >
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

export const ReferenceView = ({ node }: { node: { name: string } }) => {
  return <span className="text-code-name">{node.name}</span>
}

function StatementList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col border-l border-l-slate-200 pl-9", className)}>
      {children}
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
