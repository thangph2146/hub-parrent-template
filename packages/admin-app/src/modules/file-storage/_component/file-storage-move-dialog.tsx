"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@ui/components/button"

import {
  PanelDialog,
  PanelDialogDestination,
  PanelDialogEmpty,
  PanelDialogHint,
  PanelDialogLoading,
  PanelDialogSearch,
  PanelDialogTreePanel,
} from "@ui/components/dialogs"

import { Tabs } from "@ui/components/tabs"
import { AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"

import { toast } from "@ui/components/sonner"
import { storageOperationToastOptions } from "@workspace/admin-app/lib/storage-operation-toast"

import {
  bulkMoveStorageFiles,
  fetchStorageFolders,
  type FolderItem,
} from "@workspace/admin-app/lib/admin-uploads"

import { FolderInput, Loader2 } from "lucide-react"

import { FileStorageFolderTree } from "./file-storage-folder-tree"

import type { FileStorageRow, StorageRealm } from "./types"

import {
  REALM_STORAGE_LABELS,
  buildRealmVirtualRoots,
  filterFoldersByRealm,
} from "./utils"

type FileStorageMoveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRows: FileStorageRow[]
  onMoved: () => Promise<void>
}

function parseFolderList(payload: unknown): FolderItem[] {
  if (Array.isArray(payload)) return payload

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: FolderItem[] }).data
  }

  return []
}

export function FileStorageMoveDialog({
  open,

  onOpenChange,

  selectedRows,

  onMoved,
}: FileStorageMoveDialogProps) {
  const [folders, setFolders] = useState<FolderItem[]>([])

  const [loadingFolders, setLoadingFolders] = useState(false)

  const [moving, setMoving] = useState(false)

  const [filter, setFilter] = useState("")

  const [destinationRealm, setDestinationRealm] =
    useState<StorageRealm>("images")

  const [selectedPath, setSelectedPath] = useState("")

  const loadFolders = useCallback(async () => {
    setLoadingFolders(true)

    try {
      const list = await fetchStorageFolders()

      setFolders(parseFolderList(list))
    } catch (err) {
      setFolders([])

      toast.error(
        err instanceof Error ? err.message : "Không tải được danh sách thư mục"
      )
    } finally {
      setLoadingFolders(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    setFilter("")

    setSelectedPath("")

    setDestinationRealm("images")

    void loadFolders()
  }, [loadFolders, open])

  const realmFolders = useMemo(
    () => filterFoldersByRealm(folders, destinationRealm),

    [destinationRealm, folders]
  )

  const virtualRoots = useMemo(
    () => buildRealmVirtualRoots(destinationRealm),
    [destinationRealm]
  )

  const handleMove = useCallback(async () => {
    if (!selectedPath.trim()) {
      toast.error("Vui lòng chọn thư mục đích")

      return
    }

    if (!selectedRows.length) return

    setMoving(true)

    const startedAt = Date.now()
    const paths = selectedRows.map((row) => row.relativePath)
    const operationLabel = `File storage — di chuyển ${paths.length} file`
    const pending = toast.loading(
      `Đang di chuyển ${selectedRows.length} file…`,
      storageOperationToastOptions({
        startedAt,
        operationLabel,
        variables: { paths, destination: selectedPath.trim() },
        adminApi: { method: "POST", path: "/admin/uploads/bulk-move" },
      }),
    )

    try {
      const result = await bulkMoveStorageFiles(
        paths,
        selectedPath.trim()
      )

      const parts = [`Đã di chuyển ${result.moved} file`]

      if (result.renamed > 0) {
        parts.push(`${result.renamed} file đổi tên tránh trùng`)
      }

      if (result.skipped > 0) parts.push(`${result.skipped} bỏ qua`)

      toast.success(
        parts.join(" · "),
        storageOperationToastOptions({
          startedAt,
          operationLabel,
          variables: { paths, destination: selectedPath.trim() },
          data: result,
          adminApi: { method: "POST", path: "/admin/uploads/bulk-move" },
          extra: { id: pending },
        }),
      )

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

      await onMoved()

      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Lỗi di chuyển file",
        storageOperationToastOptions({
          startedAt,
          operationLabel,
          variables: { paths, destination: selectedPath.trim() },
          error: err,
          adminApi: { method: "POST", path: "/admin/uploads/bulk-move" },
          extra: { id: pending },
        }),
      )
    } finally {
      setMoving(false)
    }
  }, [onMoved, onOpenChange, selectedPath, selectedRows])

  return (
    <PanelDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<FolderInput />}
      title={`Di chuyển ${selectedRows.length} file`}
      description="Chọn loại lưu trữ và thư mục đích. Hỗ trợ di chuyển giữa images, files, videos và audio."
      footerLeading={
        <PanelDialogDestination
          label="Thư mục đích"
          value={selectedPath || "(chưa chọn)"}
          ready={Boolean(selectedPath.trim())}
        />
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moving}
          >
            Hủy
          </Button>

          <Button
            type="button"
            onClick={() => void handleMove()}
            disabled={moving || !selectedPath.trim()}
          >
            {moving ? <Loader2 className="size-4 animate-spin" /> : null}
            Di chuyển
          </Button>
        </>
      }
    >
      <Tabs
        value={destinationRealm}
        onValueChange={(value) => {
          setDestinationRealm(value as StorageRealm)

          setSelectedPath("")
        }}
      >
        <AdminListTabsList
          wrap
          fullWidth
          className="grid grid-cols-2 sm:grid-cols-4"
        >
          {(Object.keys(REALM_STORAGE_LABELS) as StorageRealm[]).map(
            (realm) => (
              <AdminListTabsTrigger key={realm} value={realm} stretch>
                {REALM_STORAGE_LABELS[realm]}
              </AdminListTabsTrigger>
            )
          )}
        </AdminListTabsList>
      </Tabs>

      <PanelDialogSearch
        id="move-folder-search"
        label="Tìm thư mục đích"
        value={filter}
        onChange={setFilter}
        placeholder="admincp, avatars, docs…"
        disabled={loadingFolders || moving}
      />

      {loadingFolders ? (
        <PanelDialogLoading label="Đang tải cây thư mục…" />
      ) : folders.length === 0 ? (
        <PanelDialogEmpty>
          Không tải được danh sách thư mục. Thử đóng dialog và mở lại.
        </PanelDialogEmpty>
      ) : realmFolders.length === 0 ? (
        <div className="space-y-3">
          <PanelDialogTreePanel heightClassName="h-52">
            <FileStorageFolderTree
              folders={[]}
              filter={filter}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
              disabled={moving}
              virtualRoots={virtualRoots}
            />
          </PanelDialogTreePanel>

          <PanelDialogHint>
            Chưa có thư mục con trong «{REALM_STORAGE_LABELS[destinationRealm]}
            ». Có thể chọn thư mục gốc ở trên.
          </PanelDialogHint>
        </div>
      ) : (
        <PanelDialogTreePanel>
          <FileStorageFolderTree
            folders={folders}
            filter={filter}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
            disabled={moving}
            realm={destinationRealm}
            virtualRoots={virtualRoots}
            autoExpandRoots
          />
        </PanelDialogTreePanel>
      )}
    </PanelDialog>
  )
}
