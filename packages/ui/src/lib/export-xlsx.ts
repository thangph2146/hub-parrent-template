import type { ColInfo } from "xlsx"

export type XlsxMetadataItem = {
  label: string
  value: string | number | null | undefined
}

/** Bảng liên quan trên cùng sheet (sau dữ liệu chính). */
export type XlsxRelatedSection = {
  /** Tiêu đề section — merge full width như「DỮ LIỆU CHIẾT」 */
  title: string
  /** Gợi ý quan hệ, vd.「1 yêu cầu → nhiều dòng đăng ký」 */
  relationHint?: string
  headers: string[]
  rows: string[][]
  columnWidths?: Array<number | undefined>
  columnWraps?: Array<boolean | undefined>
}

export type XlsxExportOptions = {
  title?: string
  subtitle?: string
  metadata?: XlsxMetadataItem[]
  columnWidths?: Array<number | undefined>
  columnWraps?: Array<boolean | undefined>
  relatedSections?: XlsxRelatedSection[]
}

export type XlsxSheetPayload = {
  sheetName: string
  headers: string[]
  rows: string[][]
  options?: XlsxExportOptions
}

const SECTION_MAIN = "DỮ LIỆU CHI TIẾT"
const SECTION_REPORT = "THÔNG TIN BÁO CÁO"

type SheetLayout = {
  aoa: string[][]
  headerRowIndexes: number[]
  sectionTitleRows: number[]
  reportInfoRow: number
  detailSectionRow: number
  colCount: number
}

function padRow(row: string[], colCount: number): string[] {
  const out = [...row]
  while (out.length < colCount) out.push("")
  return out.slice(0, colCount)
}

function buildSheetLayout(
  headers: string[],
  rows: string[][],
  options?: XlsxExportOptions,
): SheetLayout {
  const preambleRows: string[][] = []
  if (options?.title?.trim()) preambleRows.push([options.title.trim()])
  if (options?.subtitle?.trim()) preambleRows.push([options.subtitle.trim()])
  if (preambleRows.length) preambleRows.push([])
  if (options?.metadata?.length) {
    preambleRows.push([SECTION_REPORT])
    for (const item of options.metadata) {
      preambleRows.push([item.label, String(item.value ?? "")])
    }
  }

  const blocks: Array<{ sectionTitle?: string; relationHint?: string; headers: string[]; rows: string[][] }> = []

  if (preambleRows.length || headers.length) {
    blocks.push({ sectionTitle: preambleRows.length ? SECTION_MAIN : undefined, headers, rows })
  } else {
    blocks.push({ headers, rows })
  }

  for (const section of options?.relatedSections ?? []) {
    blocks.push({
      sectionTitle: section.title,
      relationHint: section.relationHint,
      headers: section.headers,
      rows: section.rows,
    })
  }

  const headerRowIndexes: number[] = []
  const sectionTitleRows: number[] = []
  const aoa: string[][] = [...preambleRows]

  let colCount = Math.max(headers.length, ...rows.map((r) => r.length), 2)

  for (const block of blocks) {
    if (block.sectionTitle) {
      if (aoa.length) aoa.push([])
      aoa.push([block.sectionTitle])
      sectionTitleRows.push(aoa.length - 1)
    }
    if (block.relationHint?.trim()) {
      aoa.push([block.relationHint.trim()])
    }
    if (block.headers.length) {
      aoa.push(block.headers)
      headerRowIndexes.push(aoa.length - 1)
      colCount = Math.max(
        colCount,
        block.headers.length,
        ...block.rows.map((r) => r.length),
      )
    }
    for (const row of block.rows) {
      aoa.push(row)
      colCount = Math.max(colCount, row.length)
    }
  }

  const paddedAoa = aoa.map((row) => padRow(row, colCount))
  const reportInfoRow = paddedAoa.findIndex((row) => row[0] === SECTION_REPORT)
  const detailSectionRow = sectionTitleRows.find(
    (r) => paddedAoa[r]?.[0] === SECTION_MAIN,
  ) ?? -1

  return {
    aoa: paddedAoa,
    headerRowIndexes,
    sectionTitleRows,
    reportInfoRow,
    detailSectionRow,
    colCount,
  }
}

function applySheetStyles(
  ws: Record<string, unknown>,
  layout: SheetLayout,
  options?: XlsxExportOptions,
): void {
  const range = (ws["!ref"] as string) ?? "A1:A1"
  const decoded = decodeRange(range)
  const { colCount, headerRowIndexes, sectionTitleRows, reportInfoRow, detailSectionRow } = layout

  const merges: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }> = []
  if (options?.title?.trim() && colCount > 1) {
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } })
  }
  if (options?.subtitle?.trim() && colCount > 1) {
    const row = options?.title?.trim() ? 1 : 0
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: colCount - 1 } })
  }
  for (const r of sectionTitleRows) {
    if (colCount > 1) {
      merges.push({ s: { r, c: 0 }, e: { r, c: colCount - 1 } })
    }
  }
  if (merges.length) ws["!merges"] = merges

  for (let r = decoded.s.r; r <= decoded.e.r; r++) {
    for (let c = decoded.s.c; c <= decoded.e.c; c++) {
      const addr = encodeCell({ r, c })
      const cell = ws[addr] as
        | { v?: unknown; s?: Record<string, unknown> }
        | undefined
      if (!cell) continue
      const isTitle = r === 0 && Boolean(options?.title?.trim())
      const isSubtitle =
        r === (options?.title?.trim() ? 1 : 0) &&
        Boolean(options?.subtitle?.trim())
      const isHeader = headerRowIndexes.includes(r)
      const isReportInfo = r === reportInfoRow
      const isSectionTitle = sectionTitleRows.includes(r)
      const isDetailSection = r === detailSectionRow
      const isMetadataLabel =
        reportInfoRow >= 0 &&
        r > reportInfoRow &&
        (detailSectionRow < 0 || r < detailSectionRow) &&
        c === 0 &&
        !isSectionTitle
      const shouldWrap =
        isHeader ||
        Boolean(options?.columnWraps?.[c]) ||
        String(cell.v ?? "").length > 48
      cell.s = {
        ...(cell.s ?? {}),
        font: isTitle
          ? { bold: true, sz: 16, color: { rgb: "1F2937" } }
          : isHeader || isReportInfo || isSectionTitle || isMetadataLabel
            ? { bold: true, color: { rgb: "1F2937" } }
            : cell.s?.font,
        fill:
          isHeader || (isSectionTitle && !isReportInfo)
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
      if (isTitle || isSubtitle || isHeader || isReportInfo || isSectionTitle) {
        cell.s = {
          ...cell.s,
          alignment: {
            ...(cell.s.alignment as Record<string, unknown> | undefined),
            vertical: "center",
            wrapText: true,
            ...(isTitle || isSubtitle || isSectionTitle
              ? { horizontal: "center" }
              : {}),
          },
        }
      }
    }
  }

  const aoa = layout.aoa
  ws["!rows"] = aoa.map((row, index) => {
    if (index === 0 && options?.title?.trim()) return { hpt: 24 }
    if (sectionTitleRows.includes(index)) return { hpt: 24 }
    if (headerRowIndexes.includes(index)) return { hpt: 28 }
    const hasLongContent = row.some((cell) => String(cell ?? "").length > 80)
    return hasLongContent ? { hpt: 44 } : {}
  })

  const firstHeader = headerRowIndexes[0] ?? 0
  ws["!freeze"] = { xSplit: 0, ySplit: firstHeader + 1 }
}

function decodeRange(ref: string) {
  const match = ref.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/)
  if (!match) return { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
  const col = (s: string) => {
    let n = 0
    for (let i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64)
    return n - 1
  }
  const startCol = match[1] ?? "A"
  const endCol = match[3] ?? "A"
  return {
    s: { r: Number(match[2]) - 1, c: col(startCol) },
    e: { r: Number(match[4]) - 1, c: col(endCol) },
  }
}

function encodeCell({ r, c }: { r: number; c: number }) {
  let col = ""
  let n = c + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    col = String.fromCharCode(65 + rem) + col
    n = Math.floor((n - 1) / 26)
  }
  return `${col}${r + 1}`
}

async function buildStyledSheet(
  headers: string[],
  rows: string[][],
  options?: XlsxExportOptions,
) {
  const XLSX = await import("xlsx-js-style")
  const layout = buildSheetLayout(headers, rows, options)
  const ws = XLSX.utils.aoa_to_sheet(layout.aoa)

  const cols: ColInfo[] = []
  for (let c = 0; c < layout.colCount; c++) {
    let max = 14
    for (const row of layout.aoa) {
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
  applySheetStyles(ws as Record<string, unknown>, layout, options)
  return ws
}

/** Ngày tháng năm dạng dd-mm-yyyy cho tên file export. */
export function formatExportFileNameDate(date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

const EXPORT_DATE_SUFFIX_PATTERN = /\d{2}-\d{2}-\d{4}$/

/** Gắn hậu tố ngày tháng năm vào tên file .xlsx (tránh lặp nếu đã có). */
export function appendExportDateToXlsxFileName(
  fileName: string,
  date = new Date(),
): string {
  const trimmed = fileName.trim()
  const withExt = trimmed.toLowerCase().endsWith(".xlsx")
    ? trimmed
    : `${trimmed.replace(/\.[^.]+$/, "")}.xlsx`
  const stem = withExt.slice(0, -5)
  if (EXPORT_DATE_SUFFIX_PATTERN.test(stem)) return withExt
  return `${stem}-${formatExportFileNameDate(date)}.xlsx`
}

/**
 * Xuất .xlsx một sheet — title/metadata/section merge + bảng chính + `relatedSections`.
 */
export async function downloadXlsxFile(
  filename: string,
  headers: string[],
  rows: string[][],
  sheetName = "Dữ liệu",
  options?: XlsxExportOptions,
): Promise<void> {
  const XLSX = await import("xlsx-js-style")
  const ws = await buildStyledSheet(headers, rows, options)
  const wb = XLSX.utils.book_new()
  const safeName =
    sheetName
      .replace(/[:\\/?*[\]]/g, " ")
      .trim()
      .slice(0, 31) || "Sheet1"
  XLSX.utils.book_append_sheet(wb, ws, safeName)
  const normalized = filename.toLowerCase().endsWith(".xlsx")
    ? filename
    : `${filename.replace(/\.csv$/i, "")}.xlsx`
  const out = appendExportDateToXlsxFileName(normalized)
  XLSX.writeFile(wb, out)
}

/** Workbook nhiều sheet — mỗi bảng quan hệ một tab (vd. sự kiện / đăng ký). */
export async function downloadXlsxWorkbook(
  filename: string,
  sheets: XlsxSheetPayload[],
): Promise<void> {
  if (!sheets.length) return
  const XLSX = await import("xlsx-js-style")
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const ws = await buildStyledSheet(
      sheet.headers,
      sheet.rows,
      sheet.options,
    )
    const safeName =
      sheet.sheetName
        .replace(/[:\\/?*[\]]/g, " ")
        .trim()
        .slice(0, 31) || "Sheet1"
    XLSX.utils.book_append_sheet(wb, ws, safeName)
  }
  const normalized = filename.toLowerCase().endsWith(".xlsx")
    ? filename
    : `${filename.replace(/\.csv$/i, "")}.xlsx`
  XLSX.writeFile(wb, appendExportDateToXlsxFileName(normalized))
}

/** Đổi tên file .csv → .xlsx (giữ stem). */
export function csvBaseToXlsxFilename(csvFileName: string): string {
  const base = csvFileName.replace(/\.csv$/i, "")
  return `${base}.xlsx`
}
