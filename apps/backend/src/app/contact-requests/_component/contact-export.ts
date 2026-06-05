import type { ExportFieldDef } from "@ui/lib/build-field-export"
import {
  CONTACT_REQUEST_PRIORITY_LABELS,
  CONTACT_REQUEST_STATUS_LABELS,
} from "./types"
import type { ContactRequest } from "./types"

export function parseContactStructuredContent(
  content: string | undefined,
): Record<string, string> {
  if (!content) return {}
  const parsed: Record<string, string> = {}
  for (const line of content.split("\n").filter((l) => l.trim())) {
    const match = line.match(/^([^:]+):\s*(.+)$/)
    if (match) {
      const [, key, value] = match
      parsed[key.trim()] = value.trim()
    }
  }
  return parsed
}

const ACTIVE_EXPORT_FIELDS: ExportFieldDef<ContactRequest>[] = [
  { header: "Tên", value: (r) => r.name, width: 22 },
  { header: "Email", value: (r) => r.email, width: 28 },
  { header: "Số điện thoại", value: (r) => r.phone, width: 16 },
  { header: "Tiêu đề", value: (r) => r.subject, width: 32, wrap: true },
  {
    header: "Địa chỉ",
    value: (r) =>
      parseContactStructuredContent(r.content || r.message || "")["Địa chỉ"],
    width: 28,
    wrap: true,
  },
  {
    header: "Chương trình",
    value: (r) =>
      parseContactStructuredContent(r.content || r.message || "")[
        "Chương trình"
      ],
    width: 24,
  },
  {
    header: "Ngành",
    value: (r) =>
      parseContactStructuredContent(r.content || r.message || "")["Ngành"],
    width: 20,
  },
  {
    header: "Đăng ký nhận thông tin tuyển sinh",
    value: (r) =>
      parseContactStructuredContent(r.content || r.message || "")[
        "Đăng ký nhận thông tin tuyển sinh"
      ],
    width: 18,
  },
  {
    header: "Đăng ký tư vấn",
    value: (r) =>
      parseContactStructuredContent(r.content || r.message || "")[
        "Đăng ký tư vấn"
      ],
    width: 14,
  },
  {
    header: "Nội dung",
    value: (r) => {
      const parsed = parseContactStructuredContent(r.content || r.message || "")
      return parsed["Nội dung"] || r.content || r.message || ""
    },
    width: 40,
    wrap: true,
  },
  {
    header: "Trạng thái",
    value: (r) => CONTACT_REQUEST_STATUS_LABELS[r.status],
    width: 14,
  },
  {
    header: "Ưu tiên",
    value: (r) =>
      r.priority
        ? CONTACT_REQUEST_PRIORITY_LABELS[r.priority]
        : CONTACT_REQUEST_PRIORITY_LABELS.MEDIUM,
    width: 12,
  },
  { header: "Đã đọc", value: (r) => r.isRead, width: 10 },
  { header: "Người được giao", value: (r) => r.assignedToName, width: 20 },
  { header: "Ngày tạo", value: (r) => r.createdAt, width: 18 },
  { header: "Ngày cập nhật", value: (r) => r.updatedAt, width: 18 },
]

const TRASH_EXPORT_FIELDS: ExportFieldDef<ContactRequest>[] = [
  { header: "Tên", value: (r) => r.name, width: 22 },
  { header: "Email", value: (r) => r.email, width: 28 },
  { header: "Tiêu đề", value: (r) => r.subject, width: 32, wrap: true },
  {
    header: "Địa chỉ",
    value: (r) =>
      parseContactStructuredContent(r.content || r.message || "")["Địa chỉ"],
    width: 28,
    wrap: true,
  },
  {
    header: "Chương trình",
    value: (r) =>
      parseContactStructuredContent(r.content || r.message || "")[
        "Chương trình"
      ],
    width: 24,
  },
  {
    header: "Ngành",
    value: (r) =>
      parseContactStructuredContent(r.content || r.message || "")["Ngành"],
    width: 20,
  },
  {
    header: "Nội dung",
    value: (r) => r.content || r.message || "",
    width: 40,
    wrap: true,
  },
  { header: "Xóa lúc", value: (r) => r.deletedAt, width: 18 },
]

export function getContactRequestExportFields(
  kind: "active" | "trash",
): ExportFieldDef<ContactRequest>[] {
  return kind === "trash" ? TRASH_EXPORT_FIELDS : ACTIVE_EXPORT_FIELDS
}
