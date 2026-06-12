/**
 * Điểm vào xuất Excel chuẩn cho admin Next (`apps/main/backend`, …).
 * Mọi bảng admin nên dùng `buildAdminTableXlsxExport` + `AdminDataTable` `xlsxExport`,
 * hoặc `downloadAdminTableXlsx` khi cần field phẳng / sheet quan hệ.
 */
export {
  downloadAdminTableXlsx,
  type AdminTableExportData,
  type DownloadAdminTableXlsxParams,
} from "@ui/lib/admin-table-export"

export {
  buildExportFromFields,
  type ExportFieldDef,
} from "@ui/lib/build-field-export"

export {
  buildCsvFromColumns,
  type BuildCsvFromColumnsOptions,
} from "@ui/lib/build-table-csv"

export {
  downloadXlsxFile,
  downloadXlsxWorkbook,
  appendExportDateToXlsxFileName,
  type XlsxExportOptions,
  type XlsxRelatedSection,
  type XlsxSheetPayload,
} from "@ui/lib/export-xlsx"

export {
  buildAdminTableXlsxExport,
  buildEventDetailXlsxExport,
  type AdminTableExportTemplateId,
  type AdminTableXlsxExportOptions,
} from "@ui/components/admin"
