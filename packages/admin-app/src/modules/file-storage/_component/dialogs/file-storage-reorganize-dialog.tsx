"use client"

import { useCallback, useMemo, useState } from "react"

import { Button } from "@ui/components/button"

import { PanelDialog, PanelDialogInfoCard } from "@ui/components/dialogs"

import { ScrollArea } from "@ui/components/scroll-area"

import { toast } from "@ui/components/sonner"
import { storageOperationToastOptions } from "@workspace/admin-app/lib/storage-operation-toast"

import { reorganizeDateStorageFolders } from "@workspace/admin-app/lib/admin-uploads"
import { useAdminApi } from "@workspace/admin-app/runtime"

import type { ReorganizeDateFoldersResult } from "@workspace/api-client"

import { FolderTree, Loader2, Shuffle } from "lucide-react"

import type { StorageRealm } from "../shared/types"

import { resolveReorganizeScopePath } from "../shared/utils"

type FileStorageReorganizeDialogProps = {
  open: boolean

  onOpenChange: (open: boolean) => void

  realm: StorageRealm

  activeFolderPath: string

  scopeLabel: string

  onCompleted: () => Promise<void>
}

export function FileStorageReorganizeDialog({
  open,

  onOpenChange,

  realm,

  activeFolderPath,

  scopeLabel,

  onCompleted,
}: FileStorageReorganizeDialogProps) {
  const api = useAdminApi()
  const [loading, setLoading] = useState(false)

  const [preview, setPreview] = useState<ReorganizeDateFoldersResult | null>(
    null
  )

  const scopePath = useMemo(
    () => resolveReorganizeScopePath(realm, activeFolderPath),

    [activeFolderPath, realm]
  )

  const resetState = useCallback(() => {
    setPreview(null)

    setLoading(false)
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetState()

      onOpenChange(next)
    },

    [onOpenChange, resetState]
  )

  const runReorganize = useCallback(
    async (dryRun: boolean) => {
      setLoading(true)

      const startedAt = Date.now()
      const operationLabel = dryRun
        ? "File storage — xem trước cấu trúc lại folder"
        : "File storage — cấu trúc lại folder theo ngày"
      const pending = toast.loading(
        dryRun ? "Đang xem trước cấu trúc lại…" : "Đang cấu trúc lại folder…",
        storageOperationToastOptions({
          startedAt,
          operationLabel,
          variables: { scopePath, dryRun },
          adminApi: { method: "POST", path: "/admin/uploads/reorganize-date-folders" },
        }),
      )

      try {
        const result = await reorganizeDateStorageFolders(api, {
          scopePath,

          dryRun,
        })

        setPreview(result)

        const finishOpts = storageOperationToastOptions({
          startedAt,
          operationLabel,
          variables: { scopePath, dryRun },
          data: result,
          adminApi: {
            method: "POST",
            path: "/admin/uploads/reorganize-date-folders",
          },
          extra: { id: pending },
        })

        if (dryRun) {
          toast.success(
            `Tìm thấy ${result.candidates} file cần gom về folder chính`,
            finishOpts,
          )

          return
        }

        const parts = [`Đã di chuyển ${result.moved}/${result.candidates} file`]

        if (result.renamed > 0)
          parts.push(`${result.renamed} file đổi tên tránh trùng`)

        if (result.removedDirs > 0) {
          parts.push(`dọn ${result.removedDirs} folder ngày trống`)
        }

        if (result.skipped > 0) parts.push(`${result.skipped} bỏ qua`)

        toast.success(parts.join(" · "), finishOpts)

        if (result.errors.length > 0) {
          toast.error(
            result.errors
              .slice(0, 2)
              .map((e) => e.message)
              .join("; "),
            {
              copyContext: {
                storageOperation: true,
                operationLabel,
                error: result.errors,
                data: result,
              },
            },
          )
        }

        await onCompleted()

        handleOpenChange(false)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Lỗi cấu trúc lại folder",
          storageOperationToastOptions({
            startedAt,
            operationLabel,
            variables: { scopePath, dryRun },
            error: err,
            adminApi: {
              method: "POST",
              path: "/admin/uploads/reorganize-date-folders",
            },
            extra: { id: pending },
          }),
        )
      } finally {
        setLoading(false)
      }
    },

    [api, handleOpenChange, onCompleted, scopePath]
  )

  return (
    <PanelDialog
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Shuffle />}
      title="Cấu trúc lại folder theo ngày"
      description={
        <>
          Gom file từ các folder{" "}
          <span className="font-mono text-foreground">YYYY/MM/DD</span>,{" "}
          <span className="font-mono text-foreground">YYYY/MM</span> hoặc{" "}
          <span className="font-mono text-foreground">YYYY</span> về folder
          chính trong phạm vi đang xem.
        </>
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Đóng
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => void runReorganize(true)}
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Xem trước
          </Button>

          <Button
            type="button"
            onClick={() => void runReorganize(false)}
            disabled={loading || (preview !== null && preview.candidates === 0)}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Cấu trúc lại
          </Button>
        </>
      }
    >
      <PanelDialogInfoCard icon={<FolderTree />} title="Phạm vi">
        <p>{scopeLabel}</p>

        <p className="mt-1 font-mono text-xs">{scopePath}</p>

        <p className="mt-2 text-xs">
          Ví dụ:{" "}
          <span className="font-mono">images/avatars/2026/05/15/a.jpg</span> →{" "}
          <span className="font-mono">images/avatars/a.jpg</span>. Folder ngày
          trống sẽ được dọn sau khi di chuyển.
        </p>
      </PanelDialogInfoCard>

      {preview ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Xem trước ({preview.candidates} file)
          </p>

          {preview.candidates === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có file nào trong phạm vi cần cấu trúc lại.
            </p>
          ) : (
            <ScrollArea className="h-44 rounded-xl border border-border/70 bg-card/40 p-2 shadow-sm">
              <ul className="space-y-2 text-xs">
                {preview.preview.map((item) => (
                  <li key={item.from} className="font-mono leading-relaxed">
                    <span className="text-muted-foreground">{item.from}</span>

                    <br />

                    <span className="text-primary">→ {item.to}</span>
                  </li>
                ))}

                {preview.candidates > preview.preview.length ? (
                  <li className="text-muted-foreground">
                    … và {preview.candidates - preview.preview.length} file khác
                  </li>
                ) : null}
              </ul>
            </ScrollArea>
          )}
        </div>
      ) : null}
    </PanelDialog>
  )
}
