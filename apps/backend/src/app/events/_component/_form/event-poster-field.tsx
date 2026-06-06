"use client";

import { useRef, useState } from "react";
import { ImageIcon, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "@ui/components/sonner";
import { Input } from "@ui/components/input";
import { FormFieldCol } from "@ui/components/typing";
import { uploadEventPoster } from "../utils";

type EventPosterFieldProps = {
  value: string;
  onChange: (url: string) => void;
  eventTitle?: string;
};

/**
 * Giống guides/ImageUploadField + posts preview: URL từ API (3002), không proxy qua admin (3001).
 */
export function EventPosterField({ value, onChange, eventTitle }: EventPosterFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const displayUrl = value.trim();

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadEventPoster(file);
      onChange(url);
      toast.success("Đã tải poster lên");
    } catch { /* toast: MutationCache */ } finally {
      setUploading(false);
    }
  };

  return (
    <FormFieldCol label="Hình đại diện (poster)">
      <div className="space-y-3">
        {displayUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-border bg-muted/20">
            <img
              src={displayUrl}
              alt={eventTitle?.trim() || "Poster sự kiện"}
              className="aspect-[16/10] w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Xóa poster"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="size-6 animate-spin" />
                Đang tải poster…
              </>
            ) : (
              <>
                <ImagePlus className="size-6" />
                Chọn ảnh poster (16:10)
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
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex items-start gap-2 rounded-lg border border-dashed border-border/70 bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
          <ImageIcon className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Upload qua API (port 3002). URL hiển thị trực tiếp — cùng cách với ảnh bài viết / hướng dẫn.
          </span>
        </div>
        <Input
          value={displayUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... hoặc upload ở trên"
          className="font-mono text-xs"
        />
      </div>
    </FormFieldCol>
  );
}
