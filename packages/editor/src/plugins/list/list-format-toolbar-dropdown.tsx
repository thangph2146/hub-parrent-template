"use client"

import type { JSX } from "react"
import { ListIcon } from "lucide-react"

import {
  LIST_TOOLBAR_DROPDOWN_LABEL,
  LIST_TOOLBAR_PLACEHOLDER_VALUE,
  isListToolbarBlockType,
} from "../../config/editor-list-config"
import { useToolbarContext } from "../../context/toolbar-context"
import { blockTypeToBlockName } from "../toolbar/block-format/block-format-data"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
} from "../../ui/select"
import { IconSize } from "../../ui/typography"

/**
 * Dropdown toolbar riêng cho mọi kiểu list (Lexical ListPlugin / CheckListPlugin).
 * Tách khỏi dropdown block format chính (paragraph, heading, code, quote).
 * Thụt lề chỉ đi qua Tab/Shift+Tab để mỗi thao tác chỉ đổi một trạng thái.
 */
export function ListFormatDropDown({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const { blockType } = useToolbarContext()

  const inList = isListToolbarBlockType(blockType)
  const selectValue = inList ? blockType : LIST_TOOLBAR_PLACEHOLDER_VALUE
  const meta = inList ? blockTypeToBlockName[blockType] : undefined

  return (
    <Select
      modal={false}
      value={selectValue}
      onValueChange={(value) => {
        if (value === LIST_TOOLBAR_PLACEHOLDER_VALUE) return

        // This logic handles when the user selects an option from the dropdown
        // that corresponds to an actual command (not the placeholder)
        // However, the actual command execution is handled by the `onPointerDown`
        // of each `SelectItem` in the components like `FormatBulletedList`
      }}
    >
      <SelectTrigger
        className="editor-toolbar-select-trigger editor-toolbar-select-trigger--w-md"
        aria-label={LIST_TOOLBAR_DROPDOWN_LABEL}
      >
        <div className="editor-toolbar-select-icon">
          {meta?.icon ?? (
            <IconSize size="sm">
              <ListIcon />
            </IconSize>
          )}
        </div>
        <span className="editor-truncate editor-block-format-label">
          {meta?.label ?? LIST_TOOLBAR_DROPDOWN_LABEL}
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
  )
}
