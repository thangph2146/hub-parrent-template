"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
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

export type ConfirmActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void | Promise<void>
  description?: ReactNode
  icon?: ReactNode
  confirmDestructive?: boolean
  confirmDisabled?: boolean
  /** Chỉ dùng khi `dismissOnConfirm={false}` — spinner trên nút xác nhận. */
  confirmLoading?: boolean
  /**
   * Đóng dialog ngay khi bấm xác nhận; handler / `useAdminMutation` hiển thị toast loading.
   * Mặc định `true`. Đặt `false` cho bước wizard (chuyển sang dialog khác trước khi gọi API).
   */
  dismissOnConfirm?: boolean
  contentClassName?: string
  footerClassName?: string
  titleClassName?: string
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  confirmLabel,
  cancelLabel,
  confirmDestructive = false,
  confirmDisabled = false,
  confirmLoading = false,
  dismissOnConfirm = true,
  onConfirm,
  contentClassName,
  footerClassName,
  titleClassName,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={titleClassName ?? "flex items-center gap-2 text-left"}
          >
            {icon}
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter className={footerClassName}>
          <AlertDialogCancel className="rounded-lg">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              confirmDestructive
                ? "rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "rounded-lg"
            }
            onClick={(event) => {
              event.preventDefault()
              if (confirmDisabled) return
              if (dismissOnConfirm) {
                onOpenChange(false)
              }
              void Promise.resolve(onConfirm())
            }}
            disabled={confirmDisabled || (!dismissOnConfirm && confirmLoading)}
          >
            {!dismissOnConfirm && confirmLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
