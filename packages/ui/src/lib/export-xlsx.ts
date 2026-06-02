import type { ColInfo } from "xlsx"

export type XlsxExportOptions = {
  title?: string
  subtitle?: string
  metadata?: Array<{ label: string; value: string | number | null | undefined }>
  columnWidths?: Array<number | undefined>
  columnWraps?: Array<boolean | undefined>
}

/**
 * Xuất .xlsx — đặt độ rộng cột theo nội dung (CSV không hỗ trợ width).
 */
export async function downloadXlsxFile(
  filename: string,
  headers: string[],
  rows: string[][],
  sheetName = "Dữ liệu",
  options?: XlsxExportOptions
): Promise<void> {
  const XLSX = await import("xlsx-js-style")
  const preambleRows: string[][] = []
  if (options?.title?.trim()) preambleRows.push([options.title.trim()])
  if (options?.subtitle?.trim()) preambleRows.push([options.subtitle.trim()])
  if (preambleRows.length) preambleRows.push([])
  if (options?.metadata?.length) {
    preambleRows.push(["THÔNG TIN BÁO CÁO"])
    for (const item of options.metadata) {
      preambleRows.push([item.label, String(item.value ?? "")])
    }
  }
  if (preambleRows.length) {
    preambleRows.push([])
    preambleRows.push(["DỮ LIỆU CHI TIẾT"])
  }

  const headerRowIndex = preambleRows.length
  const aoa = [...preambleRows, headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const colCount = Math.max(headers.length, ...rows.map((r) => r.length))
  const cols: ColInfo[] = []
  for (let c = 0; c < colCount; c++) {
    let max = String(headers[c] ?? "").length
    for (const row of rows) {
      max = Math.max(max, String(row[c] ?? "").length)
    }
    const preferred = options?.columnWidths?.[c]
    const wch =
      typeof preferred === "number"
        ? Math.min(Math.max(preferred, 10), 80)
        : Math.min(Math.max(max + 4, 14), 72)
    cols.push({ wch })
  }
  ws["!cols"] = cols
  ws["!freeze"] = { xSplit: 0, ySplit: headerRowIndex + 1 }

  const merges = []
  if (options?.title?.trim() && colCount > 1) {
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } })
  }
  if (options?.subtitle?.trim() && colCount > 1) {
    const row = options?.title?.trim() ? 1 : 0
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: colCount - 1 } })
  }
  const detailSectionRow = headerRowIndex - 1
  if (detailSectionRow >= 0 && colCount > 1) {
    merges.push({
      s: { r: detailSectionRow, c: 0 },
      e: { r: detailSectionRow, c: colCount - 1 },
    })
  }
  if (merges.length) ws["!merges"] = merges

  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1:A1")
  const reportInfoRow = preambleRows.findIndex(
    (row) => row[0] === "THÔNG TIN BÁO CÁO"
  )
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      const cell = ws[addr] as
        | { v?: unknown; s?: Record<string, unknown> }
        | undefined
      if (!cell) continue
      const isTitle = r === 0 && Boolean(options?.title?.trim())
      const isSubtitle =
        r === (options?.title?.trim() ? 1 : 0) &&
        Boolean(options?.subtitle?.trim())
      const isHeader = r === headerRowIndex
      const isReportInfo = r === reportInfoRow
      const isDetailSection = r === detailSectionRow
      const isMetadataLabel =
        reportInfoRow >= 0 &&
        r > reportInfoRow &&
        r < detailSectionRow &&
        c === 0
      const shouldWrap =
        isHeader ||
        Boolean(options?.columnWraps?.[c]) ||
        String(cell.v ?? "").length > 48
      cell.s = {
        ...(cell.s ?? {}),
        font: isTitle
          ? { bold: true, sz: 16, color: { rgb: "1F2937" } }
          : isHeader || isReportInfo || isDetailSection || isMetadataLabel
            ? { bold: true, color: { rgb: "1F2937" } }
            : cell.s?.font,
        fill:
          isHeader || isDetailSection
            ? { fgColor: { rgb: "E0F2FE" }, patternType: "solid" }
            : isReportInfo
              ? { fgColor: { rgb: "F1F5F9" }, patternType: "solid" }
              : cell.s?.fill,
        border: isHeader
          ? {
              top: { style: "thin", color: { rgb: "CBD5E1" } },
              bottom: { style: "thin", color: { rgb: "CBD5E1" } },
              left: { style: "thin", color: { rgb: "CBD5E1" } },
              right: { style: "thin", color: { rgb: "CBD5E1" } },
            }
          : cell.s?.border,
        alignment: {
          vertical: "top",
          wrapText: shouldWrap,
        },
      }
      if (
        isTitle ||
        isSubtitle ||
        isHeader ||
        isReportInfo ||
        isDetailSection
      ) {
        cell.s = {
          ...cell.s,
          alignment: {
            ...(cell.s.alignment as Record<string, unknown> | undefined),
            vertical: "center",
            wrapText: true,
            ...(isTitle || isSubtitle || isDetailSection
              ? { horizontal: "center" }
              : {}),
          },
        }
      }
    }
  }

  ws["!rows"] = aoa.map((row, index) => {
    if (index === 0 && options?.title?.trim()) return { hpt: 24 }
    if (index === detailSectionRow) return { hpt: 24 }
    if (index === headerRowIndex) return { hpt: 28 }
    const hasLongContent = row.some((cell) => String(cell ?? "").length > 80)
    return hasLongContent ? { hpt: 44 } : {}
  })

  const wb = XLSX.utils.book_new()
  const safeName =
    sheetName
      .replace(/[:\\/?*[\]]/g, " ")
      .trim()
      .slice(0, 31) || "Sheet1"
  XLSX.utils.book_append_sheet(wb, ws, safeName)
  const out = filename.toLowerCase().endsWith(".xlsx")
    ? filename
    : `${filename.replace(/\.csv$/i, "")}.xlsx`
  XLSX.writeFile(wb, out)
}

/** Đổi tên file .csv → .xlsx (giữ stem). */
export function csvBaseToXlsxFilename(csvFileName: string): string {
  const base = csvFileName.replace(/\.csv$/i, "")
  return `${base}.xlsx`
}
