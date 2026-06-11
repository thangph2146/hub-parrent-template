import type {
  ImportModelProgress,
  ImportProgressState,
} from "../import-progress-panel"
import {
  buildImportJobFailureMessage,
  buildModelImportErrorSummary,
  formatImportErrorMessage,
  type ImportRowError,
} from "./import-error-message"
import {
  createEmptyModelTiming,
  formatImportDuration,
  type ImportJobTimingEntry,
  type ImportModelTimingStats,
} from "./import-timing"

type ApiModelTiming = {
  model: string
  clearMs: number
  insertMs: number
  imported: number
}

type ApiImportTiming = {
  requestMs: number
  models: ApiModelTiming[]
}

function applyRowErrorsToModel(
  model: ImportModelProgress,
  modelName: string,
  rowErrors: ImportRowError[]
): ImportModelProgress {
  const { summary, details, fullTitle } = buildModelImportErrorSummary(
    modelName,
    rowErrors
  )
  if (!summary) return model
  return {
    ...model,
    status: "error" as const,
    error: summary,
    rowErrorDetails: details,
    errorTitle: fullTitle,
  }
}

export type ImportConfig = {
  modelOrder: string[]
  bundles: Record<string, readonly string[]>
  rowChunkSize: number
  /** Kích thước lô riêng (vd. post JSON nhỏ để chạy song song). */
  modelChunkSizes?: Record<string, number>
  /** Số lô skipClear cùng bảng chạy song song (mặc định 3). */
  parallelChunkConcurrency?: number
  /** Ghi đè song song theo bảng (vd. post=1 tránh lock DB). */
  modelParallelConcurrency?: Record<string, number>
}

export type ImportChunkJob = {
  label: string
  primaryModel: string
  skipClear: boolean
  payload: Record<string, unknown[]>
  recordCount: number
  bundledModels: string[]
  isLastChunkForModel: boolean
}

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  error?: string | null
  data?: T
}

type ImportResultPayload = {
  success?: boolean
  message?: string
  rowErrors?: Array<{ model: string; index: number; message: string }>
  timing?: ApiImportTiming
}

function nowMs(): number {
  return typeof performance !== "undefined" &&
    typeof performance.now === "function"
    ? performance.now()
    : Date.now()
}

function attachTimingsToModels(
  models: ImportModelProgress[],
  timingByName: Map<string, ImportModelTimingStats>
): ImportModelProgress[] {
  return models.map((model) => {
    const timing = timingByName.get(model.name)
    return timing ? { ...model, timing: { ...timing } } : model
  })
}

function touchModelTiming(
  timingByName: Map<string, ImportModelTimingStats>,
  modelName: string,
  records: number
): ImportModelTimingStats {
  let timing = timingByName.get(modelName)
  if (!timing) {
    timing = createEmptyModelTiming(records)
    timingByName.set(modelName, timing)
  }
  return timing
}

function markModelImportStart(
  timingByName: Map<string, ImportModelTimingStats>,
  modelName: string,
  records: number,
  atMs: number
): void {
  const timing = touchModelTiming(timingByName, modelName, records)
  if (timing.startedAtMs == null) {
    timing.startedAtMs = atMs
  }
}

function markModelImportEnd(
  timingByName: Map<string, ImportModelTimingStats>,
  modelName: string,
  records: number,
  atMs: number
): void {
  const timing = touchModelTiming(timingByName, modelName, records)
  timing.completedAtMs = atMs
  if (timing.startedAtMs != null) {
    timing.wallMs = Math.max(0, timing.completedAtMs - timing.startedAtMs)
  }
}

function applyServerTimings(
  timingByName: Map<string, ImportModelTimingStats>,
  models: ImportModelProgress[],
  serverTimings?: ApiModelTiming[]
): void {
  if (!serverTimings?.length) return
  for (const entry of serverTimings) {
    const model = models.find((m) => m.name === entry.model)
    const timing = touchModelTiming(
      timingByName,
      entry.model,
      model?.records ?? entry.imported
    )
    timing.serverClearMs += entry.clearMs
    timing.serverInsertMs += entry.insertMs
  }
}

function addHttpJobDuration(
  timingByName: Map<string, ImportModelTimingStats>,
  models: ImportModelProgress[],
  modelNames: string[],
  httpMs: number
): void {
  for (const name of modelNames) {
    const model = models.find((m) => m.name === name)
    const timing = touchModelTiming(timingByName, name, model?.records ?? 0)
    timing.httpMs += httpMs
    timing.httpJobCount += 1
  }
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items]
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

/** Khớp `orderModelsForDependencySafeImport` trên API. */
export function orderModelsForImport(
  keys: string[],
  modelOrder: string[]
): string[] {
  const set = new Set(keys)
  const out: string[] = []
  const take = (model: string) => {
    if (set.has(model)) {
      out.push(model)
      set.delete(model)
    }
  }

  take("role")
  take("user")
  take("userRole")
  for (const model of [...modelOrder].reverse()) {
    take(model)
  }
  for (const model of set) {
    out.push(model)
  }
  return out
}

export function buildChunkedImportJobs(
  data: Record<string, unknown[]>,
  config: ImportConfig
): ImportChunkJob[] {
  const keys = Object.keys(data).filter(
    (key) => Array.isArray(data[key]) && data[key].length > 0
  )
  if (keys.length === 0) return []

  const ordered = orderModelsForImport(keys, config.modelOrder)
  const skipBundled = new Set<string>()
  const jobs: ImportChunkJob[] = []

  const pushModelJobs = (primary: string) => {
    if (skipBundled.has(primary)) return
    const rows = data[primary]
    if (!Array.isArray(rows) || rows.length === 0) return

    const bundleExtras = (config.bundles[primary] ?? []).filter((extra) => {
      if (skipBundled.has(extra)) return false
      const extraRows = data[extra]
      return Array.isArray(extraRows) && extraRows.length > 0
    })
    bundleExtras.forEach((extra) => skipBundled.add(extra))

    const chunkSize = config.modelChunkSizes?.[primary] ?? config.rowChunkSize
    const chunks = chunkArray(rows, chunkSize)
    /** post JSON nặng: pivot tách request riêng để transaction nhỏ hơn + metric rõ hơn. */
    const deferPivotBundle =
      bundleExtras.length > 0 && (chunks.length > 1 || primary === "post")

    chunks.forEach((chunk, chunkIndex) => {
      const payload: Record<string, unknown[]> = { [primary]: chunk }
      const bundledModels: string[] = []

      if (!deferPivotBundle && chunkIndex === 0) {
        for (const extra of bundleExtras) {
          payload[extra] = data[extra] as unknown[]
          bundledModels.push(extra)
        }
      }

      const recordCount = Object.values(payload).reduce(
        (sum, value) => sum + value.length,
        0
      )

      jobs.push({
        label:
          chunks.length > 1
            ? `${primary} (lô ${chunkIndex + 1}/${chunks.length})`
            : primary,
        primaryModel: primary,
        // Lô đầu: xóa bảng (skipClear=false). Các lô sau: append (skipClear=true).
        skipClear: chunkIndex !== 0,
        payload,
        recordCount,
        bundledModels,
        isLastChunkForModel: false,
      })
    })

    if (deferPivotBundle) {
      const pivotPrimary = bundleExtras[0]!
      const pivotPayload: Record<string, unknown[]> = {}
      const pivotBundled: string[] = []
      for (const extra of bundleExtras) {
        pivotPayload[extra] = data[extra] as unknown[]
        if (extra !== pivotPrimary) pivotBundled.push(extra)
      }
      const pivotCount = Object.values(pivotPayload).reduce(
        (sum, value) => sum + value.length,
        0
      )
      jobs.push({
        label:
          pivotBundled.length > 0
            ? `${pivotPrimary} + ${pivotBundled.join(", ")}`
            : pivotPrimary,
        primaryModel: pivotPrimary,
        skipClear: false,
        payload: pivotPayload,
        recordCount: pivotCount,
        bundledModels: pivotBundled,
        isLastChunkForModel: false,
      })
    }
  }

  for (const primary of ordered) {
    pushModelJobs(primary)
  }
  for (const key of keys) {
    if (!ordered.includes(key)) {
      pushModelJobs(key)
    }
  }

  const lastJobIndexByModel = new Map<string, number>()
  jobs.forEach((job, index) => {
    lastJobIndexByModel.set(job.primaryModel, index)
  })
  jobs.forEach((job, index) => {
    job.isLastChunkForModel =
      lastJobIndexByModel.get(job.primaryModel) === index
  })

  return jobs
}

export function buildInitialImportProgress(
  data: Record<string, unknown[]>,
  config: ImportConfig,
  jobs: ImportChunkJob[]
): Pick<ImportProgressState, "models" | "total" | "totalRecords"> {
  const keys = Object.keys(data).filter(
    (key) => Array.isArray(data[key]) && data[key].length > 0
  )
  const ordered = orderModelsForImport(keys, config.modelOrder)
  const skipBundled = new Set<string>()
  const models: ImportModelProgress[] = []
  let totalRecords = 0

  const addModel = (name: string) => {
    const rows = data[name]
    if (!Array.isArray(rows) || rows.length === 0) return
    models.push({ name, records: rows.length, status: "pending" })
    totalRecords += rows.length
  }

  for (const primary of ordered) {
    if (skipBundled.has(primary)) continue
    addModel(primary)
    for (const extra of config.bundles[primary] ?? []) {
      if (skipBundled.has(extra)) continue
      const extraRows = data[extra]
      if (!Array.isArray(extraRows) || extraRows.length === 0) continue
      skipBundled.add(extra)
      addModel(extra)
    }
  }
  for (const key of keys) {
    if (!models.some((model) => model.name === key)) {
      addModel(key)
    }
  }

  return {
    models,
    total: jobs.length,
    totalRecords,
  }
}

export async function fetchImportConfig(
  apiBase: string,
  authHeaders: () => HeadersInit
): Promise<ImportConfig> {
  const res = await fetch(`${apiBase}/admin/system/import-config`, {
    headers: authHeaders(),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      text.length > 200
        ? `${text.slice(0, 200)}…`
        : text || `HTTP ${res.status}`
    )
  }
  const json = (await res.json()) as ApiEnvelope<ImportConfig>
  if (!json.success || !json.data) {
    throw new Error(json.message || "API không trả cấu hình import hợp lệ.")
  }
  return json.data
}

export type RunChunkedImportOptions = {
  apiBase: string
  authHeaders: () => HeadersInit
  config: ImportConfig
  data: Record<string, unknown[]>
  onProgress: (state: ImportProgressState) => void
  toastFetchError: (res: Response) => Promise<string>
}

async function runImportJobsInPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  if (items.length === 0) return
  const limit = Math.max(1, Math.min(concurrency, items.length))
  let cursor = 0
  async function runWorker(): Promise<void> {
    while (true) {
      const index = cursor
      cursor += 1
      if (index >= items.length) return
      await worker(items[index]!, index)
    }
  }
  await Promise.all(Array.from({ length: limit }, () => runWorker()))
}

export async function runChunkedImport({
  apiBase,
  authHeaders,
  config,
  data,
  onProgress,
  toastFetchError,
}: RunChunkedImportOptions): Promise<{ success: boolean; message: string }> {
  const jobs = buildChunkedImportJobs(data, config)
  if (jobs.length === 0) {
    return { success: false, message: "Không có dữ liệu để import." }
  }

  const initial = buildInitialImportProgress(data, config, jobs)
  let cumulativeImported = 0
  let modelStates: ImportModelProgress[] = initial.models.map((model) => ({
    ...model,
  }))
  const timingByName = new Map<string, ImportModelTimingStats>()
  const jobTimings: ImportJobTimingEntry[] = []
  const importWallStarted = nowMs()

  const emitProgress = (
    patch: Partial<ImportProgressState> & { models?: ImportModelProgress[] }
  ) => {
    if (patch.models) {
      modelStates = attachTimingsToModels(patch.models, timingByName)
    } else {
      modelStates = attachTimingsToModels(modelStates, timingByName)
    }
    onProgress({
      active: true,
      models: modelStates,
      currentIndex: patch.currentIndex ?? 0,
      total: initial.total,
      totalRecords: initial.totalRecords,
      cumulativeImported: patch.cumulativeImported ?? cumulativeImported,
      status: patch.status ?? "importing",
      message: patch.message,
      totalDurationMs: patch.totalDurationMs,
      jobTimings: patch.jobTimings ?? jobTimings,
    })
  }

  const parallelConcurrency = Math.max(1, config.parallelChunkConcurrency ?? 3)

  emitProgress({
    currentIndex: 0,
    cumulativeImported: 0,
    status: "importing",
    message: `Import theo ${jobs.length} lô${parallelConcurrency > 1 ? ` (song song tối đa ${parallelConcurrency})` : ""}…`,
  })

  const executeImportJob = async (
    job: ImportChunkJob,
    jobIndex: number
  ): Promise<{ success: boolean; message?: string }> => {
    const chunkDetail = job.label.includes("lô")
      ? job.label.replace(`${job.primaryModel} `, "")
      : undefined
    const jobStarted = nowMs()
    const primaryRecords =
      modelStates.find((m) => m.name === job.primaryModel)?.records ?? 0

    markModelImportStart(
      timingByName,
      job.primaryModel,
      primaryRecords,
      jobStarted
    )
    for (const bundled of job.bundledModels) {
      const bundledRecords =
        modelStates.find((m) => m.name === bundled)?.records ?? 0
      markModelImportStart(timingByName, bundled, bundledRecords, jobStarted)
    }

    emitProgress({
      models: modelStates.map((model) => {
        if (model.name === job.primaryModel) {
          return {
            ...model,
            status: "importing" as const,
            detail: chunkDetail,
          }
        }
        if (
          job.bundledModels.includes(model.name) &&
          model.status === "pending"
        ) {
          return { ...model, status: "importing" as const }
        }
        return model
      }),
      currentIndex: jobIndex,
      cumulativeImported,
      status: "importing",
      message: `Đang gửi ${job.label}…`,
    })

    const query = new URLSearchParams({
      model: job.primaryModel,
      skipClear: String(job.skipClear),
      stream: "false",
    })
    const res = await fetch(`${apiBase}/admin/system/import?${query}`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job.payload),
    })

    if (!res.ok) {
      const errMsg = formatImportErrorMessage(await toastFetchError(res))
      emitProgress({
        models: modelStates.map((model) =>
          model.name === job.primaryModel ||
          (job.bundledModels.includes(model.name) &&
            (model.status === "pending" || model.status === "importing"))
            ? {
                ...model,
                status: "error" as const,
                error: errMsg,
              }
            : model.status === "importing"
              ? { ...model, status: "skipped" as const }
              : model
        ),
        currentIndex: jobIndex,
        cumulativeImported,
        status: "error",
        message: errMsg,
      })
      return { success: false, message: errMsg }
    }

    const envelope = (await res.json()) as ApiEnvelope<ImportResultPayload>
    const result = envelope.data ?? (envelope as ImportResultPayload)
    const httpMs = nowMs() - jobStarted
    const jobModelNames = [job.primaryModel, ...job.bundledModels]
    addHttpJobDuration(timingByName, modelStates, jobModelNames, httpMs)
    applyServerTimings(timingByName, modelStates, result.timing?.models)
    jobTimings.push({
      label: job.label,
      primaryModel: job.primaryModel,
      bundledModels: job.bundledModels,
      recordCount: job.recordCount,
      httpMs,
      serverRequestMs: result.timing?.requestMs,
    })

    const rowErrors = result.rowErrors ?? []
    const importOk =
      envelope.success !== false &&
      result.success !== false &&
      rowErrors.length === 0
    const errMsg = buildImportJobFailureMessage({
      jobLabel: job.label,
      primaryModel: job.primaryModel,
      rowErrors,
      fallbackMessage: result.message?.trim(),
    })

    if (!importOk) {
      emitProgress({
        models: modelStates.map((model) => {
          const modelRowErrors = rowErrors.filter(
            (row) => row.model === model.name
          )
          if (modelRowErrors.length > 0) {
            return applyRowErrorsToModel(model, model.name, rowErrors)
          }
          if (model.name === job.primaryModel) {
            return {
              ...model,
              status: "error" as const,
              error: errMsg,
            }
          }
          if (
            job.bundledModels.includes(model.name) &&
            (model.status === "pending" || model.status === "importing")
          ) {
            return {
              ...model,
              status: "error" as const,
              error: errMsg,
            }
          }
          if (model.status === "pending" || model.status === "importing") {
            return { ...model, status: "skipped" as const }
          }
          return model
        }),
        currentIndex: jobIndex,
        cumulativeImported,
        status: "error",
        message: errMsg,
      })
      return {
        success: false,
        message: errMsg,
      }
    }

    cumulativeImported += job.recordCount
    const jobEnded = nowMs()

    if (job.isLastChunkForModel) {
      markModelImportEnd(
        timingByName,
        job.primaryModel,
        primaryRecords,
        jobEnded
      )
    }
    for (const bundled of job.bundledModels) {
      const bundledRecords =
        modelStates.find((m) => m.name === bundled)?.records ?? 0
      markModelImportEnd(timingByName, bundled, bundledRecords, jobEnded)
    }

    emitProgress({
      models: modelStates.map((model) => {
        if (model.name === job.primaryModel) {
          if (job.isLastChunkForModel) {
            return { ...model, status: "done" as const, detail: undefined }
          }
          return {
            ...model,
            status: "importing" as const,
            detail: chunkDetail,
          }
        }
        if (job.bundledModels.includes(model.name)) {
          return { ...model, status: "done" as const }
        }
        return model
      }),
      currentIndex: jobIndex,
      cumulativeImported,
      status: "importing",
    })

    return { success: true }
  }

  let jobCursor = 0
  let importFailed: { success: false; message: string } | null = null

  while (jobCursor < jobs.length && !importFailed) {
    const job = jobs[jobCursor]!

    if (!job.skipClear) {
      const result = await executeImportJob(job, jobCursor)
      if (!result.success) {
        importFailed = {
          success: false,
          message: result.message ?? "Import thất bại",
        }
        break
      }
      jobCursor += 1
      continue
    }

    const parallelBatch: Array<{ job: ImportChunkJob; index: number }> = []
    const primary = job.primaryModel
    while (
      jobCursor < jobs.length &&
      jobs[jobCursor]!.skipClear &&
      jobs[jobCursor]!.primaryModel === primary
    ) {
      parallelBatch.push({ job: jobs[jobCursor]!, index: jobCursor })
      jobCursor += 1
    }

    const batchConcurrency = Math.max(
      1,
      config.modelParallelConcurrency?.[primary] ?? parallelConcurrency
    )

    await runImportJobsInPool(
      parallelBatch,
      batchConcurrency,
      async ({ job: parallelJob, index }) => {
        if (importFailed) return
        const result = await executeImportJob(parallelJob, index)
        if (!result.success) {
          importFailed = {
            success: false,
            message: result.message ?? "Import thất bại",
          }
        }
      }
    )
  }

  if (importFailed) {
    return importFailed
  }

  const totalDurationMs = Math.round(nowMs() - importWallStarted)
  const slowest = [...timingByName.entries()]
    .filter(([, t]) => t.wallMs > 0)
    .sort((a, b) => b[1].wallMs - a[1].wallMs)[0]
  const doneMessage = slowest
    ? `Import hoàn tất — ${cumulativeImported.toLocaleString("vi-VN")} bản ghi qua ${jobs.length} lô · chậm nhất: ${slowest[0]} (${formatImportDuration(slowest[1].wallMs)}).`
    : `Import hoàn tất — ${cumulativeImported.toLocaleString("vi-VN")} bản ghi qua ${jobs.length} lô.`
  emitProgress({
    models: modelStates.map((model) =>
      model.status === "pending" || model.status === "importing"
        ? { ...model, status: "done" as const }
        : model
    ),
    currentIndex: jobs.length - 1,
    cumulativeImported,
    status: "done",
    message: doneMessage,
    totalDurationMs,
  })

  return { success: true, message: doneMessage }
}
