/** Thời gian từng bảng / lô HTTP — phục vụ báo cáo và tối ưu import. */

export type ImportModelTimingStats = {
  /** Thời gian wall-clock từ lô đầu → lô cuối của bảng. */
  wallMs: number
  /** Tổng thời gian chờ HTTP (cộng dồn các lô). */
  httpMs: number
  /** Tổng thời gian xử lý server (từ API `timing.models`, nếu có). */
  serverInsertMs: number
  serverClearMs: number
  httpJobCount: number
  records: number
  startedAtMs?: number
  completedAtMs?: number
}

export type ImportJobTimingEntry = {
  label: string
  primaryModel: string
  bundledModels: string[]
  recordCount: number
  httpMs: number
  serverRequestMs?: number
}

export function createEmptyModelTiming(
  records: number
): ImportModelTimingStats {
  return {
    wallMs: 0,
    httpMs: 0,
    serverInsertMs: 0,
    serverClearMs: 0,
    httpJobCount: 0,
    records,
  }
}

export function formatImportDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—"
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}

export function formatImportThroughput(
  records: number,
  durationMs: number
): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0 || records <= 0) {
    return "—"
  }
  const perSec = records / (durationMs / 1000)
  if (perSec >= 100)
    return `${Math.round(perSec).toLocaleString("vi-VN")} bản ghi/s`
  if (perSec >= 10) return `${perSec.toFixed(1)} bản ghi/s`
  return `${perSec.toFixed(2)} bản ghi/s`
}

export function formatModelTimingSummary(
  stats: ImportModelTimingStats
): string {
  const serverWorkMs = stats.serverInsertMs + stats.serverClearMs
  const bundleWaitMs =
    stats.wallMs > serverWorkMs + 100 ? stats.wallMs - serverWorkMs : 0
  /** Bảng pivot trong bundle: throughput theo insert thực, không theo wall chờ bảng cha. */
  const throughputMs =
    bundleWaitMs >= 500 && stats.serverInsertMs > 0
      ? Math.max(stats.serverInsertMs, 1)
      : stats.wallMs

  const parts: string[] = [formatImportDuration(stats.wallMs)]
  const throughput = formatImportThroughput(stats.records, throughputMs)
  if (throughput !== "—") parts.push(throughput)
  if (stats.httpJobCount > 1) {
    parts.push(`${stats.httpJobCount} lô HTTP`)
  }
  if (stats.serverInsertMs > 0) {
    parts.push(`insert server ${formatImportDuration(stats.serverInsertMs)}`)
  }
  if (stats.serverClearMs > 0) {
    parts.push(`clear ${formatImportDuration(stats.serverClearMs)}`)
  }
  if (bundleWaitMs >= 500) {
    parts.push(`chờ bundle ${formatImportDuration(bundleWaitMs)}`)
  }
  if (stats.httpMs > 0 && stats.httpJobCount > 1) {
    const parallelOverlap =
      stats.httpMs > stats.wallMs + 100 && stats.httpJobCount > 1
    if (parallelOverlap) {
      parts.push(
        `HTTP cộng dồn ${formatImportDuration(stats.httpMs)} (song song)`
      )
    } else if (Math.abs(stats.httpMs - stats.wallMs) > 50) {
      parts.push(`HTTP thuần ${formatImportDuration(stats.httpMs)}`)
    }
  }
  return parts.join(" · ")
}
