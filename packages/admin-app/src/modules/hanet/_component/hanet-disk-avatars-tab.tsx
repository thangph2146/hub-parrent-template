"use client"

import { FolderOpen } from "lucide-react"
import { FileStorageScopedBrowse } from "@workspace/admin-app/modules/file-storage/_component/file-storage-scoped-browse"

export function HanetDiskAvatarsTab() {
  return (
    <FileStorageScopedBrowse
      realm="images"
      rootFolderPath="avatars"
      rootFolderLabel="avatars"
      tableScopePrefix="hanet-avatars-disk"
      description={
        <p>
          <FolderOpen className="mr-1 inline size-3.5" />
          Duyệt ảnh trên disk theo folder{" "}
          <code className="text-xs">images/avatars/&#123;MSSV|userId&#125;/</code>{" "}
          — cùng cơ chế với{" "}
          <span className="font-medium text-foreground">Kho lưu trữ</span> (breadcrumb,
          subfolder, upload, xem/xóa file).
        </p>
      }
    />
  )
}
