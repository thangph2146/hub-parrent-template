"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@ui/components/button"
import {
  PanelDialog,
  PanelDialogDestination,
  PanelDialogLoading,
  PanelDialogSearch,
  PanelDialogTreePanel,
} from "@ui/components/dialogs"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { toast } from "@ui/components/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs"
import {
  createStorageFolder,
  fetchStorageFolders,
  type FolderItem,
} from "@workspace/admin-app/lib/admin-uploads"
import { uploadAdminImage } from "@workspace/admin-app/lib/admin-upload"
import { FolderOpen, FolderPlus, Loader2, Upload } from "lucide-react"
import { FileStorageAllowedExtensionsPicker } from "./file-storage-allowed-extensions-picker"
import {
  FileStorageFolderTree,
  STORAGE_ROOT_AUDIO,
  STORAGE_ROOT_FILES,
  STORAGE_ROOT_IMAGES,
  STORAGE_ROOT_VIDEOS,
} from "./file-storage-folder-tree"
import {
  buildAcceptAttribute,
  extensionsFromGroupIds,
  findInheritedFolderExtensions,
  formatExtensionsSummary,
  getRealmDefaultExtensions,
  getRealmDefaultGroupIds,
  type StorageExtensionGroupId,
} from "./storage-upload-policy"
import type { StorageRealm } from "./types"
import {
  buildRealmVirtualRoots,
  inferFolderResourceType,
  resolveDefaultFolderPath,
} from "./utils"

function isVirtualStorageRoot(parentPath: string): boolean {
  return (
    parentPath === STORAGE_ROOT_IMAGES ||
    parentPath === STORAGE_ROOT_FILES ||
    parentPath === STORAGE_ROOT_VIDEOS ||
    parentPath === STORAGE_ROOT_AUDIO
  )
}

function realmFromVirtualRoot(parentPath: string): StorageRealm {
  if (parentPath === STORAGE_ROOT_FILES) return "files"
  if (parentPath === STORAGE_ROOT_VIDEOS) return "videos"
  if (parentPath === STORAGE_ROOT_AUDIO) return "audio"
  return "images"
}

type FileStorageUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeRealm: StorageRealm
  activeFolderPath: string
  activeTabLabel?: string
  uploadAccept: string
  onUploaded: () => Promise<void>
  onUploadingChange?: (uploading: boolean) => void
}

export function FileStorageUploadDialog({
  open,
  onOpenChange,
  activeRealm,
  activeFolderPath,
  activeTabLabel,
  uploadAccept,
  onUploaded,
  onUploadingChange,
}: FileStorageUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [folderMode, setFolderMode] = useState<"existing" | "new">("existing")
  const [selectedPath, setSelectedPath] = useState("")
  const [folderFilter, setFolderFilter] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [newParentPath, setNewParentPath] = useState(STORAGE_ROOT_IMAGES)
  const [newFolderExtensionGroups, setNewFolderExtensionGroups] = useState<
    StorageExtensionGroupId[]
  >(() => getRealmDefaultGroupIds(activeRealm))
  const [uploading, setUploading] = useState(false)

  const realmVirtualRoots = useMemo(
    () => buildRealmVirtualRoots(activeRealm),
    [activeRealm]
  )

  const loadFolders = useCallback(async () => {
    setLoadingFolders(true)
    try {
      const list = await fetchStorageFolders()
      setFolders(list)
      const defaultPath = resolveDefaultFolderPath(
        list,
        activeRealm,
        activeFolderPath
      )
      setSelectedPath(defaultPath)
      const defaultParent =
        activeRealm === "files"
          ? STORAGE_ROOT_FILES
          : activeRealm === "videos"
            ? STORAGE_ROOT_VIDEOS
            : activeRealm === "audio"
              ? STORAGE_ROOT_AUDIO
              : defaultPath || STORAGE_ROOT_IMAGES
      setNewParentPath(
        defaultParent === "files"
          ? STORAGE_ROOT_FILES
          : defaultParent === "videos"
            ? STORAGE_ROOT_VIDEOS
            : defaultParent === "audio"
              ? STORAGE_ROOT_AUDIO
              : defaultParent || STORAGE_ROOT_IMAGES
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không tải được danh sách thư mục"
      )
    } finally {
      setLoadingFolders(false)
    }
  }, [activeFolderPath, activeRealm])

  useEffect(() => {
    if (!open) return
    setFolderMode("existing")
    setNewFolderName("")
    setFolderFilter("")
    setNewFolderExtensionGroups(getRealmDefaultGroupIds(activeRealm))
    void loadFolders()
  }, [activeRealm, open, loadFolders])

  const effectiveAccept = useMemo(() => {
    if (folderMode === "existing" && selectedPath.trim()) {
      const inherited = findInheritedFolderExtensions(folders, selectedPath)
      if (inherited?.length) return buildAcceptAttribute(inherited)
      return buildAcceptAttribute(
        getRealmDefaultExtensions(inferFolderResourceType(selectedPath))
      )
    }
    if (folderMode === "new") {
      if (isVirtualStorageRoot(newParentPath)) {
        const realm = realmFromVirtualRoot(newParentPath)
        return buildAcceptAttribute(
          extensionsFromGroupIds(realm, newFolderExtensionGroups)
        )
      }
      const inherited = findInheritedFolderExtensions(folders, newParentPath)
      if (inherited?.length) return buildAcceptAttribute(inherited)
      return buildAcceptAttribute(
        getRealmDefaultExtensions(inferFolderResourceType(newParentPath))
      )
    }
    return uploadAccept
  }, [
    folderMode,
    folders,
    newFolderExtensionGroups,
    newParentPath,
    selectedPath,
    uploadAccept,
  ])

  const allowedTypesHint = useMemo(() => {
    const exts = effectiveAccept
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.startsWith("."))
    return formatExtensionsSummary(
      exts.length ? exts : getRealmDefaultExtensions(activeRealm)
    )
  }, [activeRealm, effectiveAccept])

  const destinationPreview = useMemo(() => {
    if (folderMode === "existing") {
      return selectedPath || "(chưa chọn thư mục)"
    }
    const name = newFolderName.trim()
    if (!name) return "(nhập tên thư mục mới)"
    if (newParentPath === STORAGE_ROOT_IMAGES) return name
    if (newParentPath === STORAGE_ROOT_FILES) return `files/${name}`
    if (newParentPath === STORAGE_ROOT_VIDEOS) return `videos/${name}`
    if (newParentPath === STORAGE_ROOT_AUDIO) return `audio/${name}`
    return `${newParentPath.replace(/\/$/, "")}/${name}`
  }, [folderMode, newFolderName, newParentPath, selectedPath])

  const destinationReady = useMemo(() => {
    if (folderMode === "existing") return Boolean(selectedPath.trim())
    return Boolean(newFolderName.trim())
  }, [folderMode, newFolderName, selectedPath])

  const resolveUploadFolder = useCallback(async (): Promise<{
    folderPath: string
    isExistingFolder: boolean
  }> => {
    if (folderMode === "existing") {
      if (!selectedPath.trim()) {
        throw new Error("Vui lòng chọn thư mục đích")
      }
      return { folderPath: selectedPath.trim(), isExistingFolder: true }
    }

    const name = newFolderName.trim()
    if (!name) {
      throw new Error("Vui lòng nhập tên thư mục mới")
    }

    let parentPath: string | undefined
    let resourceType: "images" | "files" | "videos" | "audio" = "images"
    if (newParentPath === STORAGE_ROOT_FILES) {
      resourceType = "files"
      parentPath = undefined
    } else if (newParentPath === STORAGE_ROOT_VIDEOS) {
      resourceType = "videos"
      parentPath = undefined
    } else if (newParentPath === STORAGE_ROOT_AUDIO) {
      resourceType = "audio"
      parentPath = undefined
    } else if (newParentPath === STORAGE_ROOT_IMAGES) {
      resourceType = "images"
      parentPath = undefined
    } else {
      parentPath = newParentPath
      resourceType = inferFolderResourceType(newParentPath)
    }

    const created = await createStorageFolder({
      folderName: name,
      parentPath,
      resourceType,
      allowedExtensions: isVirtualStorageRoot(newParentPath)
        ? extensionsFromGroupIds(resourceType, newFolderExtensionGroups)
        : undefined,
    })
    return {
      folderPath: created.folderPath,
      isExistingFolder: true,
    }
  }, [
    folderMode,
    newFolderExtensionGroups,
    newFolderName,
    newParentPath,
    selectedPath,
  ])

  const runUpload = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      setUploading(true)
      onUploadingChange?.(true)
      const pending = toast.loading(`Đang tải lên ${files.length} file…`)
      try {
        const { folderPath, isExistingFolder } = await resolveUploadFolder()
        let success = 0
        let fail = 0
        for (const file of files) {
          try {
            await uploadAdminImage(file, { folderPath, isExistingFolder })
            success++
          } catch {
            fail++
          }
        }
        if (success > 0) {
          toast.success(`Đã lưu ${success} file vào «${folderPath}»`, {
            id: pending,
          })
        }
        if (fail > 0) {
          toast.error(`${fail} file tải lên thất bại`, { id: pending })
        }
        await onUploaded()
        onOpenChange(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi tải lên", {
          id: pending,
        })
      } finally {
        setUploading(false)
        onUploadingChange?.(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    },
    [onOpenChange, onUploaded, onUploadingChange, resolveUploadFolder]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      void runUpload(files)
    },
    [runUpload]
  )

  return (
    <PanelDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      icon={<Upload />}
      title="Tải file lên kho"
      description={
        <>
          Chọn thư mục có sẵn hoặc tạo thư mục mới trước khi lưu file
          {activeTabLabel ? ` (tab «${activeTabLabel}»)` : ""}. Định dạng cho
          phép: {allowedTypesHint}.
        </>
      }
      footerLeading={
        <PanelDialogDestination
          label="Đích lưu"
          value={destinationPreview}
          ready={destinationReady}
        />
      }
      footer={
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={effectiveAccept}
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loadingFolders || !destinationReady}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {uploading ? "Đang tải lên…" : "Chọn file và tải lên"}
          </Button>
        </>
      }
    >
      <Tabs
        value={folderMode}
        onValueChange={(v) => setFolderMode(v === "new" ? "new" : "existing")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" className="gap-1.5">
            <FolderOpen className="size-4" />
            Thư mục có sẵn
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-1.5">
            <FolderPlus className="size-4" />
            Tạo mới
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="mt-4 space-y-3">
          <PanelDialogSearch
            id="folder-search"
            label="Tìm trong cây thư mục"
            value={folderFilter}
            onChange={setFolderFilter}
            placeholder="avatars, admincp, 2026…"
            disabled={loadingFolders || uploading}
          />

          {loadingFolders ? (
            <PanelDialogLoading label="Đang tải cây thư mục…" />
          ) : (
            <PanelDialogTreePanel>
              <FileStorageFolderTree
                folders={folders}
                filter={folderFilter}
                selectedPath={selectedPath}
                onSelect={setSelectedPath}
                disabled={uploading}
                realm={activeRealm}
                virtualRoots={realmVirtualRoots}
                autoExpandRoots
              />
            </PanelDialogTreePanel>
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Thư mục cha (cây thư mục)</Label>
            <PanelDialogSearch
              id="new-folder-parent-search"
              value={folderFilter}
              onChange={setFolderFilter}
              placeholder="Lọc cây thư mục cha…"
              disabled={loadingFolders || uploading}
            />
            <PanelDialogTreePanel heightClassName="h-44">
              <FileStorageFolderTree
                folders={folders}
                filter={folderFilter}
                selectedPath={newParentPath}
                onSelect={setNewParentPath}
                disabled={uploading || loadingFolders}
                showVirtualRoots
              />
            </PanelDialogTreePanel>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-folder-name">Tên thư mục mới</Label>
            <Input
              id="new-folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="vd. buh_slidehome, 2026/06"
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Ký tự đặc biệt sẽ được chuyển thành dấu gạch dưới trên server.
            </p>
          </div>
          {isVirtualStorageRoot(newParentPath) ? (
            <FileStorageAllowedExtensionsPicker
              realm={realmFromVirtualRoot(newParentPath)}
              value={newFolderExtensionGroups}
              onChange={setNewFolderExtensionGroups}
              disabled={uploading}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </PanelDialog>
  )
}
