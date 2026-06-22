"use client"

import { type CSSProperties, type ReactNode, useEffect, useState } from "react"
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
} from "lexical"
import { $findMatchingParent } from "@lexical/utils"
import { $isListNode, type ListNode } from "@lexical/list"
import { $isCodeNode } from "@lexical/code"
import { $isHeadingNode } from "@lexical/rich-text"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { ToolbarContext } from "../../context/toolbar-context"
import type { ActiveListTarget } from "../../context/toolbar-context"
import { useEditorModal } from "../../editor-hooks/use-modal"
import { useHeaderHeight } from "../../hooks/use-header-height"
import { cn } from "../../lib/utils"
import { blockTypeToBlockName } from "../../plugins/toolbar/block-format/block-format-data"
import { listStateToToolbarBlockType } from "../../config/editor-list-config"
import { $isListWithColorNode } from "../../nodes/list-with-color-node"

export function ToolbarPlugin({
  children,
  className,
  style,
  stickyTop,
}: {
  children: (props: { blockType: string }) => ReactNode
  className?: string
  style?: CSSProperties
  stickyTop?: number
}) {
  const [editor] = useLexicalComposerContext()
  const { headerHeight } = useHeaderHeight()

  const [activeEditor, setActiveEditor] = useState(editor)
  const [activeListTarget, setActiveListTarget] =
    useState<ActiveListTarget>(null)
  const [blockType, setBlockType] = useState<string>("paragraph")

  const [modal, showModal] = useEditorModal()

  const $updateToolbar = () => {}

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor)

        newEditor.getEditorState().read(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            try {
              const anchorNode = selection.anchor.getNode()
              let element =
                anchorNode.getKey() === "root"
                  ? anchorNode
                  : $findMatchingParent(anchorNode, (e) => {
                      const parent = e.getParent()
                      return parent !== null && $isRootOrShadowRoot(parent)
                    })

              if (element === null) {
                try {
                  element = anchorNode.getTopLevelElementOrThrow()
                } catch {
                  setBlockType("paragraph")
                  return false
                }
              }

              const elementType = element.getType()
              const nearestList = $isListNode(anchorNode)
                ? anchorNode
                : $findMatchingParent(anchorNode, $isListNode)

              if ($isListNode(nearestList)) {
                const listNode = nearestList as ListNode
                const listType = listNode.getListType()
                setActiveListTarget({
                  key: listNode.getKey(),
                  listType,
                })
                if (
                  $isListWithColorNode(listNode) &&
                  (listType === "bullet" || listType === "number")
                ) {
                  setBlockType(
                    listStateToToolbarBlockType(
                      listType,
                      listNode.getMarkerType()
                    )
                  )
                } else {
                  setBlockType(listType)
                }
              } else if ($isCodeNode(element)) {
                setActiveListTarget(null)
                setBlockType("code")
              } else if ($isHeadingNode(element)) {
                setActiveListTarget(null)
                setBlockType(element.getTag())
              } else if (elementType in blockTypeToBlockName) {
                setActiveListTarget(null)
                setBlockType(elementType)
              } else {
                setActiveListTarget(null)
                setBlockType("paragraph")
              }
            } catch {
              setActiveListTarget(null)
              setBlockType("paragraph")
            }
          }
        })

        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor])

  const topValue = stickyTop ?? Math.round(headerHeight)

  return (
    <ToolbarContext
      activeEditor={activeEditor}
      activeListTarget={activeListTarget}
      $updateToolbar={$updateToolbar}
      blockType={blockType}
      setBlockType={setBlockType}
      showModal={showModal}
    >
      {modal}

      <div
        className={cn("editor-toolbar", className)}
        style={{
          ...style,
          position: "sticky",
          top: topValue,
          zIndex: 50,
        }}
      >
        {children({ blockType })}
      </div>
    </ToolbarContext>
  )
}
