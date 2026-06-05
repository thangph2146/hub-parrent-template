import type { Row } from "@tanstack/react-table"

/** STT phẳng: `1.`, `2.` … */
export function formatFlatRowIndex(order: number, offset = 0): string {
  return `${offset + order + 1}.`
}

/**
 * STT cây theo cấp anh em: `1.`, `1.1.`, `1.2.`, `2.` …
 * `rootOffset` chỉ cộng vào số gốc (phân trang).
 */
export function formatHierarchicalRowIndex(
  row: Row<unknown>,
  rootOffset = 0
): string {
  const chain: Row<unknown>[] = []
  let current: Row<unknown> | undefined = row
  while (current) {
    chain.unshift(current)
    current = current.getParentRow()
  }
  const parts = chain.map((item, level) =>
    level === 0 ? item.index + 1 + rootOffset : item.index + 1
  )
  return `${parts.join(".")}.`
}

export function formatHierarchicalIndexFromPath(path: number[]): string {
  if (path.length === 0) return ""
  return `${path.join(".")}.`
}
