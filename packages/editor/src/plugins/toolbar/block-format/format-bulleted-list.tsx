import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list"
import { $getSelection, $isRangeSelection } from "lexical"

import { useToolbarContext } from "../../../context/toolbar-context"
import { $tryPartialListTypeConversion } from "../../../lib/partial-list-type-conversion"
import {
  $applyListMarkerToKey,
  $applyListMarkerToSelection,
} from "../../../lib/list-marker-from-anchor"
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data"
import { SelectItem } from "../../../ui/select"
import { Flex } from "../../../ui/flex"

const BLOCK_FORMAT_VALUE = "bullet"

export function FormatBulletedList() {
  const { activeEditor, activeListTarget, blockType } = useToolbarContext()

  const formatBulletedList = () => {
    const isAnyBulletList =
      blockType === "bullet" ||
      (typeof blockType === "string" && blockType.startsWith("bullet-"))

    if (activeListTarget?.listType === "bullet") {
      activeEditor.update(() => {
        const selection = $getSelection()
        const changed = $isRangeSelection(selection)
          ? $applyListMarkerToSelection(
              activeEditor,
              selection,
              "bullet",
              undefined
            )
          : false
        if (!changed) {
          $applyListMarkerToKey(
            activeEditor,
            activeListTarget.key,
            "bullet",
            undefined
          )
        }
      })
      return
    }

    if (isAnyBulletList) {
      activeEditor.update(() => {
        const selection = $getSelection()
        const changed = $isRangeSelection(selection)
          ? $applyListMarkerToSelection(
              activeEditor,
              selection,
              "bullet",
              undefined
            )
          : false
        if (
          !changed &&
          activeListTarget?.listType === "bullet"
        ) {
          $applyListMarkerToKey(
            activeEditor,
            activeListTarget.key,
            "bullet",
            undefined
          )
        }
      })
      return
    }

    if (blockType !== "bullet") {
      activeEditor.update(() => {
        const selection = $getSelection()
        if (
          $isRangeSelection(selection) &&
          $tryPartialListTypeConversion(activeEditor, selection, "bullet")
        ) {
          const nextSelection = $getSelection()
          if ($isRangeSelection(nextSelection)) {
            $applyListMarkerToSelection(
              activeEditor,
              nextSelection,
              "bullet",
              undefined
            )
          }
          return
        }
        activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        const nextSelection = $getSelection()
        if ($isRangeSelection(nextSelection)) {
          $applyListMarkerToSelection(
            activeEditor,
            nextSelection,
            "bullet",
            undefined
          )
        }
      })
    }
  }

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onMouseDown={formatBulletedList}>
      <Flex align="center" gap={2}>
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.icon}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.label}
      </Flex>
    </SelectItem>
  )
}
