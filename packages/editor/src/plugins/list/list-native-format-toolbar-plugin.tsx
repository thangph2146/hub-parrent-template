"use client"

import type { JSX } from "react"
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import type { LexicalCommand } from "lexical"
import { ListIcon, ListOrderedIcon, ListTodoIcon } from "lucide-react"

import { LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS } from "../../config/editor-list-native-config"
import { useToolbarContext } from "../../context/toolbar-context"
import { Button } from "../../ui/button"
import { IconSize } from "../../ui/typography"

type NativeListType = "bullet" | "number" | "check"

const NATIVE_LIST_ACTIONS: ReadonlyArray<{
  listType: NativeListType
  insertCommand: LexicalCommand<void>
  icon: JSX.Element
  label: string
}> = [
  {
    listType: "bullet",
    insertCommand: INSERT_UNORDERED_LIST_COMMAND,
    icon: (
      <IconSize size="sm">
        <ListIcon />
      </IconSize>
    ),
    label: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS["lexical-native-bullet"],
  },
  {
    listType: "number",
    insertCommand: INSERT_ORDERED_LIST_COMMAND,
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
    label: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS["lexical-native-number"],
  },
  {
    listType: "check",
    insertCommand: INSERT_CHECK_LIST_COMMAND,
    icon: (
      <IconSize size="sm">
        <ListTodoIcon />
      </IconSize>
    ),
    label: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS["lexical-native-check"],
  },
]

/**
 * Toolbar compact cho list thuần Lexical — 3 nút icon, luôn hiển thị cạnh dropdown Lists.
 * Chỉ dispatch INSERT_* / REMOVE_LIST (không marker custom).
 */
export function ListNativeFormatToolbarPlugin(): JSX.Element {
  const { activeEditor, blockType } = useToolbarContext()

  return (
    <>
      {NATIVE_LIST_ACTIONS.map(({ listType, insertCommand, icon, label }) => {
        const isActive = blockType === listType

        return (
          <Button
            key={listType}
            type="button"
            variant="ghost"
            className="editor-toolbar-item"
            title={label}
            aria-label={label}
            aria-pressed={isActive}
            data-state={isActive ? "on" : "off"}
            onClick={() => {
              if (isActive) {
                activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
              } else {
                activeEditor.dispatchCommand(insertCommand, undefined)
              }
            }}
          >
            {icon}
          </Button>
        )
      })}
    </>
  )
}
