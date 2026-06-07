"use client"

import { Sparkles } from "lucide-react"
import { Button } from "../../button"

export type AdminQuickPresetItem = {
  id: string
  label: string
  hint?: string
}

type AdminQuickPresetsProps = {
  presets: AdminQuickPresetItem[]
  onApply: (id: string) => void
  disabled?: boolean
  label?: string
}

export function AdminQuickPresets({
  presets,
  onApply,
  disabled,
  label = "Mẫu nhanh",
}: AdminQuickPresetsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" aria-hidden />
        {label}
      </span>
      {presets.map((preset) => (
        <Button
          key={preset.id}
          type="button"
          variant="outline"
          size="sm"
          className="h-7 rounded-md px-2.5 text-xs"
          title={preset.hint}
          disabled={disabled}
          onClick={() => onApply(preset.id)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  )
}
