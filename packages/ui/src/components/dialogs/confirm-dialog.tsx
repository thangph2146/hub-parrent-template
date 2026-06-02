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
  onConfirm: () => void
  description?: ReactNode
  icon?: ReactNode
  confirmDestructive?: boolean
  confirmDisabled?: boolean
  confirmLoading?: boolean
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
          <AlertDialogCancel className="rounded-lg">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={
              confirmDestructive
                ? "rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "rounded-lg"
            }
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            disabled={confirmDisabled}
          >
            {confirmLoading ? (
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
