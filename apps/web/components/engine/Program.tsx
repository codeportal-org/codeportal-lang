import {
  ClientRect,
  Collision,
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
import * as React from "react"
import { createPortal } from "react-dom"

import { Block } from "./Block"
import { BlockDBProvider, useBlockDB } from "./BlockDBContext"
import { ProgramUIStateProvider, useProgramUIState } from "./ProgramUIContext"
import { BlockDB } from "./blockDB"

export const Program = () => {
  return (
    <BlockDBProvider>
      <ProgramUIStateProvider>
        <ProgramUI />
      </ProgramUIStateProvider>
    </BlockDBProvider>
  )
}

export default Program

const ProgramUI = () => {
  const [rootBlockID, setRootBlockID] = React.useState<string | null>(null)

  const programContainerRef = React.useRef<any>()
  const observerRef = React.useRef<ResizeObserver>()

  const [programUIState, setProgramUIState] = useProgramUIState()
  const blockDB = useBlockDB()

  const sensors = useSensors(useSensor(PointerSensor))

  React.useEffect(() => {
    if (!blockDB) {
      return
    }

    if (blockDB.getAll().length > 0) {
      return
    }

    const newBlockID = blockDB.create("app", {
      statements: [
        blockDB.create("if statement", {
          then: [blockDB.create("empty statement"), blockDB.create("empty statement")],
        }),
        blockDB.create("if statement", {
          then: [blockDB.create("empty statement"), blockDB.create("empty statement")],
        }),
        blockDB.create("if statement", {
          then: [blockDB.create("empty statement"), blockDB.create("empty statement")],
        }),
        blockDB.create("if statement", {
          then: [
            blockDB.create("if statement", {
              then: [blockDB.create("empty statement")],
            }),
          ],
        }),
        blockDB.create("if statement", {
          then: [
            blockDB.create("if statement", {
              then: [blockDB.create("empty statement"), blockDB.create("empty statement")],
            }),
          ],
        }),
        blockDB.create("if statement", {
          then: [
            blockDB.create("if statement", {
              then: [blockDB.create("empty statement"), blockDB.create("empty statement")],
            }),
          ],
        }),
      ],
    })

    setRootBlockID(newBlockID)
  }, [blockDB])

  function handleDragStart({ active }: any) {
    if (programUIState) {
      setProgramUIState({ ...programUIState, activeBlockID: active.id })
    }
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!blockDB) {
      return
    }

    if (!over) {
      return
    }
    console.log("--- over", over.id)

    if (programUIState) {
      const overBlock = blockDB.getByID(over.id as string)

      const overBlockType = overBlock?.def.type

      setProgramUIState({
        ...programUIState,
        dropBlockID: over.id as string,
        dropIndicatorPosition: overBlockType === "statement" ? "middle" : "after",
      })
    }
  }

  function handleDragEnd({ active, over }: any) {
    if (!blockDB) {
      return
    }

    if (programUIState) {
      setProgramUIState({
        ...programUIState,
        activeBlockID: null,
        dropBlockID: null,
        dropIndicatorPosition: null,
      })
    }

    if (!over) {
      return
    }

    if (active.id !== over.id) {
      blockDB.moveToPosition(active.id, over.id)
    }
  }

  const handleDragCancel = () => {
    if (programUIState) {
      setProgramUIState({ ...programUIState, activeBlockID: null })
    }
  }

  const handleKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    console.log("event.key: ", event.key)
  }

  React.useEffect(() => {
    if (programContainerRef.current) {
      const observer = new ResizeObserver((entries) => {
        if (programUIState) {
          setProgramUIState({
            ...programUIState,
            availableWidth: entries[0].target.getBoundingClientRect().width,
          })
        }
      })
      observer.observe(programContainerRef.current)
      observerRef.current = observer
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetectionAlgorithm(blockDB)}
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
      <div className="flex w-full justify-center">
        <div
          role="application"
          aria-label="Program editor"
          // aria-activedescendant="{$focusState$.focusedElementID}"
          className="m-t-[200px] relative w-full max-w-[400px] p-4 pt-3 md:max-w-[752px]"
          ref={programContainerRef}
          tabIndex={0}
          onKeyDown={handleKeydown}
        >
          {rootBlockID !== null ? <Block blockID={rootBlockID} root /> : <div>Loading</div>}
        </div>
      </div>
      {createPortal(
        <DragOverlay>
          {programUIState.activeBlockID ? (
            <Block blockID={programUIState.activeBlockID} overlay />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}

const customCollisionDetectionAlgorithm =
  (blockDB: BlockDB | null): CollisionDetection =>
  ({ collisionRect, droppableRects, droppableContainers, active, ...rest }) => {
    if (!blockDB) {
      return []
    }

    console.log("collision calculation")

    if (!active.rect.current.initial || !active.rect.current.translated) {
      return []
    }

    // If the active block is not moved far enough, don't show any collision
    if (Math.abs(active.rect.current.initial.top - active.rect.current.translated.top) < 10) {
      console.log(
        "---- comparison []",
        Math.abs(active.rect.current.initial.top - active.rect.current.translated.top),
      )
      return []
    }

    const activeBlock = blockDB.getByID(active.id as string)

    const filteredDroppableContainers = droppableContainers.filter((droppableContainer) => {
      const { id } = droppableContainer
      const block = blockDB.getByID(id as string)

      if (activeBlock?.def.type !== block?.def.type) {
        return false
      }

      if (blockDB.isDescendantOf(id as string, active.id as string)) {
        return false
      }

      return true
    })

    if (activeBlock?.def.type === "expression") {
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
