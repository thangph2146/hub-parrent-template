import { INSERT_ORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list"
import { $getSelection, $isRangeSelection } from "lexical"

import { LIST_BLOCK_FORMAT_KEY } from "../../../config/editor-list-config"
import { useToolbarContext } from "../../../context/toolbar-context"
import { $applyNumberListMarkerFromAnchor } from "../../../lib/list-marker-from-anchor"
import { $tryPartialListTypeConversion } from "../../../lib/partial-list-type-conversion"
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data"
import { Flex } from "../../../ui/flex"
import { SelectItem } from "../../../ui/select"

const BLOCK_FORMAT_VALUE = LIST_BLOCK_FORMAT_KEY.NUMBER

export function FormatNumberedList() {
  const { activeEditor, blockType } = useToolbarContext()

  const formatParagraph = () => {
    activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
  }

  const formatNumberedList = () => {
    if (blockType === BLOCK_FORMAT_VALUE) {
      formatParagraph()
      return
    }

    activeEditor.update(() => {
      const selection = $getSelection()
      const isAnyNumberList =
        blockType === LIST_BLOCK_FORMAT_KEY.NUMBER ||
        blockType.startsWith("number-")
      if ($isRangeSelection(selection) && isAnyNumberList) {
        $applyNumberListMarkerFromAnchor(
          activeEditor,
          selection.anchor.getNode(),
          undefined
        )
        $applyNumberListMarkerFromAnchor(
          activeEditor,
          selection.focus.getNode(),
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
    })
  }

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onPointerDown={formatNumberedList}>
      <Flex align="center" gap={2}>
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.icon}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.label}
      </Flex>
    </SelectItem>
  )
}
