import type {
  ImportCurrentJobTiming,
  ImportJobTimingEntry,
  ImportModelTimingStats,
} from "./import-timing"

export type ImportModelStatus =
  | "pending"
  | "importing"
  | "done"
  | "error"
  | "skipped"

export type ImportModelProgress = {
  /** Khóa model gửi API (camelCase) hoặc khóa bảng JSON export. */
  name: string
  /** Tên bảng DB — hiển thị thống nhất giữa JSON/XLSX trong báo cáo copy. */
  tableName?: string
  records: number
  status: ImportModelStatus
  /** Ví dụ: "lô 2/5" khi import file lớn theo từng phần. */
  detail?: string
  /** Tóm tắt ngắn (1 dòng). */
  error?: string
  /** Chi tiết từng dòng lỗi — hiển thị danh sách. */
  rowErrorDetails?: string[]
  /** Tooltip: lỗi gốc từ API (SQL đầy đủ). */
  errorTitle?: string
  /** Thời gian import bảng (wall + HTTP + server). */
  timing?: ImportModelTimingStats
}

export type ImportSourceFormat = "json" | "xlsx"

export type ImportProgressState = {
  active: boolean
  models: ImportModelProgress[]
  currentIndex: number
  total: number
  totalRecords: number
  cumulativeImported: number
  status: "idle" | "importing" | "done" | "error"
  message?: string
  /** JSON export hoặc Excel (.xlsx) — dùng trong báo cáo copy. */
  sourceFormat?: ImportSourceFormat
  /** Tên file người dùng chọn khi import. */
  sourceFileName?: string
  /** Tổng thời gian import (ms). */
  totalDurationMs?: number
  /** Wall-clock bắt đầu import — tính elapsed chính xác khi copy giữa chừng. */
  importStartedAtMs?: number
  /** Lô HTTP đang chạy (chưa hoàn tất). */
  currentJob?: ImportCurrentJobTiming
  /** Chi tiết từng lô HTTP (báo cáo copy). */
  jobTimings?: ImportJobTimingEntry[]
}

export function withSkippedRemaining(
  models: ImportModelProgress[]
): ImportModelProgress[] {
  return models.map((model) =>
    model.status === "pending" || model.status === "importing"
      ? { ...model, status: "skipped" as const }
      : model
  )
}
