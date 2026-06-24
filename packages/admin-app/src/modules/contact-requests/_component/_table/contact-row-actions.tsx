"use client"

import {
  CircleCheck,
  CircleDashed,
  CircleDot,
  Eye,
  Flag,
  MailOpen,
  Mail,
  Settings2,
  Trash2,
} from "lucide-react"
import {
  DATA_TABLE_ACTIONS_COLUMN_ID,
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionConfirm,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import {
  UsageStatusBadge,
  type UsageStatusTone,
} from "@ui/components/usage-status-badge"
import type { ContactRequest } from "../shared/types"
import {
  CONTACT_REQUEST_PRIORITIES,
  CONTACT_REQUEST_PRIORITY_LABELS,
  CONTACT_REQUEST_STATUSES,
  CONTACT_REQUEST_STATUS_LABELS,
} from "../shared/types"

const STATUS_VISUAL: Record<
  ContactRequest["status"],
  { icon: typeof CircleDot; tone: UsageStatusTone }
> = {
  new: { icon: CircleDot, tone: "warning" },
  "in-progress": { icon: CircleDashed, tone: "warning" },
  resolved: { icon: CircleCheck, tone: "success" },
  archived: { icon: CircleCheck, tone: "danger" },
}

const PRIORITY_TONE: Record<
  NonNullable<ContactRequest["priority"]>,
  UsageStatusTone
> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "success",
}

export type ContactRequestRowActionsProps = {
  contact: ContactRequest
  canUpdate: boolean
  canDelete: boolean
  busy?: boolean
  onView: () => void
  onDelete?: () => void
  onPurge?: () => void
  onStatusChange: (status: ContactRequest["status"]) => void | Promise<void>
  onSetRead: (isRead: boolean) => void | Promise<void>
  onSetPriority: (
    priority: NonNullable<ContactRequest["priority"]>
  ) => void | Promise<void>
}

function contactDeleteConfirm(
  contact: ContactRequest
): DataTableRowActionConfirm {
  return {
    title: "Đưa yêu cầu vào thùng rác?",
    description: (
      <>
        Yêu cầu từ <strong>{contact.name}</strong> ({contact.email}) sẽ không
        hiển thị trong danh sách. Có thể khôi phục trong tab Thùng rác.
      </>
    ),
    confirmLabel: "Xóa tạm",
    destructive: true,
  }
}

function contactPurgeConfirm(
  contact: ContactRequest
): DataTableRowActionConfirm {
  return {
    title: "Xóa vĩnh viễn yêu cầu?",
    description: (
      <>
        Yêu cầu từ <strong>{contact.name}</strong> ({contact.email}) sẽ bị xoá
        khỏi cơ sở dữ liệu. Không thể hoàn tác.
      </>
    ),
    confirmLabel: "Xóa vĩnh viễn",
    destructive: true,
  }
}

function ContactStatusBadge({ status }: { status: ContactRequest["status"] }) {
  const cfg = STATUS_VISUAL[status]
  const Icon = cfg.icon
  return (
    <UsageStatusBadge tone={cfg.tone} className="gap-1 text-[10px]">
      <Icon className="size-3 shrink-0" aria-hidden />
      {CONTACT_REQUEST_STATUS_LABELS[status]}
    </UsageStatusBadge>
  )
}

export function ContactRequestRowActions({
  contact,
  canUpdate,
  canDelete,
  busy,
  onView,
  onDelete,
  onPurge,
  onStatusChange,
  onSetRead,
  onSetPriority,
}: ContactRequestRowActionsProps) {
  const actions: DataTableRowActionItem[] = [
    {
      key: "view",
      label: "Xem chi tiết",
      hint: "Mở trang thông tin đầy đủ",
      onClick: onView,
      icon: <Eye />,
      group: "primary",
    },
  ]

  if (canUpdate) {
    for (const status of CONTACT_REQUEST_STATUSES) {
      if (status === contact.status) continue
      const cfg = STATUS_VISUAL[status]
      const StatusIcon = cfg.icon
      actions.push({
        key: `status-${status}`,
        label: CONTACT_REQUEST_STATUS_LABELS[status],
        hint: `Chuyển trạng thái sang «${CONTACT_REQUEST_STATUS_LABELS[status]}»`,
        onClick: () => onStatusChange(status),
        icon: <StatusIcon />,
        group: "status",
      })
    }

    actions.push({
      key: "toggle-read",
      label: contact.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc",
      hint: contact.isRead
        ? "Hiển thị lại như yêu cầu mới"
        : "Ghi nhận đã xem nội dung",
      onClick: () => onSetRead(!contact.isRead),
      icon: contact.isRead ? <Mail /> : <MailOpen />,
      group: "status",
    })

    const currentPriority = contact.priority ?? "MEDIUM"
    for (const priority of CONTACT_REQUEST_PRIORITIES) {
      if (priority === currentPriority) continue
      actions.push({
        key: `priority-${priority}`,
        label: `Ưu tiên: ${CONTACT_REQUEST_PRIORITY_LABELS[priority]}`,
        hint: `Đặt mức ưu tiên ${CONTACT_REQUEST_PRIORITY_LABELS[priority].toLowerCase()}`,
        onClick: () => onSetPriority(priority),
        icon: <Flag />,
        group: "status",
      })
    }
  }

  if (canDelete && onDelete) {
    actions.push({
      key: "soft-delete",
      label: "Xóa tạm",
      hint: "Đưa vào thùng rác, có thể khôi phục",
      onClick: onDelete,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      confirm: contactDeleteConfirm(contact),
    })
  }

  if (canDelete && onPurge) {
    actions.push({
      key: "purge",
      label: "Xóa vĩnh viễn",
      hint: "Xóa khỏi cơ sở dữ liệu, không hoàn tác",
      onClick: onPurge,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      confirm: contactPurgeConfirm(contact),
    })
  }

  const priority = contact.priority ?? "MEDIUM"

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={busy}
      autoConfirmDangerousActions={false}
      groups={{
        primary: { label: "Thao tác", icon: Settings2 },
        status: {
          label: "Trạng thái & ưu tiên",
          sublabel: true,
          header: (
            <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1">
              <ContactStatusBadge status={contact.status} />
              <UsageStatusBadge
                tone={PRIORITY_TONE[priority]}
                className="text-[10px]"
              >
                {CONTACT_REQUEST_PRIORITY_LABELS[priority]}
              </UsageStatusBadge>
              <UsageStatusBadge
                tone={contact.isRead ? "success" : "warning"}
                className="text-[10px]"
              >
                {contact.isRead ? "Đã đọc" : "Chưa đọc"}
              </UsageStatusBadge>
            </div>
          ),
        },
        danger: { label: "Xóa", sublabel: true },
      }}
    />
  )
}

export const contactRequestActionsColumnMeta = {
  ...TABLE_ACTIONS_COLUMN_META,
  className: `${TABLE_ACTIONS_COLUMN_META.className} sticky right-0 z-[10]`,
}

export const contactRequestActionsColumnId = DATA_TABLE_ACTIONS_COLUMN_ID
