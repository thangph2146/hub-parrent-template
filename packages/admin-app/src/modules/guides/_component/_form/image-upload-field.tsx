"use client"

import { useState, useRef } from "react"
import { toast } from "@ui/components/sonner"
import { Loader2, ImagePlus, X } from "lucide-react"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { uploadAdminImage } from "@workspace/admin-app/lib/admin-upload"
import { useAdminApi } from "@workspace/admin-app/runtime"

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const api = useAdminApi()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadAdminImage(api, file, { folderPath: "guides" })
      onChange(url)
    } catch {
      toast.error("Upload ảnh thất bại")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label>Hình ảnh minh họa</Label>
      {value ? (
        <div className="relative w-full overflow-hidden rounded-lg border">
          <img src={value} alt="" className="h-80 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang tải…
            </>
          ) : (
            <>
              <ImagePlus className="size-4" />
              Chọn ảnh
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void handleFile(f)
          e.target.value = ""
        }}
      />
      {value && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL ảnh"
          className="h-7 font-mono text-xs"
        />
      )}
    </div>
  )
}
