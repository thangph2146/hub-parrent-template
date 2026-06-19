"use client"

import { useEffect } from "react"
import { $isListNode, type ListNode } from "@lexical/list"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getRoot,
  $isElementNode,
  type LexicalEditor,
  type LexicalNode,
} from "lexical"

import { createListWithColorNodeFromRegistry } from "../../editor-x/nodes"
import { $isListWithColorNode } from "../../nodes/list-with-color-node"

const LIST_MARKER_INHERITANCE_TAG = "editor-list-marker-inheritance"

function findParentList(node: ListNode): ListNode | null {
  const listType = node.getListType()
  let parent = node.getParent()
  while (parent) {
    if ($isListNode(parent) && parent.getListType() === listType) {
      return parent
    }
    parent = parent.getParent()
  }
  return null
}

function getMarkerType(node: ListNode): string | undefined {
  return $isListWithColorNode(node) ? node.getMarkerType() : undefined
}

function findSiblingMarker(list: ListNode): string | undefined {
  const parent = list.getParent()
  if (!parent || !$isElementNode(parent)) return undefined
  const siblings = parent.getChildren()
  const listIndex = siblings.findIndex((child) => child.is(list))
  if (listIndex < 0) return undefined

  for (let i = listIndex - 1; i >= 0; i -= 1) {
    const sibling = siblings[i]
    if (!$isListNode(sibling) || sibling.getListType() !== list.getListType()) {
      continue
    }
    const marker = getMarkerType(sibling)
    if (marker) return marker
  }

  for (let i = listIndex + 1; i < siblings.length; i += 1) {
    const sibling = siblings[i]
    if (!$isListNode(sibling) || sibling.getListType() !== list.getListType()) {
      continue
    }
    const marker = getMarkerType(sibling)
    if (marker) return marker
  }

  return undefined
}

function findMarkerSource(list: ListNode): string | undefined {
  const parentList = findParentList(list)
  return (
    (parentList ? getMarkerType(parentList) : undefined) ??
    findSiblingMarker(list)
  )
}

function setMarkerType(
  editor: LexicalEditor,
  node: ListNode,
  markerType: string
): void {
  if ($isListWithColorNode(node)) {
    node.setMarkerType(markerType)
    return
  }
  const next = createListWithColorNodeFromRegistry(
    editor,
    node.getListType(),
    node.getStart(),
    node
  )
  next.setMarkerType(markerType)
  const children = node.getChildren()
  for (const child of children) next.append(child)
  node.replace(next)
}

function collectLists(node: LexicalNode, lists: ListNode[]): void {
  if ($isListNode(node)) lists.push(node)
  if (!$isElementNode(node)) return
  for (const child of node.getChildren()) collectLists(child, lists)
}

/**
 * Tab/Shift+Tab/Backspace chỉ đổi cấu trúc. Nếu Lexical tạo list mới bị mất
 * marker, khôi phục từ list cha hoặc list anh em cùng cấp gần nhất.
 */
export function ListMarkerInheritancePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ tags }) => {
      if (tags.has(LIST_MARKER_INHERITANCE_TAG)) return

      editor.update(
        () => {
          const lists: ListNode[] = []
          collectLists($getRoot(), lists)
          for (const list of lists) {
            if (list.getListType() === "check" || getMarkerType(list)) continue
            const marker = findMarkerSource(list)
            if (marker) setMarkerType(editor, list, marker)
          }
        },
        { tag: LIST_MARKER_INHERITANCE_TAG }
      )
    })
  }, [editor])

  return null
}
