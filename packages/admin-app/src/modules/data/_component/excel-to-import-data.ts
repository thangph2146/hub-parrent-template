import * as XLSX from "xlsx"

const EXCEL_META_SHEET = "__meta"

export type ExcelImportParseResult = {
  data: Record<string, unknown[]>
  /** modelName (camelCase) → tableName (snake/plural) từ sheet __meta. */
  modelTableNames: Record<string, string>
}

function parseCellValue(value: unknown): unknown {
  if (value == null || value === "") return undefined
  if (value instanceof Date) return value.toISOString()
  return value
}

/**
 * Parse file .xlsx trên trình duyệt — cùng cấu trúc JSON export/import của API.
 * Tránh upload một file lớn; dữ liệu được import theo lô qua `runChunkedImport`.
 */
export function parseExcelToImportData(
  arrayBuffer: ArrayBuffer
): ExcelImportParseResult {
  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    cellDates: true,
    dense: true,
  })

  const sheetMap = new Map<string, string>()
  const modelNamesFromMeta: string[] = []
  const modelTableNames: Record<string, string> = {}
  const metaSheet = workbook.Sheets[EXCEL_META_SHEET]
  if (metaSheet) {
    const metaRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
      metaSheet,
      { header: 1, defval: null }
    )
    for (let rowIndex = 1; rowIndex < metaRows.length; rowIndex++) {
      const row = metaRows[rowIndex]
      if (!row) continue
      const modelName = String(row[0] ?? "").trim()
      const sheetName = String(row[1] ?? "").trim()
      const tableName = String(row[2] ?? "").trim()
      if (modelName && sheetName) {
        sheetMap.set(modelName, sheetName)
        modelNamesFromMeta.push(modelName)
        modelTableNames[modelName] = tableName || modelName
        if (tableName) sheetMap.set(tableName, sheetName)
      }
    }
  }

  const data: Record<string, unknown[]> = {}
  const modelNames =
    modelNamesFromMeta.length > 0
      ? modelNamesFromMeta
      : workbook.SheetNames.filter((name) => name !== EXCEL_META_SHEET)

  for (const rawModelName of modelNames) {
    const sheetName = sheetMap.get(rawModelName) ?? rawModelName
    if (sheetName === EXCEL_META_SHEET) continue

    const worksheet = workbook.Sheets[sheetName]
    if (!worksheet) continue

    if (!modelTableNames[rawModelName]) {
      modelTableNames[rawModelName] = rawModelName
    }

    const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(
      worksheet,
      { header: 1, defval: null }
    )
    if (matrix.length === 0) {
      data[rawModelName] = []
      continue
    }

    const headerRow = matrix[0] ?? []
    const headers = headerRow
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
    if (headers.length === 0) {
      data[rawModelName] = []
      continue
    }

    const rows: Record<string, unknown>[] = []
    for (let rowIndex = 1; rowIndex < matrix.length; rowIndex++) {
      const row = matrix[rowIndex]
      if (!row) continue

      const record: Record<string, unknown> = {}
      let hasValue = false

      headers.forEach((header, columnIndex) => {
        const parsed = parseCellValue(row[columnIndex])
        if (parsed === undefined) return
        record[header] = parsed
        hasValue = true
      })

      if (hasValue) {
        rows.push(record)
      }
    }

    data[rawModelName] = rows
  }

  return { data, modelTableNames }
}
