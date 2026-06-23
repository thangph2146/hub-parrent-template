import type {
  ImportModelProgress,
  ImportProgressState,
} from "../import-progress-panel"
import { ApiError } from "@workspace/api-client"
import type { ImportConfigResponse } from "@workspace/api-client"
import type { AdminSdk } from "@workspace/admin-app/lib/api"
import {
  buildImportJobFailureMessage,
  buildImportProgressReportFromState,
  buildModelImportErrorSummary,
  formatImportErrorMessage,
  formatImportNetworkError,
  type ImportRowError,
} from "./import-error-message"
import {
  createEmptyModelTiming,
  formatImportDuration,
  resolveWallClockElapsedMs,
  type ImportCurrentJobTiming,
  type ImportJobTimingEntry,
  type ImportModelTimingStats,
} from "./import-timing"

type ApiModelTiming = {
  model: string
  clearMs: number
  insertMs: number
  imported: number
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

export type ImportConfig = ImportConfigResponse

function formatImportRequestError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return (
        error.message.trim() ||
        "API từ chối: thiếu hoặc sai X-User-Id — hãy đăng nhập lại admin."
      )
    }
    if (error.status === 403) {
      return (
        error.message.trim() ||
        "Không đủ quyền xuất nhập hệ thống cho tài khoản hiện tại."
      )
    }
    const msg = error.message.trim()
    if (msg) return formatImportErrorMessage(msg)
    return `Lỗi ${error.status}`
  }
  return formatImportNetworkError(error)
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

/** Wall-clock ms — luôn dùng Date.now() để so sánh với báo cáo copy / UI. */
function nowMs(): number {
  return Date.now()
}

function attachTimingsToModels(
  models: ImportModelProgress[],
  timingByName: Map<string, ImportModelTimingStats>,
  atMs: number = nowMs()
): ImportModelProgress[] {
  return models.map((model) => {
    const timing = timingByName.get(model.name)
    if (!timing) return model
    const snapshot = { ...timing }
    if (snapshot.startedAtMs != null && snapshot.completedAtMs == null) {
      const elapsed = resolveWallClockElapsedMs(snapshot.startedAtMs, atMs)
      if (elapsed != null) {
        snapshot.wallMs = elapsed
      }
    }
    return { ...model, timing: snapshot }
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

function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items]
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

/** Lô RBAC (xóa user + roles) có thể chờ lock MySQL lâu hơn các bảng thường. */
const RBAC_IMPORT_TIMEOUT_MS = 300_000

function isRbacImportJob(job: ImportChunkJob): boolean {
  if (isRbacImportKey(job.primaryModel)) return true
  return job.bundledModels.some((model) => isRbacImportKey(model))
}

/** Khóa RBAC — import cuối để tránh TRUNCATE roles/user_roles làm mất quyền giữa các lô HTTP. */
const RBAC_IMPORT_KEY_GROUPS = [
  ["role", "roles"],
  ["user", "users"],
  ["userRole", "user_roles"],
] as const

const RBAC_IMPORT_KEYS = new Set<string>(
  RBAC_IMPORT_KEY_GROUPS.flatMap((group) => [...group])
)

function isRbacImportKey(key: string): boolean {
  return RBAC_IMPORT_KEYS.has(key)
}

function resolveClientModelName(
  serverModel: string,
  models: ImportModelProgress[]
): string {
  const direct = models.find((m) => m.name === serverModel)
  if (direct) return direct.name

  const aliasGroups = RBAC_IMPORT_KEY_GROUPS
  for (const group of aliasGroups) {
    if ((group as readonly string[]).includes(serverModel)) {
      const match = models.find((m) =>
        (group as readonly string[]).includes(m.name)
      )
      if (match) return match.name
    }
  }

  return serverModel
}

function applyServerTimings(
  timingByName: Map<string, ImportModelTimingStats>,
  models: ImportModelProgress[],
  serverTimings?: ApiModelTiming[]
): void {
  if (!serverTimings?.length) return
  for (const entry of serverTimings) {
    const clientModel = resolveClientModelName(entry.model, models)
    const model = models.find((m) => m.name === clientModel)
    const timing = touchModelTiming(
      timingByName,
      clientModel,
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

/** Khớp thứ tự an toàn trên client — RBAC (role/user/userRole) luôn cuối, giống JSON export. */
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

  for (const model of [...modelOrder].reverse()) {
    if (!isRbacImportKey(model)) {
      take(model)
    }
  }
  for (const model of [...set]) {
    if (!isRbacImportKey(model)) {
      out.push(model)
      set.delete(model)
    }
  }
  for (const group of RBAC_IMPORT_KEY_GROUPS) {
    for (const alias of group) {
      take(alias)
    }
  }
  for (const model of set) {
    out.push(model)
  }
  return out
}

/** Excel dùng khóa model (role); JSON export dùng khóa bảng (roles) — chuẩn hóa về khóa bảng. */
export function normalizeImportDataToTableKeys(
  data: Record<string, unknown[]>,
  modelTableNames?: Record<string, string>
): {
  data: Record<string, unknown[]>
  modelTableNames: Record<string, string>
} {
  const normalized: Record<string, unknown[]> = {}
  const tableNames: Record<string, string> = {}

  for (const [key, rows] of Object.entries(data)) {
    if (!Array.isArray(rows)) continue
    const tableKey = modelTableNames?.[key]?.trim() || key
    normalized[tableKey] = rows
    tableNames[tableKey] = tableKey
  }

  return { data: normalized, modelTableNames: tableNames }
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

    const bundleExtras = isRbacImportKey(primary)
      ? []
      : (config.bundles[primary] ?? []).filter((extra) => {
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

/** Gộp roles + users + user_roles thành 1 request — tránh mất quyền giữa các lô HTTP. */
const RBAC_TABLE_IMPORT_ORDER = ["roles", "users", "user_roles"] as const

export function mergeRbacImportJobs(
  jobs: ImportChunkJob[],
  data: Record<string, unknown[]>
): ImportChunkJob[] {
  const rbacPresent = RBAC_TABLE_IMPORT_ORDER.filter((key) => {
    const rows = data[key]
    return Array.isArray(rows) && rows.length > 0
  })
  if (rbacPresent.length === 0) return jobs

  const rbacJobs = jobs.filter((job) => isRbacImportKey(job.primaryModel))
  if (rbacJobs.length === 0) return jobs

  const rbacChunked = rbacJobs.some(
    (job) => job.skipClear || job.label.includes("lô")
  )
  if (rbacChunked) return jobs

  const nonRbac = jobs.filter((job) => !isRbacImportKey(job.primaryModel))

  const payload: Record<string, unknown[]> = {}
  let recordCount = 0
  for (const key of rbacPresent) {
    payload[key] = data[key] as unknown[]
    recordCount += (data[key] as unknown[]).length
  }

  const primary = rbacPresent[0]!
  const bundled = rbacPresent.slice(1)

  return [
    ...nonRbac,
    {
      label: bundled.length > 0 ? rbacPresent.join(" + ") : primary,
      primaryModel: primary,
      skipClear: false,
      payload,
      recordCount,
      bundledModels: bundled,
      isLastChunkForModel: true,
    },
  ]
}

export function buildInitialImportProgress(
  data: Record<string, unknown[]>,
  config: ImportConfig,
  jobs: ImportChunkJob[],
  modelTableNames?: Record<string, string>
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
    models.push({
      name,
      tableName: modelTableNames?.[name] ?? name,
      records: rows.length,
      status: "pending",
    })
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

export type RunChunkedImportResult = {
  success: boolean
  message: string
  /** Báo cáo đầy đủ — đồng bộ với nút Copy trong panel + toast Sao chép (dev). */
  copyReport?: string
}

export type RunChunkedImportOptions = {
  api: AdminSdk
  config: ImportConfig
  data: Record<string, unknown[]>
  sourceFormat?: ImportProgressState["sourceFormat"]
  sourceFileName?: string
  modelTableNames?: Record<string, string>
  onProgress: (state: ImportProgressState) => void
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
  api,
  config,
  data,
  sourceFormat,
  sourceFileName,
  modelTableNames,
  onProgress,
}: RunChunkedImportOptions): Promise<RunChunkedImportResult> {
  const normalized = normalizeImportDataToTableKeys(data, modelTableNames)
  data = normalized.data
  modelTableNames = normalized.modelTableNames

  const jobs = mergeRbacImportJobs(
    buildChunkedImportJobs(data, config),
    data
  )
  if (jobs.length === 0) {
    return { success: false, message: "Không có dữ liệu để import." }
  }

  const initial = buildInitialImportProgress(
    data,
    config,
    jobs,
    modelTableNames
  )
  const jobsPerPrimary = new Map<string, number>()
  for (const job of jobs) {
    jobsPerPrimary.set(
      job.primaryModel,
      (jobsPerPrimary.get(job.primaryModel) ?? 0) + 1
    )
  }
  const completedJobsPerPrimary = new Map<string, number>()
  let cumulativeImported = 0
  let modelStates: ImportModelProgress[] = initial.models.map((model) => ({
    ...model,
  }))
  const timingByName = new Map<string, ImportModelTimingStats>()
  const jobTimings: ImportJobTimingEntry[] = []
  const importWallStarted = nowMs()
  let currentJob: ImportCurrentJobTiming | undefined
  const runningJobs = new Map<number, ImportCurrentJobTiming>()
  let lastProgressState: ImportProgressState | null = null

  const syncCurrentJob = () => {
    if (runningJobs.size === 0) {
      currentJob = undefined
      return
    }
    currentJob = [...runningJobs.values()].sort(
      (a, b) => a.startedAtMs - b.startedAtMs
    )[0]
  }

  const emitProgress = (
    patch: Partial<ImportProgressState> & { models?: ImportModelProgress[] }
  ) => {
    if (patch.models) {
      modelStates = attachTimingsToModels(patch.models, timingByName)
    } else {
      modelStates = attachTimingsToModels(modelStates, timingByName)
    }
    lastProgressState = {
      active: true,
      models: modelStates,
      currentIndex: patch.currentIndex ?? 0,
      total: initial.total,
      totalRecords: initial.totalRecords,
      cumulativeImported: patch.cumulativeImported ?? cumulativeImported,
      status: patch.status ?? "importing",
      message: patch.message,
      sourceFormat,
      sourceFileName,
      totalDurationMs:
        patch.totalDurationMs ?? Math.round(nowMs() - importWallStarted),
      importStartedAtMs: importWallStarted,
      currentJob,
      jobTimings: patch.jobTimings ?? [...jobTimings],
    }
    onProgress(lastProgressState)
  }

  const buildCopyReport = (): string | undefined =>
    lastProgressState
      ? buildImportProgressReportFromState(lastProgressState)
      : undefined

  const finishImport = (
    result: Omit<RunChunkedImportResult, "copyReport">
  ): RunChunkedImportResult => ({
    ...result,
    copyReport: buildCopyReport(),
  })

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
    const runningJob: ImportCurrentJobTiming = {
      label: job.label,
      primaryModel: job.primaryModel,
      bundledModels: job.bundledModels,
      recordCount: job.recordCount,
      startedAtMs: jobStarted,
    }

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

    runningJobs.set(jobIndex, runningJob)
    syncCurrentJob()

    emitProgress({
      models: modelStates.map((model) => {
        if (model.name === job.primaryModel) {
          if (model.status === "done") return model
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

    let result: Awaited<ReturnType<AdminSdk["system"]["importData"]>>
    const heartbeat = setInterval(() => {
      syncCurrentJob()
      emitProgress({
        currentIndex: jobIndex,
        cumulativeImported,
        status: "importing",
        message: `Đang gửi ${job.label}…`,
      })
    }, 1000)
    try {
      result = await api.system.importData(
        {
          model: job.primaryModel,
          skipClear: job.skipClear,
          payload: job.payload,
        },
        isRbacImportJob(job) ? { timeoutMs: RBAC_IMPORT_TIMEOUT_MS } : undefined
      )
    } catch (error) {
      const raw =
        error instanceof Error ? error.message.trim() : "Import thất bại"
      const errMsg = formatImportRequestError(error)
      runningJobs.delete(jobIndex)
      syncCurrentJob()
      emitProgress({
        models: modelStates.map((model) =>
          model.name === job.primaryModel ||
          (job.bundledModels.includes(model.name) &&
            (model.status === "pending" || model.status === "importing"))
            ? {
                ...model,
                status: "error" as const,
                error: errMsg,
                errorTitle: raw !== errMsg ? raw : errMsg,
              }
            : model.status === "pending" || model.status === "importing"
              ? { ...model, status: "skipped" as const }
              : model
        ),
        currentIndex: jobIndex,
        cumulativeImported,
        status: "error",
        message: errMsg,
      })
      return { success: false, message: errMsg }
    } finally {
      clearInterval(heartbeat)
    }

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
    const importOk = result.success !== false && rowErrors.length === 0
    const errMsg = buildImportJobFailureMessage({
      jobLabel: job.label,
      primaryModel: job.primaryModel,
      rowErrors,
      fallbackMessage: result.message?.trim(),
    })

    if (!importOk) {
      runningJobs.delete(jobIndex)
      syncCurrentJob()
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
              errorTitle: errMsg,
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
              errorTitle: errMsg,
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

    const primaryJobsDone =
      (completedJobsPerPrimary.get(job.primaryModel) ?? 0) + 1
    completedJobsPerPrimary.set(job.primaryModel, primaryJobsDone)
    const primaryAllChunksDone =
      primaryJobsDone >= (jobsPerPrimary.get(job.primaryModel) ?? 1)

    if (job.isLastChunkForModel || primaryAllChunksDone) {
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

    runningJobs.delete(jobIndex)
    syncCurrentJob()

    emitProgress({
      models: modelStates.map((model) => {
        if (model.name === job.primaryModel) {
          if (primaryAllChunksDone || model.status === "done") {
            return { ...model, status: "done" as const, detail: undefined }
          }
          return {
            ...model,
            status: "importing" as const,
            detail: chunkDetail,
          }
        }
        if (job.bundledModels.includes(model.name)) {
          return { ...model, status: "done" as const, detail: undefined }
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
    return finishImport(importFailed)
  }

  const totalDurationMs = Math.round(nowMs() - importWallStarted)
  const slowest = [...timingByName.entries()]
    .filter(([, t]) => t.wallMs > 0)
    .sort((a, b) => b[1].wallMs - a[1].wallMs)[0]
  const doneMessage = slowest
    ? `${cumulativeImported.toLocaleString("vi-VN")} bản ghi qua ${jobs.length} lô · chậm nhất: ${slowest[0]} (${formatImportDuration(slowest[1].wallMs)}).`
    : `${cumulativeImported.toLocaleString("vi-VN")} bản ghi qua ${jobs.length} lô.`
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

  return finishImport({ success: true, message: doneMessage })
}
