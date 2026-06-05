import type { ColumnDef } from "@tanstack/react-table"
import {
  buildAdminTableXlsxExport,
  type AdminTableExportTemplateId,
  type AdminTableXlsxBuiltConfig,
  type AdminTableXlsxExportOptions,
} from "../components/admin/presets/table-xlsx-export"
import {
  buildCsvFromColumns,
  type BuildCsvFromColumnsOptions,
} from "./build-table-csv"
import { buildExportFromFields, type ExportFieldDef } from "./build-field-export"
import {
  downloadXlsxFile,
  downloadXlsxWorkbook,
  type XlsxExportOptions,
  type XlsxRelatedSection,
  type XlsxSheetPayload,
} from "./export-xlsx"

export type { XlsxRelatedSection, XlsxSheetPayload }

export type AdminTableExportData<T> = {
  headers: string[]
  rows: string[][]
  columnWidths?: Array<number | undefined>
  columnWraps?: Array<boolean | undefined>
}

export type DownloadAdminTableXlsxParams<T> = {
  templateId: AdminTableExportTemplateId
  data: T[]
  /** Cột DataTable — mặc định dùng `buildCsvFromColumns`. */
  columns?: ColumnDef<T, unknown>[]
  /** Định nghĩa field phẳng — ưu tiên hơn `columns` khi có quan hệ / parse đặc biệt. */
  fields?: ExportFieldDef<T>[]
  options?: AdminTableXlsxExportOptions
  csvOptions?: BuildCsvFromColumnsOptions<T>
  /** Các bảng con / liên kết — sheet riêng trong cùng file. */
  relatedSheets?: Array<
    XlsxSheetPayload & {
      templateId?: AdminTableExportTemplateId
      options?: AdminTableXlsxExportOptions
    }
  >
  /** Các bảng con — chèn tiếp trên cùng sheet sau dữ liệu chính. */
  relatedSections?: XlsxRelatedSection[]
}

function resolveExportData<T>(params: DownloadAdminTableXlsxParams<T>): AdminTableExportData<T> {
  if (params.fields?.length) {
    return buildExportFromFields(params.data, params.fields)
  }
  if (!params.columns?.length) {
    return { headers: [], rows: [] }
  }
  return buildCsvFromColumns(params.data, params.columns, params.csvOptions)
}

/**
 * Xuất Excel chuẩn admin: template (title, metadata, merge section) + dữ liệu bảng.
 * Dùng chung cho mọi danh sách `apps/backend` gắn `AdminDataTable`.
 */
export async function downloadAdminTableXlsx<T>(
  params: DownloadAdminTableXlsxParams<T>,
): Promise<void> {
  const mainConfig = buildAdminTableXlsxExport(
    params.templateId,
    params.options ?? {},
  )
  const { headers, rows, columnWidths, columnWraps } = resolveExportData(params)

  const mainOptions: XlsxExportOptions = {
    title: mainConfig.title,
    subtitle: mainConfig.subtitle,
    metadata: mainConfig.metadata,
    columnWidths,
    columnWraps,
    relatedSections: params.relatedSections,
  }

  if (params.relatedSheets?.length) {
    const sheets: XlsxSheetPayload[] = [
      {
        sheetName: mainConfig.sheetName,
        headers,
        rows,
        options: mainOptions,
      },
      ...params.relatedSheets.map((sheet) => {
        const cfg = sheet.templateId
          ? buildAdminTableXlsxExport(sheet.templateId, sheet.options ?? {})
          : null
        return {
          sheetName: sheet.sheetName,
          headers: sheet.headers,
          rows: sheet.rows,
          options: {
            title: sheet.options?.title ?? cfg?.title,
            subtitle: sheet.options?.subtitle ?? cfg?.subtitle,
            metadata: sheet.options?.metadata ?? cfg?.metadata,
            columnWidths: sheet.options?.columnWidths,
            columnWraps: sheet.options?.columnWraps,
            relatedSections: sheet.options?.relatedSections,
          },
        }
      }),
    ]
    await downloadXlsxWorkbook(mainConfig.fileName, sheets)
    return
  }

  await downloadXlsxFile(
    mainConfig.fileName,
    headers,
    rows,
    mainConfig.sheetName,
    mainOptions,
  )
}

