import type {
  ContactRequest,
  CreateContactRequestInput,
  UpdateContactRequestInput,
} from "@workspace/api-client"

export type {
  ContactRequest,
  CreateContactRequestInput,
  UpdateContactRequestInput,
}

export const CONTACT_REQUEST_STATUSES: ContactRequest["status"][] = [
  "new",
  "in-progress",
  "resolved",
  "archived",
]

export const CONTACT_REQUEST_STATUS_LABELS: Record<
  ContactRequest["status"],
  string
> = {
  new: "Mới",
  "in-progress": "Đang xử lý",
  resolved: "Đã giải quyết",
  archived: "Đã lưu trữ",
}

export const CONTACT_REQUEST_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const

export type ContactRequestPriority = (typeof CONTACT_REQUEST_PRIORITIES)[number]

export const CONTACT_REQUEST_PRIORITY_LABELS: Record<
  ContactRequestPriority,
  string
> = {
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
}
