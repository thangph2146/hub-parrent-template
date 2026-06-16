export type HanetPersonParsedRow = {
  personId: string
  displayName: string
  aliasId: string
  avatar: string
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value.trim()
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value)
    }
  }
  return ""
}

export function parseHanetPersonRecord(raw: unknown): HanetPersonParsedRow | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const record = raw as Record<string, unknown>

  const personId = pickString(record, [
    "personID",
    "personId",
    "person_id",
    "id",
  ])
  if (!personId) return null

  return {
    personId,
    displayName: pickString(record, [
      "personName",
      "person_name",
      "name",
      "fullName",
    ]),
    aliasId: pickString(record, ["aliasID", "aliasId", "alias_id"]),
    avatar: pickString(record, [
      "avatar",
      "image",
      "imageUrl",
      "image_url",
      "faceUrl",
      "face_url",
      "url",
    ]),
  }
}

function collectPersonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== "object") return []

  const record = value as Record<string, unknown>
  for (const key of [
    "list",
    "persons",
    "personList",
    "items",
    "rows",
    "data",
  ]) {
    const nested = record[key]
    if (Array.isArray(nested)) return nested
  }

  return []
}

export function parseHanetPersonListPage(data: unknown): {
  items: HanetPersonParsedRow[]
  total?: number
} {
  const rawItems = collectPersonArray(data)
  const items = rawItems
    .map((row) => parseHanetPersonRecord(row))
    .filter((row): row is HanetPersonParsedRow => row != null)

  let total: number | undefined
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const record = data as Record<string, unknown>
    const totalRaw =
      record.total ??
      record.totalCount ??
      record.count ??
      record.totalPerson ??
      record.personTotal ??
      record.totalRecord
    if (typeof totalRaw === "number" && Number.isFinite(totalRaw)) {
      total = totalRaw
    } else if (typeof totalRaw === "string" && totalRaw.trim()) {
      const parsed = Number.parseInt(totalRaw, 10)
      if (Number.isFinite(parsed)) total = parsed
    }
  }

  return { items, total }
}

/** Chuẩn hóa phản hồi tra cứu person (danh sách hoặc một user). */
export function parseHanetPersonLookupResult(data: unknown): {
  items: HanetPersonParsedRow[]
  total?: number
} {
  const page = parseHanetPersonListPage(data)
  if (page.items.length > 0) return page

  const single = parseHanetPersonRecord(data)
  if (single) return { items: [single] }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const record = data as Record<string, unknown>
    for (const key of ["person", "user", "userInfo", "info", "data"]) {
      const nested = parseHanetPersonRecord(record[key])
      if (nested) return { items: [nested] }
    }
  }

  return { items: [] }
}
