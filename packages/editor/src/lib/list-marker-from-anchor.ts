import { $findMatchingParent } from "@lexical/utils"
import {
  $getNodeByKey,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
} from "lexical"
import {
  $isListItemNode,
  $isListNode,
  ListNode,
  type ListType,
} from "@lexical/list"

import { createListWithColorNodeFromRegistry } from "../editor-x/nodes"
import {
  $createListWithColorNode,
  $isListWithColorNode,
} from "../nodes/list-with-color-node"

function setListMarkerType(
  editor: LexicalEditor,
  listNode: ListNode,
  markerType: string | undefined
): void {
  if ($isListWithColorNode(listNode)) {
    listNode.setMarkerType(markerType)
    return
  }
  if (markerType === undefined) return
  const newList = createListWithColorNodeFromRegistry(
    editor,
    listNode.getListType(),
    listNode.getStart(),
    listNode
  )
  newList.setMarkerType(markerType)
  const children = listNode.getChildren()
  for (const child of children) newList.append(child)
  listNode.replace(newList)
}

function collectSelectedListKeys(
  selection: RangeSelection,
  listType: Extract<ListType, "bullet" | "number">
): Set<NodeKey> {
  const listKeys = new Set<NodeKey>()

  const collect = (node: LexicalNode | null) => {
    if (!node) return
    if ($isListNode(node) && node.getListType() === listType) {
      listKeys.add(node.getKey())
      return
    }
    const li = $findMatchingParent(node, $isListItemNode)
    if ($isListItemNode(li)) {
      const parent = li.getParent()
      if ($isListNode(parent) && parent.getListType() === listType) {
        listKeys.add(parent.getKey())
      }
    }
  }

  collect(selection.anchor.getNode())
  collect(selection.focus.getNode())
  for (const node of selection.getNodes()) collect(node)

  return listKeys
}

/** Gọi bên trong `editor.update`; đổi marker cho mọi list cùng kiểu trong vùng chọn. */
export function $applyListMarkerToSelection(
  editor: LexicalEditor,
  selection: RangeSelection,
  listType: Extract<ListType, "bullet" | "number">,
  markerType: string | undefined
): boolean {
  const listKeys = collectSelectedListKeys(selection, listType)
  if (listKeys.size === 0) return false

  for (const key of listKeys) {
    const node = $getNodeByKey(key)
    if ($isListNode(node) && node.getListType() === listType) {
      setListMarkerType(editor, node, markerType)
    }
  }
  return true
}

/** Gọi bên trong `editor.update`; fallback khi toolbar/dropdown làm mất selection. */
export function $applyListMarkerToKey(
  editor: LexicalEditor,
  listKey: NodeKey,
  listType: Extract<ListType, "bullet" | "number">,
  markerType: string | undefined
): boolean {
  const node = $getNodeByKey(listKey)
  if (!$isListNode(node) || node.getListType() !== listType) return false
  setListMarkerType(editor, node, markerType)
  return true
}

/** Gọi bên trong `editor.update`. */
export function $applyNumberListMarkerFromAnchor(
  editor: LexicalEditor,
  anchorNode: LexicalNode | null,
  markerType: string | undefined
): void {
  if (!anchorNode) return
  const nearestListNode = $findMatchingParent(
    anchorNode,
    (node): node is ListNode =>
      $isListNode(node) && node.getListType() === "number"
  )
  if (!nearestListNode) return
  let listNode: ListNode = nearestListNode
  let parent = listNode.getParent()
  while (parent) {
    if ($isListNode(parent) && parent.getListType() === "number") {
      listNode = parent
      parent = parent.getParent()
      continue
    }
    break
  }
  if ($isListWithColorNode(listNode)) {
    listNode.setMarkerType(markerType)
    return
  }
  if (markerType === undefined) return
  const newList = createListWithColorNodeFromRegistry(
    editor,
    listNode.getListType(),
    listNode.getStart(),
    listNode
  )
  newList.setMarkerType(markerType)
  const children = listNode.getChildren()
  for (const child of children) newList.append(child)
  listNode.replace(newList)
}

/** Gọi bên trong `editor.update`. */
export function $applyBulletListMarkerFromAnchor(
  editor: LexicalEditor,
  anchorNode: LexicalNode | null,
  markerType: string | undefined
): void {
  if (!anchorNode) return
  const nearestListNode = $findMatchingParent(
    anchorNode,
    (node): node is ListNode =>
      $isListNode(node) && node.getListType() === "bullet"
  )
  if (!nearestListNode) return
  let listNode: ListNode = nearestListNode
  let parent = listNode.getParent()
  while (parent) {
    if ($isListNode(parent) && parent.getListType() === "bullet") {
      listNode = parent
      parent = parent.getParent()
      continue
    }
    break
  }
  if ($isListWithColorNode(listNode)) {
    listNode.setMarkerType(markerType)
    return
  }
  if (markerType === undefined) return
  const newList = createListWithColorNodeFromRegistry(
    editor,
    listNode.getListType(),
    listNode.getStart(),
    listNode
  )
  newList.setMarkerType(markerType)
  const children = listNode.getChildren()
  for (const child of children) newList.append(child)
  listNode.replace(newList)
}

/** Gọi bên trong `editor.update`. */
export function $syncNumberListMarkerToSiblingLists(
  targetListNode: ListNode,
  markerType: string | undefined
): void {
  const parent = targetListNode.getParent()
  if (!parent) return
  for (const sibling of parent.getChildren()) {
    if (
      $isListNode(sibling) &&
      sibling.getListType() === "number" &&
      sibling !== targetListNode
    ) {
      if ($isListWithColorNode(sibling)) {
        sibling.setMarkerType(markerType)
      } else {
        const newList = $createListWithColorNode("number", sibling.getStart())
        newList.setMarkerType(markerType)
        const children = sibling.getChildren()
        for (const child of children) newList.append(child)
        sibling.replace(newList)
      }
    }
  }
}
