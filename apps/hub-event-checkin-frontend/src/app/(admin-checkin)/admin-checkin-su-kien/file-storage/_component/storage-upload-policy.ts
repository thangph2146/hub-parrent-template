import type { StorageRealm } from "./types"

export type StorageExtensionGroupId =
  | "image"
  | "document"
  | "archive"
  | "audio"
  | "video"

export type StorageExtensionGroup = {
  id: StorageExtensionGroupId
  label: string
  extensions: readonly string[]
}

export const STORAGE_EXTENSION_GROUPS: StorageExtensionGroup[] = [
  {
    id: "image",
    label: "Ảnh",
    extensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
      ".tif",
      ".tiff",
      ".heic",
      ".heif",
    ],
  },
  {
    id: "document",
    label: "Tài liệu",
    extensions: [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".csv",
      ".rtf",
      ".txt",
      ".ppt",
      ".pptx",
    ],
  },
  {
    id: "archive",
    label: "Tệp nén",
    extensions: [".zip", ".rar", ".7z"],
  },
  {
    id: "audio",
    label: "Âm thanh",
    extensions: [".mp3", ".wav"],
  },
  {
    id: "video",
    label: "Video",
    extensions: [".mp4", ".mov", ".avi", ".m4v", ".webm"],
  },
]

export const REALM_EXTENSION_GROUP_IDS: Record<
  StorageRealm,
  StorageExtensionGroupId[]
> = {
  images: ["image"],
  files: ["document", "archive"],
  videos: ["video"],
  audio: ["audio"],
}

export function getRealmDefaultGroupIds(
  realm: StorageRealm
): StorageExtensionGroupId[] {
  return [...(REALM_EXTENSION_GROUP_IDS[realm] ?? [])]
}

export function normalizeExtension(ext: string): string {
  const raw = ext.trim().toLowerCase()
  if (!raw) return ""
  return raw.startsWith(".") ? raw : `.${raw}`
}

export function normalizeExtensions(extensions: string[]): string[] {
  return [
    ...new Set(
      extensions.map(normalizeExtension).filter((ext) => ext.length > 1)
    ),
  ].sort()
}

export function getRealmDefaultExtensions(realm: StorageRealm): string[] {
  const groups = REALM_EXTENSION_GROUP_IDS[realm] ?? []
  const exts = groups.flatMap((groupId) => {
    const group = STORAGE_EXTENSION_GROUPS.find((g) => g.id === groupId)
    return group?.extensions ?? []
  })
  return normalizeExtensions(exts)
}

export function extensionsFromGroupIds(
  realm: StorageRealm,
  groupIds: StorageExtensionGroupId[]
): string[] {
  const allowedGroupIds = new Set(REALM_EXTENSION_GROUP_IDS[realm] ?? [])
  const exts = groupIds
    .filter((id) => allowedGroupIds.has(id))
    .flatMap((id) => {
      const group = STORAGE_EXTENSION_GROUPS.find((g) => g.id === id)
      return group?.extensions ?? []
    })
  const normalized = normalizeExtensions(exts)
  return normalized.length > 0 ? normalized : getRealmDefaultExtensions(realm)
}

export function buildAcceptAttribute(extensions: string[]): string {
  const mimeHints = new Set<string>()
  for (const ext of extensions) {
    if (ext === ".jpg" || ext === ".jpeg") mimeHints.add("image/jpeg")
    else if (ext === ".png") mimeHints.add("image/png")
    else if (ext === ".gif") mimeHints.add("image/gif")
    else if (ext === ".webp") mimeHints.add("image/webp")
    else if (ext === ".svg") mimeHints.add("image/svg+xml")
    else if (ext === ".pdf") mimeHints.add("application/pdf")
    else if (ext === ".mp4") mimeHints.add("video/mp4")
    else if (ext === ".webm") mimeHints.add("video/webm")
    else if (ext === ".mp3") mimeHints.add("audio/mpeg")
    else if (ext === ".wav") mimeHints.add("audio/wav")
  }
  if (
    extensions.every((ext) =>
      [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".bmp",
        ".tif",
        ".tiff",
        ".heic",
        ".heif",
      ].includes(ext)
    )
  ) {
    mimeHints.add("image/*")
  }
  if (
    extensions.every((ext) =>
      [".mp4", ".mov", ".avi", ".m4v", ".webm"].includes(ext)
    )
  ) {
    mimeHints.add("video/*")
  }
  if (extensions.every((ext) => [".mp3", ".wav"].includes(ext))) {
    mimeHints.add("audio/*")
  }
  return [...mimeHints, ...extensions].join(",")
}

export function formatExtensionsSummary(extensions: string[]): string {
  const normalized = normalizeExtensions(extensions)
  if (!normalized.length) return ""
  if (normalized.length <= 6) return normalized.join(", ")
  return `${normalized.slice(0, 6).join(", ")} +${normalized.length - 6}`
}

export function getRealmExtensionGroups(
  realm: StorageRealm
): StorageExtensionGroup[] {
  const ids = new Set(REALM_EXTENSION_GROUP_IDS[realm] ?? [])
  return STORAGE_EXTENSION_GROUPS.filter((group) => ids.has(group.id))
}

export function findInheritedFolderExtensions(
  folders: Array<{ path: string; allowedExtensions?: string[] }>,
  diskPath: string
): string[] | undefined {
  let current = diskPath.replace(/\\/g, "/").replace(/\/$/, "")
  while (current) {
    const folder = folders.find((item) => item.path === current)
    if (folder?.allowedExtensions?.length) {
      return folder.allowedExtensions
    }
    const slash = current.lastIndexOf("/")
    current = slash > 0 ? current.slice(0, slash) : ""
  }
  return undefined
}
