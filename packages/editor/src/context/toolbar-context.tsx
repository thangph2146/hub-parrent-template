"use client"

import { createContext, JSX, useContext } from "react"
import { LexicalEditor, type NodeKey } from "lexical"
import type { ListType } from "@lexical/list"

export type ActiveListTarget = {
  key: NodeKey
  listType: ListType
} | null

const Context = createContext<{
  activeEditor: LexicalEditor
  activeListTarget: ActiveListTarget
  $updateToolbar: () => void
  blockType: string
  setBlockType: (blockType: string) => void
  showModal: (
    title: string,
    showModal: (onClose: () => void) => JSX.Element,
    closeOnClickOutside?: boolean,
    dialogContentClassName?: string
  ) => void
}>({
  activeEditor: {} as LexicalEditor,
  activeListTarget: null,
  $updateToolbar: () => {},
  blockType: "paragraph",
  setBlockType: () => {},
  showModal: () => {},
})

export function ToolbarContext({
  activeEditor,
  activeListTarget,
  $updateToolbar,
  blockType,
  setBlockType,
  showModal,
  children,
}: {
  activeEditor: LexicalEditor
  activeListTarget: ActiveListTarget
  $updateToolbar: () => void
  blockType: string
  setBlockType: (blockType: string) => void
  showModal: (
    title: string,
    showModal: (onClose: () => void) => JSX.Element,
    closeOnClickOutside?: boolean,
    dialogContentClassName?: string
  ) => void
  children: React.ReactNode
}) {
  return (
    <Context.Provider
      value={{
        activeEditor,
        activeListTarget,
        $updateToolbar,
        blockType,
        setBlockType,
        showModal,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export function useToolbarContext() {
  return useContext(Context)
}
