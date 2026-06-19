"use client"

import type { JSX } from "react"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"

import { LIST_MAX_INDENT_DEPTH } from "../../config/editor-list-config"
import { ListColorPlugin } from "../list-color-plugin"
import { ListMaxIndentLevelPlugin } from "../list-max-indent-level-plugin"
import { ListMarkerInheritancePlugin } from "./list-marker-inheritance-plugin"
import { OrderedListSiblingContinuationPlugin } from "./ordered-list-sibling-continuation-plugin"

/**
 * Gom plugin list theo khuyến nghị compose `@lexical/react`:
 * `CheckListPlugin`, `ListPlugin`, giới hạn indent tùy chỉnh, `ListColorPlugin` (marker/màu).
 * Giữ một cụm trong `LexicalComposer` để tránh đăng ký rải rác và lệch thứ tự command.
 */
export function EditorListPlugins(): JSX.Element {
  return (
    <>
      <CheckListPlugin />
      <ListPlugin />
      <ListMaxIndentLevelPlugin maxDepth={LIST_MAX_INDENT_DEPTH} />
      <ListMarkerInheritancePlugin />
      <ListColorPlugin />
      <OrderedListSiblingContinuationPlugin />
    </>
  )
}
