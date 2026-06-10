"use client"

import dynamic from "next/dynamic"
import { FileText } from "lucide-react"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { AdminEmptyState } from "@ui/components/admin"
import { resolveEventDetailContent } from "./utils"

const LexicalEditor = dynamic(
  () =>
    import("@thangph2146/lexical-editor").then((mod) => ({
      default: mod.LexicalEditor,
    })),
  { ssr: false }
)

type EventDetailContentPanelProps = {
  content: unknown
  description?: string | null
}

export function EventDetailContentPanel({
  content,
  description,
}: EventDetailContentPanelProps) {
  const display = resolveEventDetailContent(content, description)

  if (display.kind === "lexical") {
    return (
      <FieldSet variant="section">
        <FieldSectionLegend icon={FileText} title="Nội dung chi tiết" />
        <FieldSetContent variant="section" className="pt-0">
          <LexicalEditor
            value={display.value}
            readOnly
            className="mx-auto max-w-4xl"
          />
        </FieldSetContent>
      </FieldSet>
    )
  }

  if (display.kind === "description") {
    return (
      <FieldSet variant="section">
        <FieldSectionLegend icon={FileText} title="Nội dung chi tiết" />
        <FieldSetContent variant="section" className="pt-0">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {display.text}
          </p>
        </FieldSetContent>
      </FieldSet>
    )
  }

  return (
    <AdminEmptyState
      title="Chưa có nội dung chi tiết"
      description="Thêm nội dung Lexical khi chỉnh sửa sự kiện, hoặc điền mô tả ngắn để hiển thị tại đây."
    />
  )
}
