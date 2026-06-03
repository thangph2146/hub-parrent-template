"use client"

import { createElement } from "react"
import { ImageIcon } from "lucide-react"
import { IconPicker } from "./icon-picker"
import { resolveIcon } from "../../lib/icons"

export interface IconPickerFieldProps {
  value: unknown
  onChange: (value: unknown) => void
  placeholder?: string
}

export function IconPickerField({
  value,
  onChange,
  placeholder,
}: IconPickerFieldProps) {
  const IconComp = typeof value === "string" && value ? resolveIcon(value) : null

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
        {IconComp ? (
          createElement(IconComp, { className: "size-5 text-primary" })
        ) : (
          <ImageIcon className="size-5 text-muted-foreground/50" />
        )}
      </div>
      <div className="flex-1">
        <IconPicker
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
