import { $insertList, type ListType } from "@lexical/list"
import { $getSelection, $isRangeSelection } from "lexical"

import type { ListMarkerPresetValue } from "../../../config/editor-list-config"
import { EDITOR_LIST_MARKER_TOOLBAR_TAG } from "../../../config/editor-list-config"
import { useToolbarContext } from "../../../context/toolbar-context"
import {
  $applyListMarkerToKey,
  $applyListMarkerToSelection,
} from "../../../lib/list-marker-from-anchor"
import { $tryPartialListTypeConversion } from "../../../lib/partial-list-type-conversion"
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data"
import { Flex } from "../../../ui/flex"
import { SelectItem } from "../../../ui/select"

interface FormatBulletMarkerProps {
  blockFormatValue: string
  listType: Extract<ListType, "bullet" | "number">
  /** Preset từ `LIST_MARKER_PRESET` — đồng bộ `data-list-marker` / theme. */
  markerType: ListMarkerPresetValue
}

export function FormatBulletMarker({
  blockFormatValue,
  listType,
  markerType,
}: FormatBulletMarkerProps) {
  const { activeEditor, activeListTarget, blockType } = useToolbarContext()

  const formatList = () => {
    const nextMarkerType =
      blockType === blockFormatValue ? undefined : markerType

    if (activeListTarget?.listType === listType) {
      activeEditor.update(
        () => {
          const selection = $getSelection()
          const changed = $isRangeSelection(selection)
            ? $applyListMarkerToSelection(
                activeEditor,
                selection,
                listType,
                nextMarkerType
              )
            : false
          if (!changed) {
            $applyListMarkerToKey(
              activeEditor,
              activeListTarget.key,
              listType,
              nextMarkerType
            )
          }
        },
        { tag: EDITOR_LIST_MARKER_TOOLBAR_TAG }
      )
      return
    }

    if (blockType !== blockFormatValue) {
      activeEditor.update(
        () => {
          const selection = $getSelection()

          if (
            $isRangeSelection(selection) &&
            $tryPartialListTypeConversion(activeEditor, selection, listType, {
              markerType: nextMarkerType,
            })
          ) {
            // If conversion was handled, the marker was also set. We just need to exit.
            return
          }

          // Bỏ qua nếu đang là list cùng kiểu, tránh việc insertList tự remove list.
          const isCurrentlySameListType =
            blockType === listType || blockType.startsWith(`${listType}-`)

          if (!isCurrentlySameListType) {
            $insertList(listType)
            // Lấy lại vùng chọn mới sau khi insertList (đồng bộ)
            const newSel = $getSelection()
            if ($isRangeSelection(newSel)) {
              $applyListMarkerToSelection(
                activeEditor,
                newSel,
                listType,
                nextMarkerType
              )
            }
            return // Đã xử lý xong việc insert list và set marker mới
          }

          const sel = $getSelection()
          const changed = $isRangeSelection(sel)
            ? $applyListMarkerToSelection(
                activeEditor,
                sel,
                listType,
                nextMarkerType
              )
            : false
          if (
            !changed &&
            activeListTarget?.listType === listType
          ) {
            $applyListMarkerToKey(
              activeEditor,
              activeListTarget.key,
              listType,
              nextMarkerType
            )
          }
        },
        { tag: EDITOR_LIST_MARKER_TOOLBAR_TAG }
      )
    }
  }

  return (
    <SelectItem value={blockFormatValue} onMouseDown={formatList}>
      <Flex align="center" gap={2}>
        {blockTypeToBlockName[blockFormatValue]?.icon}
        {blockTypeToBlockName[blockFormatValue]?.label}
      </Flex>
    </SelectItem>
  )
}
