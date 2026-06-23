export type CopyTimingInput = {
  startedAt: number
  copiedAt: number
}

const TIMING_MARKER = "── Thời gian xử lý ──"
const LEGACY_THOI_GIAN = /^Thời gian: .+$/m
const TIMING_BLOCK_RE =
  /\n── Thời gian xử lý ──\nBắt đầu: .+\nSao chép: .+\nThời lượng: .+/m

export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0ms"
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) {
    const sec = ms / 1000
    return sec >= 10
      ? `${Math.round(sec)}s (${ms}ms)`
      : `${sec.toFixed(2)}s (${ms}ms)`
  }
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}p ${sec}s (${ms}ms)`
}

export function formatCopyTimingSection(timing: CopyTimingInput): string[] {
  const durationMs = Math.max(0, timing.copiedAt - timing.startedAt)
  return [
    "",
    TIMING_MARKER,
    `Bắt đầu: ${new Date(timing.startedAt).toISOString()}`,
    `Sao chép: ${new Date(timing.copiedAt).toISOString()}`,
    `Thời lượng: ${formatDurationMs(durationMs)}`,
  ]
}

export function appendOrReplaceCopyTimingSection(
  report: string,
  timing: CopyTimingInput,
): string {
  const section = formatCopyTimingSection(timing).join("\n")
  const normalized = report
    .replace(TIMING_BLOCK_RE, "")
    .replace(LEGACY_THOI_GIAN, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()

  const ghiChuIdx = normalized.lastIndexOf("\nGhi chú:")
  if (ghiChuIdx >= 0) {
    const before = normalized.slice(0, ghiChuIdx).trimEnd()
    const after = normalized.slice(ghiChuIdx)
    return `${before}\n${section}\n${after.trimStart()}`
  }

  const brandingAnchor = "Nguồn mô tả:"
  const brandingIdx = normalized.indexOf(brandingAnchor)
  if (brandingIdx >= 0) {
    const lineEnd = normalized.indexOf("\n", brandingIdx)
    if (lineEnd >= 0) {
      const before = normalized.slice(0, lineEnd).trimEnd()
      const after = normalized.slice(lineEnd + 1).trimStart()
      return after ? `${before}\n${section}\n${after}` : `${before}\n${section}`
    }
  }

  return `${normalized}\n${section}`
}

export function resolveCopyStartedAt(
  explicit?: number,
  fallback = Date.now(),
): number {
  if (typeof explicit === "number" && Number.isFinite(explicit)) {
    return explicit
  }
  return fallback
}
