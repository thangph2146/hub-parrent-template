"use client"

import {
  formatHanetTimeDisplay,
  isHanetTimeField,
} from "@workspace/admin-app/lib/hanet-time-format"

function collectRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter(
      (row): row is Record<string, unknown> =>
        row != null && typeof row === "object" && !Array.isArray(row)
    )
  }
  if (!data || typeof data !== "object") return []
  const record = data as Record<string, unknown>
  for (const key of ["list", "items", "rows", "data", "persons", "checkins"]) {
    const nested = record[key]
    if (Array.isArray(nested)) return collectRows(nested)
  }
  return []
}

export function HanetJsonPreview({
  data,
  formatTimeFields = false,
}: {
  data: unknown
  formatTimeFields?: boolean
}) {
  const rows = collectRows(data)
  if (rows.length) {
    const keys = Array.from(
      new Set(rows.flatMap((row) => Object.keys(row)))
    ).slice(0, 12)
    return (
      <div className="overflow-x-auto rounded-lg border border-border/70">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/70 bg-muted/30">
              {keys.map((key) => (
                <th key={key} className="px-3 py-2 text-left font-medium">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((row, index) => (
              <tr key={index} className="border-b border-border/40">
                {keys.map((key) => (
                  <td key={key} className="max-w-[14rem] truncate px-3 py-2">
                    {formatCell(row[key], key, formatTimeFields)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 100 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            Hiển thị 100 / {rows.length} dòng.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <pre className="max-h-96 overflow-auto rounded-lg border border-border/70 bg-muted/20 p-4 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function formatCell(
  value: unknown,
  key?: string,
  formatTimeFields = false,
): string {
  if (formatTimeFields && key && isHanetTimeField(key)) {
    const formatted = formatHanetTimeDisplay(value)
    if (formatted) return formatted
  }
  if (value == null) return "—"
  if (typeof value === "string" || typeof value === "number") return String(value)
  return JSON.stringify(value)
}
