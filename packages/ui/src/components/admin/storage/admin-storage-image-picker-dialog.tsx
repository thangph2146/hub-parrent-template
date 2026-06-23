"use client"

import { useRef, useState } from "react"

import { Button } from "../../button"

import { ConfirmActionDialog } from "../../dialogs"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../dialog"

import {
  ADMIN_DIALOG_CONTENT_FULL_BLEED_CLASS,
  ADMIN_DIALOG_FOOTER_FLUSH_CLASS,
} from "../../../lib/layout-shell"

import { AdminStoragePickerPanel } from "./admin-storage-picker-panel"

import type {
  AdminStoragePickerAdapters,
  AdminStoragePickerFolderScope,
  AdminStoragePickerUploadConfig,
} from "./types"

export type AdminStorageImagePickerDialogProps = {
  open: boolean

  onOpenChange: (open: boolean) => void

  adapters: AdminStoragePickerAdapters

  onSelect: (urls: string[]) => void

  title?: string

  multiSelect?: boolean

  imagesOnly?: boolean

  folderScope?: AdminStoragePickerFolderScope | null

  upload?: AdminStoragePickerUploadConfig

  canDelete?: boolean
}

export function AdminStorageImagePickerDialog({
  open,

  onOpenChange,

  adapters,

  onSelect,

  title = "Chọn ảnh từ kho lưu trữ",

  multiSelect = true,

  imagesOnly = true,

  folderScope = null,

  upload,

  canDelete = true,
}: AdminStorageImagePickerDialogProps) {
  const [selectionCount, setSelectionCount] = useState(0)

  const [deletingBulk, setDeletingBulk] = useState(false)

  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const confirmPickRef = useRef<(() => void) | null>(null)

  const clearSelectionRef = useRef<(() => void) | null>(null)

  const bulkDeleteRef = useRef<(() => void | Promise<void>) | null>(null)

  const closeDialog = () => onOpenChange(false)

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setSelectionCount(0)

            setBulkDeleteConfirmOpen(false)
          }

          onOpenChange(next)
        }}
      >
        <DialogContent
          className={`${ADMIN_DIALOG_CONTENT_FULL_BLEED_CLASS} max-w-[min(96vw,72rem)] sm:max-w-[72rem]`}
        >
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {open ? (
              <AdminStoragePickerPanel
                adapters={adapters}
                imagesOnly={imagesOnly}
                multiSelect={multiSelect}
                folderScope={folderScope}
                upload={upload}
                canDelete={canDelete}
                onSelectionCountChange={setSelectionCount}
                confirmPickRef={confirmPickRef}
                clearSelectionRef={clearSelectionRef}
                bulkDeleteRef={bulkDeleteRef}
                onDeletingBulkChange={setDeletingBulk}
                onPick={(urls) => {
                  onSelect(urls)

                  onOpenChange(false)
                }}
              />
            ) : null}
          </div>

          {multiSelect ? (
            <DialogFooter className={ADMIN_DIALOG_FOOTER_FLUSH_CLASS}>
              <p
                className="min-w-0 text-sm text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                {selectionCount > 0
                  ? `Đã chọn ${selectionCount} ảnh — giữ khi đổi trang`
                  : "Tick ảnh trên bảng hoặc bấm «Xác nhận» khi đã chọn xong"}
              </p>

              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deletingBulk}
                  onClick={closeDialog}
                >
                  Hủy
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={selectionCount === 0 || deletingBulk}
                  onClick={() => clearSelectionRef.current?.()}
                >
                  Bỏ chọn
                </Button>

                {canDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={selectionCount === 0 || deletingBulk}
                    onClick={() => setBulkDeleteConfirmOpen(true)}
                  >
                    Xóa khỏi kho
                  </Button>
                ) : null}

                <Button
                  type="button"
                  size="sm"
                  disabled={selectionCount === 0 || deletingBulk}
                  onClick={() => confirmPickRef.current?.()}
                >
                  Xác nhận{selectionCount > 0 ? ` (${selectionCount})` : ""}
                </Button>
              </div>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>

      {canDelete ? (
        <ConfirmActionDialog
          open={bulkDeleteConfirmOpen}
          onOpenChange={setBulkDeleteConfirmOpen}
          title="Xóa file khỏi kho lưu trữ"
          description={
            <>
              Bạn sắp xóa{" "}
              <strong className="tabular-nums">{selectionCount}</strong> file
              trên disk. Thao tác không gỡ URL đã gán trên form sản phẩm.
            </>
          }
          confirmLabel="Xóa khỏi kho"
          cancelLabel="Hủy"
          confirmDestructive
          onConfirm={async () => {
            await bulkDeleteRef.current?.()
          }}
        />
      ) : null}
    </>
  )
}
