"use client"

import { useCallback, useState } from "react"
import { Button } from "@ui/components/button"
import { ConfirmActionDialog } from "@ui/components/dialogs"
import { toast } from "@ui/components/sonner"
import { storageOperationToastOptions } from "@workspace/admin-app/lib/storage-operation-toast"
import { deleteStorageFolder } from "@workspace/admin-app/lib/admin-uploads"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { FolderX, Loader2 } from "lucide-react"
import type { StorageRealm } from "../shared/types"
import { resolveStorageFolderDiskPath } from "../shared/utils"

type FileStorageDeleteFolderButtonProps = {
  realm: StorageRealm
  folderPath: string
  folderLabel: string
  onDeleted: () => Promise<void>
  disabled?: boolean
}

export function FileStorageDeleteFolderButton({
  realm,
  folderPath,
  folderLabel,
  onDeleted,
  disabled = false,
}: FileStorageDeleteFolderButtonProps) {
  const api = useAdminApi()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const diskPath = resolveStorageFolderDiskPath(realm, folderPath)

  const runDelete = useCallback(async () => {
    if (!diskPath) return

    setDeleting(true)
    const startedAt = Date.now()
    const operationLabel = `File storage — xóa thư mục «${folderLabel}»`
    const pending = toast.loading(
      "Đang xóa thư mục…",
      storageOperationToastOptions({
        startedAt,
        operationLabel,
        variables: { diskPath },
        adminApi: { method: "DELETE", path: "/admin/uploads/folders" },
      }),
    )
    try {
      await deleteStorageFolder(api, diskPath)
      toast.success(
        `Đã xóa thư mục «${folderLabel}»`,
        storageOperationToastOptions({
          startedAt,
          operationLabel,
          variables: { diskPath },
          data: { folderLabel, diskPath },
          adminApi: { method: "DELETE", path: "/admin/uploads/folders" },
          extra: { id: pending },
        }),
      )
      await onDeleted()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không xóa được thư mục",
        storageOperationToastOptions({
          startedAt,
          operationLabel,
          variables: { diskPath },
          error: err,
          adminApi: { method: "DELETE", path: "/admin/uploads/folders" },
          extra: { id: pending },
        }),
      )
    } finally {
      setDeleting(false)
    }
  }, [api, diskPath, folderLabel, onDeleted])

  if (!diskPath) return null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-destructive hover:text-destructive"
        onClick={() => setConfirmOpen(true)}
        disabled={disabled || deleting}
      >
        {deleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FolderX className="size-4" />
        )}
        Xóa folder
      </Button>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Xóa thư mục «${folderLabel}»?`}
        icon={<FolderX className="size-5 text-destructive" />}
        description={
          <>
            Toàn bộ file bên trong sẽ bị xóa vĩnh viễn.
            <br />
            <br />
            Đường dẫn:{" "}
            <span className="font-mono text-foreground">{diskPath}</span>
            <br />
            <br />
            Thao tác không thể hoàn tác.
          </>
        }
        confirmLabel="Xóa thư mục"
        cancelLabel="Huỷ"
        confirmDestructive
        onConfirm={runDelete}
      />
    </>
  )
}
