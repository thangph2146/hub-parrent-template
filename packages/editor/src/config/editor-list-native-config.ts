/**
 * Toolbar song song cho list thuần Lexical (@lexical/list commands).
 * Tách khỏi dropdown list custom (marker, ListWithColorNode, …).
 */

export const LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY = {
  BULLET: "lexical-native-bullet",
  NUMBER: "lexical-native-number",
  CHECK: "lexical-native-check",
} as const

export type LexicalNativeListBlockFormatKey =
  (typeof LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY)[keyof typeof LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY]

export const LEXICAL_NATIVE_LIST_BLOCK_FORMAT_LABELS: Record<
  LexicalNativeListBlockFormatKey,
  string
> = {
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.BULLET]: "Lexical bullet list",
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.NUMBER]: "Lexical numbered list",
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.CHECK]: "Lexical task list",
}

export const LEXICAL_NATIVE_LIST_TOOLBAR_DROPDOWN_LABEL = "Lexical lists"

export const LEXICAL_NATIVE_LIST_TOOLBAR_PLACEHOLDER_VALUE =
  "__lexical_native_list_toolbar__" as const

const NATIVE_LIST_TYPE_BY_KEY: Record<
  LexicalNativeListBlockFormatKey,
  "bullet" | "number" | "check"
> = {
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.BULLET]: "bullet",
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.NUMBER]: "number",
  [LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.CHECK]: "check",
}

const NATIVE_KEY_BY_LIST_TYPE: Record<
  "bullet" | "number" | "check",
  LexicalNativeListBlockFormatKey
> = {
  bullet: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.BULLET,
  number: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.NUMBER,
  check: LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.CHECK,
}

/** Cursor trong list Lexical thuần (bullet/number/check) → value Select native toolbar. */
export function lexicalNativeListStateToToolbarBlockType(
  listType: "bullet" | "number" | "check"
): LexicalNativeListBlockFormatKey {
  return NATIVE_KEY_BY_LIST_TYPE[listType]
}

export function isLexicalNativeListToolbarBlockType(
  blockType: string
): blockType is LexicalNativeListBlockFormatKey {
  return blockType in NATIVE_LIST_TYPE_BY_KEY
}

export function lexicalNativeListTypeFromBlockFormatKey(
  blockFormatKey: LexicalNativeListBlockFormatKey
): "bullet" | "number" | "check" {
  return NATIVE_LIST_TYPE_BY_KEY[blockFormatKey]
}

export const LEXICAL_NATIVE_LIST_TOOLBAR_BLOCK_TYPES = [
  LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.BULLET,
  LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.NUMBER,
  LEXICAL_NATIVE_LIST_BLOCK_FORMAT_KEY.CHECK,
] as const
