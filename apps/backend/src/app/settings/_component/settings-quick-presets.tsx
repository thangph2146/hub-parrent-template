"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@ui/components/button"

export type SettingsQuickPresetItem = {
  id: string
  label: string
  hint?: string
}

type SettingsQuickPresetsProps = {
  presets: SettingsQuickPresetItem[]
  onApply: (id: string) => void
  disabled?: boolean
}

export function SettingsQuickPresets({
  presets,
  onApply,
  disabled,
}: SettingsQuickPresetsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" aria-hidden />
        Mẫu nhanh
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
