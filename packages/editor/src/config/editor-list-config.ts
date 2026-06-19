/**
 * Cấu hình tập trung cho list trong Lexical editor.
 *
 * Lexical (@lexical/list, @lexical/react):
 * - `ListPlugin` + `INSERT_ORDERED_LIST_COMMAND` / `INSERT_UNORDERED_LIST_COMMAND` cho ol/ul.
 * - `CheckListPlugin` + `INSERT_CHECK_LIST_COMMAND` cho task list (cần CSS theme, xem Playground).
 * - Gom plugin trong `EditorListPlugins` để đăng ký đúng một lần trong `LexicalComposer`.
 *
 * Semantic / quốc tế:
 * - ol/ul/li; Tab chỉ đổi cấp lồng, theme không gắn depth class đổi marker/icon theo cấp.
 * - RTL: `padding-inline-start` trong theme.
 * - WCAG: checklist dùng pseudo-checkbox (::before); không tự ý gắn role/aria lên DOM Lexical.
 */

/** Số cấp lồng tối đa khi indent list (Tab). */
export const LIST_MAX_INDENT_DEPTH = 7 as const

/**
 * Bật đồng bộ `start` / hiển thị số cho các `ol` (number) **cùng parent** (cùng “cấp” block),
 * kể cả khi mỗi vùng chọn tạo **một thẻ `ol` riêng** (không gộp chung một `ol`).
 */
export const LIST_CONTINUE_NUMBERING_ACROSS_SIBLING_OLS = true as const

/**
 * `true` (mặc định): giữa hai `ol` có đoạn văn, bullet, quote… vẫn **tiếp tục** 1,2,3…
 * (phù hợp “đoạn xa” nhưng cùng cấp dưới cùng container).
 *
 * `false`: chỉ nối số khi hai `ol` **liền nhau** không có block nào xen giữa; có đoạn khác → reset về 1.
 */
export const LIST_CONTINUE_NUMBERING_ACROSS_INTERRUPTS = true as const

/**
 * Khi `LIST_CONTINUE_NUMBERING_ACROSS_INTERRUPTS` bật: gặp **heading** (h1–h6) thì bắt đầu lại chuỗi từ 1.
 * Mặc định `false`: nhiều nội dung tuyển sinh dùng mục I./II. (heading hoặc đoạn giữa các `ol`) vẫn cần nối số qua nhiều thẻ `ol` riêng.
 */
export const LIST_ORDERED_NUMBERING_RESET_AT_HEADING = false as const

/**
 * Giá trị `data-list-marker` / `setMarkerType` — đồng bộ `_lists.scss` và export HTML.
 * Không đổi chuỗi để tránh gãy nội dung đã lưu.
 */
export const LIST_MARKER_PRESET = {
  DASH: "-",
  PLUS: "+",
  ALPHA: "alpha",
  ALPHA_UPPER: "alpha-upper",
  ROMAN: "roman",
  ROMAN_UPPER: "roman-upper",
  MULTI_LEVEL: "multi-level",
} as const

export type ListMarkerPresetValue =
  (typeof LIST_MARKER_PRESET)[keyof typeof LIST_MARKER_PRESET]

/** Khóa block format (toolbar Select) — đồng bộ `blockTypeToBlockName` và toolbar state. */
export const LIST_BLOCK_FORMAT_KEY = {
  BULLET: "bullet",
  BULLET_DASH: "bullet-dash",
  BULLET_PLUS: "bullet-plus",
  NUMBER: "number",
  NUMBER_ALPHA: "number-alpha",
  NUMBER_ALPHA_UPPER: "number-alpha-upper",
  NUMBER_ROMAN: "number-roman",
  NUMBER_ROMAN_UPPER: "number-roman-upper",
  NUMBER_MULTI_LEVEL: "number-multi-level",
  CHECK: "check",
} as const

/** Nhãn toolbar: rõ ràng, gần thuật ngữ HTML/CSS (đa ngôn ngữ có thể thay layer i18n sau). */
export const LIST_BLOCK_FORMAT_LABELS: Record<
  (typeof LIST_BLOCK_FORMAT_KEY)[keyof typeof LIST_BLOCK_FORMAT_KEY],
  string
> = {
  [LIST_BLOCK_FORMAT_KEY.BULLET]: "Bullet list",
  [LIST_BLOCK_FORMAT_KEY.BULLET_DASH]: "Hyphen bullets (-)",
  [LIST_BLOCK_FORMAT_KEY.BULLET_PLUS]: "Plus bullets (+)",
  [LIST_BLOCK_FORMAT_KEY.NUMBER]: "Numbered list",
  [LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA]: "Lower alpha list (a)",
  [LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA_UPPER]: "Upper alpha list (A)",
  [LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN]: "Lower roman list (i)",
  [LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN_UPPER]: "Upper roman list (I)",
  [LIST_BLOCK_FORMAT_KEY.NUMBER_MULTI_LEVEL]: "Outline list (1.1)",
  [LIST_BLOCK_FORMAT_KEY.CHECK]: "Task list",
}

/** Thứ tự ul + preset marker (sau `FormatBulletedList` gốc). */
export const LIST_TOOLBAR_BULLET_MARKER_ITEMS: ReadonlyArray<{
  blockFormatValue:
    | typeof LIST_BLOCK_FORMAT_KEY.BULLET_DASH
    | typeof LIST_BLOCK_FORMAT_KEY.BULLET_PLUS
  listType: "bullet"
  markerType: ListMarkerPresetValue
}> = [
  {
    blockFormatValue: LIST_BLOCK_FORMAT_KEY.BULLET_DASH,
    listType: "bullet",
    markerType: LIST_MARKER_PRESET.DASH,
  },
  {
    blockFormatValue: LIST_BLOCK_FORMAT_KEY.BULLET_PLUS,
    listType: "bullet",
    markerType: LIST_MARKER_PRESET.PLUS,
  },
]

/** Ordered-list marker presets. Selecting these changes marker only, not indent. */
export const LIST_TOOLBAR_ORDERED_MARKER_ITEMS: ReadonlyArray<{
  blockFormatValue:
    | typeof LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA
    | typeof LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA_UPPER
    | typeof LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN
    | typeof LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN_UPPER
    | typeof LIST_BLOCK_FORMAT_KEY.NUMBER_MULTI_LEVEL
  listType: "number"
  markerType: ListMarkerPresetValue
}> = [
  {
    blockFormatValue: LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA,
    listType: "number",
    markerType: LIST_MARKER_PRESET.ALPHA,
  },
  {
    blockFormatValue: LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA_UPPER,
    listType: "number",
    markerType: LIST_MARKER_PRESET.ALPHA_UPPER,
  },
  {
    blockFormatValue: LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN,
    listType: "number",
    markerType: LIST_MARKER_PRESET.ROMAN,
  },
  {
    blockFormatValue: LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN_UPPER,
    listType: "number",
    markerType: LIST_MARKER_PRESET.ROMAN_UPPER,
  },
  {
    blockFormatValue: LIST_BLOCK_FORMAT_KEY.NUMBER_MULTI_LEVEL,
    listType: "number",
    markerType: LIST_MARKER_PRESET.MULTI_LEVEL,
  },
]

/** Ánh xạ trạng thái list trong editor → value Select toolbar. */
export function listStateToToolbarBlockType(
  listType: "bullet" | "number",
  markerType: string | undefined
): string {
  if (listType === "bullet") {
    if (markerType === LIST_MARKER_PRESET.DASH) {
      return LIST_BLOCK_FORMAT_KEY.BULLET_DASH
    }
    if (markerType === LIST_MARKER_PRESET.PLUS) {
      return LIST_BLOCK_FORMAT_KEY.BULLET_PLUS
    }
    return LIST_BLOCK_FORMAT_KEY.BULLET
  }
  if (markerType === LIST_MARKER_PRESET.ALPHA) {
    return LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA
  }
  if (markerType === LIST_MARKER_PRESET.ALPHA_UPPER) {
    return LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA_UPPER
  }
  if (markerType === LIST_MARKER_PRESET.ROMAN) {
    return LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN
  }
  if (markerType === LIST_MARKER_PRESET.ROMAN_UPPER) {
    return LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN_UPPER
  }
  if (markerType === LIST_MARKER_PRESET.MULTI_LEVEL) {
    return LIST_BLOCK_FORMAT_KEY.NUMBER_MULTI_LEVEL
  }
  return LIST_BLOCK_FORMAT_KEY.NUMBER
}

/** Các value block format thuộc dropdown list (toolbar). */
export const LIST_TOOLBAR_BLOCK_TYPES = [
  LIST_BLOCK_FORMAT_KEY.BULLET,
  LIST_BLOCK_FORMAT_KEY.BULLET_DASH,
  LIST_BLOCK_FORMAT_KEY.BULLET_PLUS,
  LIST_BLOCK_FORMAT_KEY.NUMBER,
  LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA,
  LIST_BLOCK_FORMAT_KEY.NUMBER_ALPHA_UPPER,
  LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN,
  LIST_BLOCK_FORMAT_KEY.NUMBER_ROMAN_UPPER,
  LIST_BLOCK_FORMAT_KEY.NUMBER_MULTI_LEVEL,
  LIST_BLOCK_FORMAT_KEY.CHECK,
] as const

export type ListToolbarBlockType = (typeof LIST_TOOLBAR_BLOCK_TYPES)[number]

export function isListToolbarBlockType(
  blockType: string
): blockType is ListToolbarBlockType {
  return (LIST_TOOLBAR_BLOCK_TYPES as readonly string[]).includes(blockType)
}

/**
 * Value nội bộ cho Select list khi con trỏ không ở block list — không render SelectItem tương ứng.
 */
export const LIST_TOOLBAR_PLACEHOLDER_VALUE = "__editor_list_toolbar__" as const

/** Nhãn trigger dropdown list khi chưa ở trong list. */
export const LIST_TOOLBAR_DROPDOWN_LABEL = "Lists"
