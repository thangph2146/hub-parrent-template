type FsWindow = Window & {
  showDirectoryPicker?: (options?: {
    mode?: "read" | "readwrite"
  }) => Promise<FileSystemDirectoryHandle>
  showSaveFilePicker?: (options?: {
    suggestedName?: string
    types?: Array<{
      description?: string
      accept: Record<string, string[]>
    }>
  }) => Promise<FileSystemFileHandle>
}

export function supportsExportDirectoryPicker(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as FsWindow).showDirectoryPicker === "function"
  )
}

export async function pickExportDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const picker = (window as FsWindow).showDirectoryPicker
  if (!picker) return null
  try {
    return await picker({ mode: "readwrite" })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null
    }
    throw error
  }
}

export async function writeBlobToDirectory(
  directory: FileSystemDirectoryHandle,
  filename: string,
  blob: Blob
): Promise<void> {
  const fileHandle = await directory.getFileHandle(filename, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(blob)
  await writable.close()
}

function downloadBlobFallback(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

async function saveBlobWithFilePicker(
  blob: Blob,
  filename: string,
  mimeType: string,
  description: string
): Promise<boolean> {
  const picker = (window as FsWindow).showSaveFilePicker
  if (!picker) return false
  try {
    const extension = filename.includes(".")
      ? `.${filename.split(".").pop()}`
      : ""
    const handle = await picker({
      suggestedName: filename,
      types: [
        {
          description,
          accept: { [mimeType]: extension ? [extension] : [] },
        },
      ],
    })
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return false
    }
    throw error
  }
}

/** Ghi file export: ưu tiên thư mục đã chọn, không thì hộp thoại lưu file, cuối cùng tải xuống mặc định. */
export async function saveExportBlob(
  blob: Blob,
  filename: string,
  options: {
    directory: FileSystemDirectoryHandle | null
    mimeType: string
    mimeLabel: string
  }
): Promise<"directory" | "save-picker" | "download" | "cancelled"> {
  if (options.directory) {
    await writeBlobToDirectory(options.directory, filename, blob)
    return "directory"
  }

  const saved = await saveBlobWithFilePicker(
    blob,
    filename,
    options.mimeType,
    options.mimeLabel
  )
  if (saved) return "save-picker"

  downloadBlobFallback(blob, filename)
  return "download"
}
