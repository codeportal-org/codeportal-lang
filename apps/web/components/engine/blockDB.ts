import { PrimitiveAtom, atom, createStore } from "jotai"
import MiniSearch from "minisearch"

import type { Block, BlockDefinition, BlockName } from "./ast"
import { blockDefinition, blockDefinitionsNoEmpty } from "./blockDefinitions"
import { handleError } from "./errors"
import { nanoid } from "./nanoId"

export type BlockEvent = {
  type: "child removed"
  name: string
}

let serial = 0

type BlockAtom = PrimitiveAtom<Block>

export function createBlockDB() {
  const childParentIndex = new Map<
    string,
    { name: string; parentID: string; type: "single" | "list" }
  >()
  const blockAtomIndex = new Map<string, BlockAtom>()

  const atomStore = createStore()

  const searchIndex = new MiniSearch({
    fields: ["name", "description"],
    storeFields: ["type"],
    searchOptions: {
      boost: { name: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
  })

  searchIndex.addAll(blockDefinitionsNoEmpty)

  function getByID(blockID: string): Block | undefined {
    const blockAtom = blockAtomIndex.get(blockID)

    return blockAtom ? atomStore.get(blockAtom) : undefined
  }

  function getAtomByID(blockID: string): BlockAtom | undefined {
    return blockAtomIndex.get(blockID)
  }

  function create(name: BlockName, extraRefs = {}, extraData = {}): string {
    const id = serial + ""
    serial++

    const blockDef = blockDefinition[name]

    const refs: Record<string, null | string | string[]> = { ...extraRefs }
    const data: Record<string, any> = { ...extraData }

    for (const part of blockDef.parts) {
      if (part.type == "group") {
        for (const subPart of part.parts) {
          if (subPart.type === "expression") {
            if (!(subPart.name in refs)) {
              const childBlockID = create("empty expression")
              refs[subPart.name] = childBlockID
            }
            childParentIndex.set(refs[subPart.name] as string, {
              name: subPart.name,
              parentID: id,
              type: "single",
            })
          } else if (subPart.type === "statement list") {
            if (!(subPart.name in refs)) {
              const childBlockID = create("empty statement")
              refs[subPart.name] = [childBlockID]
            }

            const ref = refs[subPart.name] as string[]

            for (const subBlockID of ref) {
              childParentIndex.set(subBlockID, { name: subPart.name, parentID: id, type: "list" })
            }
          }
        }
      }
    }

    const blockAST: Block = {
      id,
      name,
      refs,
      data,
      state: {},
      def: blockDef,
    }

    const blockAtom = atom(blockAST)

    blockAtomIndex.set(id, blockAtom)

    return id
  }

  function search(text: string, options: { name: BlockName }): SearchResult[] {
    const results = searchIndex.search(text, {
      filter: (result) => result.name === options.name,
    })

    if (results.length > 0) {
      return results.map((result) => {
        if (result.id.startsWith("core/")) {
          return {
            id: result.id,
            type: "definition",
            data: blockDefinition[result.id.replace("core/", "") as BlockName],
          }
        } else {
          return {
            id: result.id,
            type: "block",
            data: getByID(result.id) as Block,
          }
        }
      })
    }

    // default suggestions
    return blockDefinitionsNoEmpty
      .filter((def) => def.name === options.name)
      .map(
        (def) =>
          ({
            id: def.id,
            type: "definition",
            data: def,
          } as SearchResult),
      )
  }

  function replace(blockID: string, newBlockID: string): boolean {
    const block = getByID(blockID)
    const newBlock = getByID(newBlockID)
    if (!block || !newBlock) {
      return false
    }

    const childParentInfo = childParentIndex.get(blockID)
    if (!childParentInfo) {
      return false
    }

    const parent = getByID(childParentInfo.parentID)

    if (!parent) {
      return false
    }

    if (childParentInfo.type === "single") {
      // if the new block is an expression that had a parent, we need to create an empty expression to fill the space
      if (childParentIndex.has(newBlockID)) {
        const newBlockParentInfo = childParentIndex.get(newBlockID)
        if (newBlockParentInfo) {
          const newBlockParent = getByID(newBlockParentInfo.parentID)
          if (newBlockParent) {
            const emptyExpressionID = create("empty expression")
            newBlockParent.refs[newBlockParentInfo.name] = emptyExpressionID
            childParentIndex.set(emptyExpressionID, {
              parentID: newBlockParentInfo.parentID,
              name: newBlockParentInfo.name,
              type: "single",
            })
          }
        }
      }

      // then we can replace the block
      parent.refs[childParentInfo.name] = newBlockID
      childParentIndex.set(newBlockID, {
        parentID: childParentInfo.parentID,
        name: childParentInfo.name,
        type: "single",
      })
    } else {
      parent.refs[childParentInfo.name] = (parent.refs[childParentInfo.name] as string[]).map(
        (subBlockID) => (subBlockID === blockID ? newBlockID : subBlockID),
      )
      childParentIndex.set(newBlockID, {
        parentID: childParentInfo.parentID,
        name: childParentInfo.name,
        type: "list",
      })
    }

    const parentAtom = getAtomByID(childParentInfo.parentID)
    if (parentAtom) {
      atomStore.set(parentAtom, { ...parent })
    }

    _delete(blockID)

    return true
  }

  function addEmptyStatementAfter(blockID: string): boolean {
    const parentRelation = childParentIndex.get(blockID)

    if (!parentRelation) {
      return false
    }

    const { parentID, name, type } = parentRelation

    if (type !== "list") {
      return false
    }

    const emptyStatementID = create("empty statement")

    const parentBlock = getByID(parentID)
    if (!parentBlock) {
      return false
    }

    const blockIndex = parentBlock.refs[name].findIndex(
      (subBlockID: string) => subBlockID === blockID,
    )
    parentBlock.refs[name].splice(blockIndex + 1, 0, emptyStatementID)

    childParentIndex.set(emptyStatementID, {
      parentID: parentID,
      name: name,
      type: "list",
    })

    const parentBlockAtom = getAtomByID(parentID)
    if (parentBlockAtom) {
      atomStore.set(parentBlockAtom, { ...parentBlock })
    }

    return true
  }

  /** Internal delete function */
  function _delete(blockID: string) {
    blockAtomIndex.delete(blockID)
    childParentIndex.delete(blockID)
  }

  /** External delete function, it ensures program consistency */
  function deleteBlock(blockID: string): boolean {
    const block = getByID(blockID)
    if (!block) {
      return false
    }

    const blockDef = blockDefinition[block.name]

    const parentRelation = childParentIndex.get(blockID)
    if (parentRelation) {
      const { parentID, name, type } = parentRelation

      if (blockDef.type === "expression") {
        const emptyExpressionID = create("empty expression")
        replace(blockID, emptyExpressionID)
      } else {
        const parentBlock = getByID(parentID)
        if (!parentBlock) {
          return false
        }

        parentBlock.refs[name] = parentBlock.refs[name].filter(
          (subBlockID: string) => subBlockID !== blockID,
        )

        const parentAtom = getAtomByID(parentID)
        if (parentAtom) {
          atomStore.set(parentAtom, { ...parentBlock })
        }
      }
    }

    _delete(blockID)

    return true
  }

  /*
   * Evaluates if a block has the same parent as another block
   */
  function sameParent(blockID: string, targetBlockID: string): boolean {
    const blockParentRelation = childParentIndex.get(blockID)
    const targetBlockParentRelation = childParentIndex.get(targetBlockID)

    if (!targetBlockParentRelation || !blockParentRelation) {
      return false
    }

    return (
      targetBlockParentRelation.parentID === blockParentRelation.parentID &&
      targetBlockParentRelation.name === blockParentRelation.name
    )
  }

  /**
   * Moves a block to a new position in a list
   */
  function moveToBlockPosition(blockID: string, targetBlockID: string): boolean {
    if (blockID === targetBlockID) {
      return false
    }

    const blockParentRelation = childParentIndex.get(blockID)
    const targetBlockParentRelation = childParentIndex.get(targetBlockID)

    if (!targetBlockParentRelation || !blockParentRelation) {
      return false
    }

    if (targetBlockParentRelation.type !== blockParentRelation.type) {
      return false
    }

    const blockParent = getByID(blockParentRelation.parentID)
    const targetBlockParent = getByID(targetBlockParentRelation.parentID)

    if (!blockParent || !targetBlockParent) {
      handleError("Corrupted childParentIndex", {
        blockID,
        targetBlockID,
        blockParentID: blockParentRelation.parentID,
        targetBlockParentID: targetBlockParentRelation.parentID,
      })
      return false
    }

    console.log("moveToBlockPosition", blockID, "--->", targetBlockID)

    if (targetBlockParentRelation.type === "single") {
      return replace(targetBlockID, blockID)
    }

    // block ---> targetBlock insert, displacing targetBlock
    const blockIndex = blockParent.refs[blockParentRelation.name].indexOf(blockID)
    const targetBlockIndex =
      targetBlockParent.refs[targetBlockParentRelation.name].indexOf(targetBlockID)

    blockParent.refs[blockParentRelation.name].splice(blockIndex, 1)
    blockParent.refs[blockParentRelation.name] = [...blockParent.refs[blockParentRelation.name]]

    targetBlockParent.refs[targetBlockParentRelation.name].splice(targetBlockIndex, 0, blockID)
    targetBlockParent.refs[targetBlockParentRelation.name] = [
      ...targetBlockParent.refs[targetBlockParentRelation.name],
    ]

    if (blockParent.id !== targetBlockParent.id) {
      childParentIndex.set(blockID, {
        parentID: targetBlockParentRelation.parentID,
        name: targetBlockParentRelation.name,
        type: "list",
      })

      const parentBlockAtom = blockAtomIndex.get(blockParentRelation.parentID)
      if (parentBlockAtom) {
        atomStore.set(parentBlockAtom, { ...blockParent })
      }

      const targetParentBlockAtom = blockAtomIndex.get(targetBlockParentRelation.parentID)
      if (targetParentBlockAtom) {
        atomStore.set(targetParentBlockAtom, { ...targetBlockParent })
      }
    } else {
      const parentBlockAtom = blockAtomIndex.get(blockParentRelation.parentID)
      if (parentBlockAtom) {
        atomStore.set(parentBlockAtom, { ...blockParent })
      }
    }

    return true
  }

  function setBlockState(blockID: string, stateName: string, value: any) {
    const blockAtom = getAtomByID(blockID)

    if (blockAtom) {
      atomStore.set(blockAtom, { ...atomStore.get(blockAtom), [stateName]: value })
    }
  }

  function getParentByID(blockID: string): Block | undefined {
    const parentRelation = childParentIndex.get(blockID)

    if (!parentRelation) {
      return undefined
    }

    const parentBlock = getByID(parentRelation.parentID)

    return parentBlock
  }

  function getAllBlocks() {
    return [...blockAtomIndex.values()].map((atom) => atomStore.get(atom))
  }

  function isDescendantOf(blockID: string, parentID: string): boolean {
    const parentRelation = childParentIndex.get(blockID)

    if (!parentRelation) {
      return false
    }

    if (parentRelation.parentID === parentID) {
      return true
    }

    return isDescendantOf(parentRelation.parentID, parentID)
  }

  return {
    getByID,
    getAtomByID,
    getParentByID,
    search,
    create,
    replace,
    addEmptyStatementAfter,
    delete: deleteBlock,
    sameParent,
    moveToPosition: moveToBlockPosition,
    setBlockState,
    isDescendantOf,
    atomStore,

    /** just for testing do not access directly */
    getAll: getAllBlocks,
  }
}

export type BlockDB = ReturnType<typeof createBlockDB>

export type SearchResult =
  | {
      id: string
      type: "definition"
      data: BlockDefinition
    }
  | {
      id: string
      type: "block"
      data: Block
    }
