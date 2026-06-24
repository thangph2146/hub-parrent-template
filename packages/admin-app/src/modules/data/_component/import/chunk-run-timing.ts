import type { ImportModelProgress } from "./progress-types"
import {
  createEmptyModelTiming,
  resolveWallClockElapsedMs,
  type ImportModelTimingStats,
} from "./timing"
import { resolveClientModelName } from "./chunk-jobs"

type ApiModelTiming = {
  model: string
  clearMs: number
  insertMs: number
  imported: number
}

export function importNowMs(): number {
  return Date.now()
}

export function attachTimingsToModels(
  models: ImportModelProgress[],
  timingByName: Map<string, ImportModelTimingStats>,
  atMs: number = importNowMs()
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

export function touchModelTiming(
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

export function markModelImportStart(
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

export function markModelImportEnd(
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

export function applyServerTimings(
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

export function addHttpJobDuration(
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
