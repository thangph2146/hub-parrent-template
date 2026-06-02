"use client"

import {
  ConfirmActionDialog,
  type ConfirmActionDialogProps,
} from "../../dialogs"

export type AdminConfirmActionDialogProps = Omit<
  ConfirmActionDialogProps,
  "cancelLabel"
> & {
  cancelLabel?: string
}

export function AdminConfirmActionDialog({
  cancelLabel = "Huỷ",
  ...props
}: AdminConfirmActionDialogProps) {
  return <ConfirmActionDialog cancelLabel={cancelLabel} {...props} />
}
