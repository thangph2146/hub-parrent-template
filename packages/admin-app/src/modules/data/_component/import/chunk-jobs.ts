import type {
  ImportModelProgress,
  ImportProgressState,
} from "./progress-types"
import type { ImportConfigResponse } from "@workspace/api-client"

export type ImportConfig = ImportConfigResponse

export type ImportChunkJob = {
  label: string
  primaryModel: string
  skipClear: boolean
  payload: Record<string, unknown[]>
  recordCount: number
  bundledModels: string[]
  isLastChunkForModel: boolean
}

/** RBAC / post JSON nặng — request có thể chờ server vài phút. */
export const HEAVY_IMPORT_TIMEOUT_MS = 300_000

/** Mặc định 2MB/lô HTTP — tránh proxy/nginx OOM với post Lexical cỡ lớn (~15MB). */
const POST_IMPORT_PAYLOAD_CHUNK_BYTES = 2 * 1024 * 1024

/** Khóa RBAC — import cuối để tránh TRUNCATE roles/user_roles làm mất quyền giữa các lô HTTP. */
export const RBAC_IMPORT_KEY_GROUPS = [
  ["role", "roles"],
  ["user", "users"],
  ["userRole", "user_roles"],
] as const

const RBAC_IMPORT_KEYS = new Set<string>(
  RBAC_IMPORT_KEY_GROUPS.flatMap((group) => [...group])
)

const RBAC_TABLE_IMPORT_ORDER = ["roles", "users", "user_roles"] as const

function isRbacImportKey(key: string): boolean {
  return RBAC_IMPORT_KEYS.has(key)
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items]
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function estimateImportRowBytes(row: unknown): number {
  try {
    return JSON.stringify(row).length
  } catch {
    return 0
  }
}

function chunkArrayByPayloadSize<T>(
  items: T[],
  maxCount: number,
  maxPayloadBytes: number,
  estimateBytes: (item: T) => number = estimateImportRowBytes
): T[][] {
  if (items.length === 0) return []
  const chunks: T[][] = []
  let current: T[] = []
  let currentBytes = 0

  const pushCurrent = () => {
    if (current.length > 0) {
      chunks.push(current)
      current = []
      currentBytes = 0
    }
  }

  for (const item of items) {
    const itemBytes = estimateBytes(item)
    if (itemBytes > maxPayloadBytes) {
      pushCurrent()
      chunks.push([item])
      continue
    }
    const nextBytes = currentBytes + itemBytes
    if (
      current.length > 0 &&
      (current.length >= maxCount || nextBytes > maxPayloadBytes)
    ) {
      pushCurrent()
    }
    current.push(item)
    currentBytes += itemBytes
  }
  pushCurrent()
  return chunks
}

function resolveImportRowChunks(
  modelKey: string,
  rows: unknown[],
  chunkSize: number,
  config: ImportConfig
): unknown[][] {
  if (modelKey !== "post") return chunkArray(rows, chunkSize)
  const maxPayloadBytes =
    config.postPayloadChunkBytes ?? POST_IMPORT_PAYLOAD_CHUNK_BYTES
  return chunkArrayByPayloadSize(rows, chunkSize, maxPayloadBytes)
}

function resolveImportModelKey(key: string, config: ImportConfig): string {
  if (config.modelChunkSizes?.[key] != null) return key
  if (config.bundles[key]?.length) return key
  if (config.modelTableNames) {
    for (const [model, table] of Object.entries(config.modelTableNames)) {
      if (table === key) return model
    }
  }
  return key
}

function resolveImportDataKey(
  key: string,
  config: ImportConfig,
  data: Record<string, unknown[]>
): string | undefined {
  if (Array.isArray(data[key])) return key
  const table = config.modelTableNames?.[key]
  if (table && Array.isArray(data[table])) return table
  return undefined
}

export function isHeavyImportJob(job: ImportChunkJob): boolean {
  const isRbac =
    isRbacImportKey(job.primaryModel) ||
    job.bundledModels.some((model) => isRbacImportKey(model))
  const isPost =
    job.primaryModel === "post" ||
    job.primaryModel === "posts" ||
    job.bundledModels.some((model) => model === "post" || model === "posts")
  return isRbac || isPost
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

    const modelKey = resolveImportModelKey(primary, config)
    const bundleExtras = isRbacImportKey(primary)
      ? []
      : (config.bundles[primary] ?? config.bundles[modelKey] ?? []).filter(
          (extra) => {
            if (skipBundled.has(extra)) return false
            const extraKey = resolveImportDataKey(extra, config, data)
            if (!extraKey || skipBundled.has(extraKey)) return false
            const extraRows = data[extraKey]
            return Array.isArray(extraRows) && extraRows.length > 0
          }
        )
    bundleExtras.forEach((extra) => {
      skipBundled.add(extra)
      const extraKey = resolveImportDataKey(extra, config, data)
      if (extraKey) skipBundled.add(extraKey)
    })

    const chunkSize =
      config.modelChunkSizes?.[primary] ??
      config.modelChunkSizes?.[modelKey] ??
      config.rowChunkSize
    const chunks = resolveImportRowChunks(modelKey, rows, chunkSize, config)
    const deferPivotBundle =
      bundleExtras.length > 0 && (chunks.length > 1 || modelKey === "post")

    chunks.forEach((chunk, chunkIndex) => {
      const payload: Record<string, unknown[]> = { [primary]: chunk }
      const bundledModels: string[] = []

      if (!deferPivotBundle && chunkIndex === 0) {
        for (const extra of bundleExtras) {
          const extraKey = resolveImportDataKey(extra, config, data)
          if (!extraKey) continue
          payload[extraKey] = data[extraKey] as unknown[]
          bundledModels.push(extraKey)
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
        skipClear: chunkIndex !== 0,
        payload,
        recordCount,
        bundledModels,
        isLastChunkForModel: false,
      })
    })

    if (deferPivotBundle) {
      const pivotPrimary = bundleExtras[0]!
      const pivotPrimaryKey =
        resolveImportDataKey(pivotPrimary, config, data) ?? pivotPrimary
      const pivotPayload: Record<string, unknown[]> = {}
      const pivotBundled: string[] = []
      for (const extra of bundleExtras) {
        const extraKey = resolveImportDataKey(extra, config, data) ?? extra
        pivotPayload[extraKey] = data[extraKey] as unknown[]
        if (extraKey !== pivotPrimaryKey) pivotBundled.push(extraKey)
      }
      const pivotCount = Object.values(pivotPayload).reduce(
        (sum, value) => sum + value.length,
        0
      )
      jobs.push({
        label:
          pivotBundled.length > 0
            ? `${pivotPrimaryKey} + ${pivotBundled.join(", ")}`
            : pivotPrimaryKey,
        primaryModel: pivotPrimaryKey,
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

export function resolveClientModelName(
  serverModel: string,
  models: ImportModelProgress[]
): string {
  const direct = models.find((m) => m.name === serverModel)
  if (direct) return direct.name

  for (const group of RBAC_IMPORT_KEY_GROUPS) {
    if ((group as readonly string[]).includes(serverModel)) {
      const match = models.find((m) =>
        (group as readonly string[]).includes(m.name)
      )
      if (match) return match.name
    }
  }

  return serverModel
}

/** Chạy job import song song với giới hạn concurrency. */
export async function runImportJobsInPool<T>(
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