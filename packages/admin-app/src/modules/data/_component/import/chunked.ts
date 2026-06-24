import type {
  ImportModelProgress,
  ImportProgressState,
} from "./progress-types"
import type { AdminSdk } from "@workspace/admin-app/lib/api"
import { resolveImportApi } from "@workspace/admin-app/lib/create-admin-sdk"
import {
  applyRowErrorsToModel,
  buildImportJobFailureMessage,
  buildImportProgressReportFromState,
  formatImportRequestError,
} from "./error-message"
import {
  addHttpJobDuration,
  applyServerTimings,
  attachTimingsToModels,
  importNowMs,
  markModelImportEnd,
  markModelImportStart,
} from "./chunk-run-timing"
import { formatImportDuration } from "./timing"
import type {
  ImportCurrentJobTiming,
  ImportJobTimingEntry,
  ImportModelTimingStats,
} from "./timing"
import {
  buildChunkedImportJobs,
  buildInitialImportProgress,
  HEAVY_IMPORT_TIMEOUT_MS,
  isHeavyImportJob,
  mergeRbacImportJobs,
  normalizeImportDataToTableKeys,
  runImportJobsInPool,
  type ImportChunkJob,
  type ImportConfig,
} from "./chunk-jobs"

export type { ImportConfig, ImportChunkJob } from "./chunk-jobs"
export {
  buildChunkedImportJobs,
  buildInitialImportProgress,
  mergeRbacImportJobs,
  normalizeImportDataToTableKeys,
  orderModelsForImport,
} from "./chunk-jobs"

export type RunChunkedImportResult = {
  success: boolean
  message: string
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

export async function runChunkedImport({
  api,
  config,
  data,
  sourceFormat,
  sourceFileName,
  modelTableNames,
  onProgress,
}: RunChunkedImportOptions): Promise<RunChunkedImportResult> {
  const importApi = resolveImportApi(api)
  const normalized = normalizeImportDataToTableKeys(data, modelTableNames)
  data = normalized.data
  modelTableNames = normalized.modelTableNames

  const jobs = mergeRbacImportJobs(buildChunkedImportJobs(data, config), data)
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
  const importWallStarted = importNowMs()
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
        patch.totalDurationMs ?? Math.round(importNowMs() - importWallStarted),
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
    const jobStarted = importNowMs()
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
      result = await importApi.system.importData(
        {
          model: job.primaryModel,
          skipClear: job.skipClear,
          payload: job.payload,
        },
        isHeavyImportJob(job) ? { timeoutMs: HEAVY_IMPORT_TIMEOUT_MS } : undefined
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

    const httpMs = importNowMs() - jobStarted
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
    const jobEnded = importNowMs()

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

  const totalDurationMs = Math.round(importNowMs() - importWallStarted)
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
