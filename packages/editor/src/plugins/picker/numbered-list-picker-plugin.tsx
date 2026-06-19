import { INSERT_ORDERED_LIST_COMMAND } from "@lexical/list"
import { ListOrderedIcon } from "lucide-react"

import { ComponentPickerOption } from "../../plugins/picker/component-picker-option"
import { IconSize } from "../../ui/typography"

export function NumberedListPickerPlugin() {
  return new ComponentPickerOption("Numbered List", {
    icon: (
      <IconSize size="sm">
        <ListOrderedIcon />
      </IconSize>
    ),
    keywords: ["numbered list", "ordered list", "ol", "1. list"],
    onSelect: (_, editor) =>
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
  })
}
