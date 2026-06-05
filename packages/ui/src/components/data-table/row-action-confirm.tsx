"use client"

import { useCallback, useState, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../alert-dialog"
import type { DataTableRowActionItem } from "./table-row-actions"

export type DataTableRowActionConfirm =
  | boolean
  | {
      title: string
      description?: ReactNode
      confirmLabel?: string
      destructive?: boolean
    }

const DANGER_ACTION_KEYS = new Set([
  "soft-delete",
  "purge",
  "delete",
  "restore",
  "toggle-active",
  "toggle-inactive",
  "activate",
  "deactivate",
])

function defaultConfirmForAction(
  action: DataTableRowActionItem
): DataTableRowActionConfirm | undefined {
  if (action.key === "soft-delete" || action.key === "delete") {
    return {
      title: "Đưa bản ghi vào thùng rác?",
      description:
        action.hint ??
        "Bản ghi sẽ được chuyển vào thùng rác và có thể khôi phục sau.",
      confirmLabel: action.label || "Xóa tạm",
      destructive: true,
    }
  }

  if (action.key === "purge") {
    return {
      title: "Xóa vĩnh viễn bản ghi?",
      description:
        action.hint ?? "Hành động này không thể hoàn tác.",
      confirmLabel: action.label || "Xóa vĩnh viễn",
      destructive: true,
    }
  }

  if (action.key === "restore") {
    return {
      title: "Khôi phục bản ghi?",
      description: action.hint ?? "Bản ghi sẽ trở lại danh sách chính.",
      confirmLabel: action.label || "Khôi phục",
    }
  }

  if (
    action.key === "toggle-inactive" ||
    action.key === "deactivate"
  ) {
    return {
      title: "Khoá tài khoản?",
      description:
        action.hint ??
        "Tài khoản sẽ bị vô hiệu hóa và phiên đăng nhập hiện tại có thể bị thu hồi.",
      confirmLabel: action.label || "Khoá",
      destructive: true,
    }
  }

  if (action.key === "toggle-active" || action.key === "activate") {
    return {
      title: "Kích hoạt tài khoản?",
      description: action.hint ?? "Cho phép đăng nhập và sử dụng lại.",
      confirmLabel: action.label || "Kích hoạt",
    }
  }

  if (action.menuVariant === "destructive" || action.group === "danger") {
    return {
      title: "Xác nhận thao tác?",
      description: action.hint ?? "Thao tác này có thể không hoàn tác.",
      confirmLabel: action.label || "Xác nhận",
      destructive: true,
    }
  }

  return undefined
}

/** Confirm có tên bản ghi — dùng với menu ⋯ admin. */
export function buildAdminRowActionConfirm(
  key: string,
  recordLabel: string,
  labels?: {
    softDelete?: string
    purge?: string
    restore?: string
    lock?: string
    activate?: string
  }
): DataTableRowActionConfirm | undefined {
  const quoted = `«${recordLabel}»`
  if (key === "soft-delete" || key === "delete") {
    return {
      title: `Đưa ${quoted} vào thùng rác?`,
      description: "Bản ghi sẽ được chuyển vào thùng rác và có thể khôi phục sau.",
      confirmLabel: labels?.softDelete ?? "Xóa tạm",
      destructive: true,
    }
  }
  if (key === "purge") {
    return {
      title: `Xóa vĩnh viễn ${quoted}?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: labels?.purge ?? "Xóa vĩnh viễn",
      destructive: true,
    }
  }
  if (key === "restore") {
    return {
      title: `Khôi phục ${quoted}?`,
      description: "Bản ghi sẽ trở lại danh sách chính.",
      confirmLabel: labels?.restore ?? "Khôi phục",
    }
  }
  if (key === "toggle-inactive" || key === "deactivate") {
    return {
      title: `Khoá ${quoted}?`,
      description:
        "Tài khoản sẽ bị vô hiệu hóa và phiên đăng nhập hiện tại có thể bị thu hồi.",
      confirmLabel: labels?.lock ?? "Khoá",
      destructive: true,
    }
  }
  if (key === "toggle-active" || key === "activate") {
    return {
      title: `Kích hoạt ${quoted}?`,
      description: "Cho phép đăng nhập và sử dụng lại.",
      confirmLabel: labels?.activate ?? "Kích hoạt",
    }
  }
  return defaultConfirmForAction({
    key,
    label: "",
    onClick: () => {},
  })
}

/** `confirm: false` tắt; không khai báo + `autoConfirm` → mặc định theo loại thao tác. */
export function resolveRowActionConfirm(
  action: DataTableRowActionItem,
  autoConfirm = true
): DataTableRowActionConfirm | undefined {
  if (action.confirm === false) return undefined
  if (action.confirm === true) {
    return (
      defaultConfirmForAction(action) ?? {
        title: "Xác nhận thao tác?",
        confirmLabel: "Xác nhận",
      }
    )
  }
  if (action.confirm && typeof action.confirm === "object") {
    return action.confirm
  }

  if (!autoConfirm) return undefined

  if (
    DANGER_ACTION_KEYS.has(action.key) ||
    action.menuVariant === "destructive" ||
    action.group === "danger"
  ) {
    return defaultConfirmForAction(action)
  }

  return undefined
}

export function useRowActionConfirm(autoConfirmDangerousActions = true) {
  const [pendingAction, setPendingAction] =
    useState<DataTableRowActionItem | null>(null)
  const [running, setRunning] = useState(false)

  const runAction = useCallback(
    (action: DataTableRowActionItem) => {
      if (action.disabled) return
      const confirm = resolveRowActionConfirm(
        action,
        autoConfirmDangerousActions
      )
      if (confirm) {
        setPendingAction({ ...action, confirm })
        return
      }
      action.onClick()
    },
    [autoConfirmDangerousActions]
  )

  const handleConfirm = useCallback(async () => {
    if (!pendingAction) return
    setRunning(true)
    try {
      await pendingAction.onClick()
      setPendingAction(null)
    } catch {
      // Giữ dialog mở; handler thường đã toast lỗi.
    } finally {
      setRunning(false)
    }
  }, [pendingAction])

  const handleCancel = useCallback(() => {
    if (running) return
    setPendingAction(null)
  }, [running])

  return {
    runAction,
    confirmDialog: (
      <RowActionConfirmDialog
        action={pendingAction}
        running={running}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    ),
  }
}

type RowActionConfirmDialogProps = {
  action: DataTableRowActionItem | null
  running: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function RowActionConfirmDialog({
  action,
  running,
  onCancel,
  onConfirm,
}: RowActionConfirmDialogProps) {
  const isOpen = action != null
  const confirm =
    action != null ? resolveRowActionConfirm(action, true) : undefined

  const title =
    typeof confirm === "object"
      ? confirm.title
      : (action?.label ?? "Xác nhận thao tác")

  const description =
    typeof confirm === "object" && confirm.description != null
      ? confirm.description
      : "Bạn có chắc muốn tiếp tục?"

  const confirmLabel =
    typeof confirm === "object" ? (confirm.confirmLabel ?? "Xác nhận") : "Xác nhận"

  const isDestructive =
    typeof confirm === "object" && Boolean(confirm.destructive)

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={running}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
            disabled={running}
            className={
              isDestructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {running ? "Đang xử lý..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
