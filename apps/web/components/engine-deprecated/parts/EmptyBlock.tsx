import { MagnifyingGlassIcon } from "@heroicons/react/24/solid"
import * as React from "react"

import { BlockType } from "../ast"

export const EmptyBlock = ({
  blockID,
  type,
  onPartResize,
}: {
  blockID: string
  type: BlockType
  onPartResize?: () => void
}) => {
  const [isActive, setIsActive] = React.useState(false)

  return (
    <>
      {type === "expression" ? (
        // empty expression button
        <button
          // bind:this="{buttonElement}"
          className={
            "bg-code-empty-expression hover:bg-code-empty-expression-hover inline w-fit cursor-pointer rounded px-1 leading-tight transition-colors" +
            (isActive ? " hidden" : "")
          }
          // on:click="{handleClick}"
          aria-haspopup="true"
          aria-expanded="false"
          aria-controls="{optionsAriaID}"
          tabIndex={-1}
        >
          ...
        </button>
      ) : (
        // empty statement button
        <button
          // bind:this="{buttonElement}"
          className={
            "hover:bg-code-empty-expression-hover group block w-fit cursor-pointer rounded px-1 py-1 leading-tight" +
            (isActive ? " hidden" : "")
          }
          // on:click="{handleClick}"
          aria-haspopup="true"
          aria-expanded="false"
          aria-controls="{optionsAriaID}"
          tabIndex={-1}
        >
          <MagnifyingGlassIcon className="invisible h-5 w-5 text-gray-400 group-hover:visible" />
          {/* <Icon
      src="{MagnifyingGlass}"
      theme="mini"
      class="fill-gray-400 "
      size="18px"
    /> */}
        </button>
      )}
    </>
  )
}

/* <script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte"
  import { computePosition } from "@floating-ui/dom"
  import { MagnifyingGlass } from "@steeze-ui/heroicons"
  import { Icon } from "@steeze-ui/svelte-icon"

  import type { BlockDefType } from "../blockUIDefinitions"
  import { onClickOutside } from "../utils"
  import { getBlockDB } from ".../BlockDBContext
  import type { SearchResult } from "../blockDB"



  let inputID = blockID
  let optionsAriaID = `${blockID}/options`

  let isActive = false
  let focusedItem = 0
  let searchInputText = ""
  let searchResults: SearchResult[] = []

  const blockDB = getBlockDB()

  let searchInputContainer: HTMLDivElement
  let buttonElement: HTMLButtonElement
  let searchInputElement: HTMLInputElement
  let searchListElement: HTMLDivElement

  let searchListLeftPosition = 0
  let searchListTopPosition = 0
  let searchListWidth = 340
  let searchListHeight = 420

  let disposeOnClickOutside: () => void

  const dispatch = createEventDispatcher()

  $: if (searchInputElement) {
    searchInputElement.focus()
  }

  $: if (isActive && searchListElement) {
    placeSearchList()
  }

  $: search(searchInputText)

  function search(text: string) {
    focusedItem = 0
    searchResults = blockDB.search(text, { type })
  }

  function handleSearchResultSelected(selectedResult: SearchResult) {
    if (selectedResult.type === "definition") {
      const newBlockID = blockDB.create(selectedResult.data.name)
      blockDB.replace(blockID, newBlockID)
    }

    isActive = false
  }

  function handleClick() {
    disposeOnClickOutside = onClickOutside(
      [buttonElement],
      () => [searchInputContainer, searchListElement],
      () => {
        isActive = false
        dispatch("part-resize", name)
      },
    )

    isActive = true
    dispatch("part-resize", name)
  }

  function placeSearchList() {
    computePosition(searchInputContainer, searchListElement, { placement: "bottom-start" }).then(
      ({ x, y }) => {
        searchListLeftPosition = x
        searchListTopPosition = y
      },
    )
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.shiftKey) {
      return
    }

    let eventHandledFlag = false

    if (event.key === "ArrowUp") {
      if (focusedItem === 0) {
        focusedItem = searchResults.length - 1
      } else {
        focusedItem--
      }
      eventHandledFlag = true
    } else if (event.key === "ArrowDown") {
      if (focusedItem === searchResults.length - 1) {
        focusedItem = 0
      } else {
        focusedItem++
      }
      eventHandledFlag = true
    } else if (event.key === "Enter") {
      handleSearchResultSelected(searchResults[focusedItem])

      eventHandledFlag = true
    } else if (event.key === "Escape" || event.key === "Esc") {
      isActive = false
      eventHandledFlag = true
    }

    if (eventHandledFlag) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  onDestroy(() => {
    if (disposeOnClickOutside) {
      disposeOnClickOutside()
    }
  })
</script>

{#if isActive}
  <div
    bind:this="{searchInputContainer}"
    class="{'flex items-baseline rounded bg-code-empty-expression-hover/30' +
      (type === 'expression' ? '' : '')}"
  >
    <label for="{inputID}" class="self-center mr-1">
      <Icon src="{MagnifyingGlass}" theme="mini" class="fill-gray-400 " size="18px" />
    </label>
    <input
      id="{inputID}"
      type="text"
      bind:this="{searchInputElement}"
      bind:value="{searchInputText}"
      role="combobox"
      aria-expanded="true"
      aria-controls="{optionsAriaID}"
      class="{'bg-transparent w-fit rounded transition-colors outline-0' +
        (type === 'expression' ? ' leading-tight' : ' leading-relaxed pr-1')}"
      on:keydown="{handleKeydown}"
    />
  </div>
{/if}

{#if type === "expression"}
  <!-- empty expression button -->
  <button
    bind:this="{buttonElement}"
    class="{'inline w-fit rounded leading-tight bg-code-empty-expression transition-colors hover:bg-code-empty-expression-hover px-1 cursor-pointer' +
      (isActive ? ' hidden' : '')}"
    on:click="{handleClick}"
    aria-haspopup="true"
    aria-expanded="false"
    aria-controls="{optionsAriaID}"
    tabindex="-1"
  >
    ...
  </button>
{:else}
  <!-- empty statement button -->
  <button
    bind:this="{buttonElement}"
    class="{'block group px-1 py-1 leading-tight w-fit rounded transition-colors hover:bg-code-empty-expression-hover cursor-pointer' +
      (isActive ? ' hidden' : '')}"
    on:click="{handleClick}"
    aria-haspopup="true"
    aria-expanded="false"
    aria-controls="{optionsAriaID}"
    tabindex="-1"
  >
    <Icon
      src="{MagnifyingGlass}"
      theme="mini"
      class="fill-gray-400 invisible group-hover:visible"
      size="18px"
    />
  </button>
{/if}

{#if isActive}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="absolute z-40 pt-1 cursor-default h-fit"
    bind:this="{searchListElement}"
    style="left: {searchListLeftPosition}px; top: {searchListTopPosition}px; width: {searchListWidth}px; max-height: {searchListHeight}px;"
    on:click="{() => {
      searchInputElement.focus()
    }}"
  >
    <!-- This container avoids clicking between the element and the list to close the list -->
    <div class="bg-white rounded shadow-md p-1">
      <ul role="listbox" id="{optionsAriaID}">
        {#each searchResults as searchResult, index}
          <li
            role="option"
            aria-selected="{index === focusedItem ? 'true' : 'false'}"
            class="{'px-2 py-1 mb-1 rounded cursor-pointer' +
              (index === focusedItem ? ' bg-code-empty-expression-hover/30' : '')}"
            on:mousemove="{(event) => {
              event.preventDefault()
              focusedItem = index
            }}"
            on:click="{() => {
              handleSearchResultSelected(searchResult)
            }}"
          >
            {#if searchResult.type === "definition"}
              {searchResult.data.name}
            {:else}
              {searchResult.data.refs.name}
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if} */
