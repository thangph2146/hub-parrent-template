import { toast } from "@ui/components/sonner"
import type {
  DatabaseSchemaResponse,
  SystemBootstrapResult,
} from "@workspace/api-client"
import { formatEntityRowCount } from "./utils"

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.setAttribute("readonly", "")
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(textarea)
      return ok
    } catch {
      return false
    }
  }
}

export function toastSystemOperationResult(options: {
  success: boolean
  title: string
  description?: string
}) {
  if (options.success) {
    toast.success(options.title, {
      description: options.description,
    })
    return
  }
  toast.error(options.title, {
    description: options.description,
  })
}

export function buildSeedBootstrapReport(
  result: SystemBootstrapResult
): string {
  const lines = [
    "=== Kết quả seed hệ thống ===",
    `Roles: +${result.rolesInserted}, cập nhật ${result.rolesUpdated}, bỏ qua ${result.rolesSkipped}`,
    `Users: +${result.usersInserted}, cập nhật ${result.usersUpdated}, bỏ qua ${result.usersSkipped}`,
    `User roles: +${result.userRolesInserted}, đã có ${result.userRolesSkipped}`,
    `Page contents: +${result.pageContentsInserted}, đã có ${result.pageContentsSkipped}`,
  ]
  return lines.join("\n")
}

export function buildDatabaseVerificationReport(
  schema: DatabaseSchemaResponse
): string {
  const lines = [
    "=== Kiểm tra cơ sở dữ liệu sau thao tác ===",
    `Tổng bảng: ${schema.tables.length}`,
    `Tổng quan hệ FK: ${schema.relations.length}`,
    `Tổng bản ghi active: ${formatEntityRowCount(schema.totalActiveRows)}`,
    `Tổng bản ghi database: ${formatEntityRowCount(schema.totalRows)}`,
  ]

  if (schema.verification) {
    lines.push(
      "",
      "=== Đối chiếu manifest import ===",
      `Nguồn: ${schema.verification.referenceSource}`,
      `Exported at: ${schema.verification.referenceExportedAt}`,
      `Trạng thái: ${schema.verification.isComplete ? "Khớp" : "Chưa khớp"}`,
      `Bảng khớp: ${schema.verification.matchedModels}`,
      `Bảng lệch: ${schema.verification.mismatchedModels}`,
      `Bản ghi nghiệp vụ: ${formatEntityRowCount(
        schema.verification.actualBusinessTotalRows
      )} / ${formatEntityRowCount(
        schema.verification.expectedBusinessTotalRows
      )}`
    )

    const mismatches = schema.verification.models.filter(
      (model) => model.status !== "ok"
    )
    if (mismatches.length > 0) {
      lines.push("", "=== Bảng lệch ===")
      for (const model of mismatches) {
        lines.push(
          `- ${model.exportModelName}: actual ${formatEntityRowCount(
            model.actual
          )} / expected ${formatEntityRowCount(model.expected)} (${model.status})${model.note ? ` — ${model.note}` : ""}`
        )
      }
    }
  } else {
    lines.push("", "Không có manifest import để đối chiếu.")
  }

  return lines.join("\n")
}
