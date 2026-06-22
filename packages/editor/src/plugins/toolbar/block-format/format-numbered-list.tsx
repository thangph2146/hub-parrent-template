import { INSERT_ORDERED_LIST_COMMAND } from "@lexical/list"
import { $getSelection, $isRangeSelection } from "lexical"

import {
  EDITOR_LIST_MARKER_TOOLBAR_TAG,
  LIST_BLOCK_FORMAT_KEY,
} from "../../../config/editor-list-config"
import { useToolbarContext } from "../../../context/toolbar-context"
import {
  $applyListMarkerToKey,
  $applyListMarkerToSelection,
} from "../../../lib/list-marker-from-anchor"
import { $tryPartialListTypeConversion } from "../../../lib/partial-list-type-conversion"
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data"
import { Flex } from "../../../ui/flex"
import { SelectItem } from "../../../ui/select"

const BLOCK_FORMAT_VALUE = LIST_BLOCK_FORMAT_KEY.NUMBER

export function FormatNumberedList() {
  const { activeEditor, activeListTarget, blockType } = useToolbarContext()

  const formatNumberedList = () => {
    if (activeListTarget?.listType === "number") {
      activeEditor.update(
        () => {
          const selection = $getSelection()
          const changed = $isRangeSelection(selection)
            ? $applyListMarkerToSelection(
                activeEditor,
                selection,
                "number",
                undefined
              )
            : false
          if (!changed) {
            $applyListMarkerToKey(
              activeEditor,
              activeListTarget.key,
              "number",
              undefined
            )
          }
        },
        { tag: EDITOR_LIST_MARKER_TOOLBAR_TAG }
      )
      return
    }

    activeEditor.update(
      () => {
      const selection = $getSelection()
      const isAnyNumberList =
        blockType === LIST_BLOCK_FORMAT_KEY.NUMBER ||
        blockType.startsWith("number-")
      if ($isRangeSelection(selection) && isAnyNumberList) {
        const changed = $applyListMarkerToSelection(
          activeEditor,
          selection,
          "number",
          undefined
        )
        if (!changed && activeListTarget?.listType === "number") {
          $applyListMarkerToKey(
            activeEditor,
            activeListTarget.key,
            "number",
            undefined
          )
        }
        return
      }
      if (
        !$isRangeSelection(selection) &&
        isAnyNumberList &&
        activeListTarget?.listType === "number"
      ) {
        $applyListMarkerToKey(
          activeEditor,
          activeListTarget.key,
          "number",
          undefined
        )
        return
      }
      if (
        $isRangeSelection(selection) &&
        $tryPartialListTypeConversion(activeEditor, selection, "number")
      ) {
        return
      }
      activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    },
      { tag: EDITOR_LIST_MARKER_TOOLBAR_TAG }
    )
  }

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onMouseDown={formatNumberedList}>
      <Flex align="center" gap={2}>
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.icon}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.label}
      </Flex>
    </SelectItem>
  )
}
