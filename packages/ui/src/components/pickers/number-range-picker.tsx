"use client"

import { useEffect, useState } from "react"
import { Input } from "../input"
import { cn } from "../../lib/utils"
import { pickerTriggerClassName, type PickerSize } from "./picker-trigger-styles"

export interface NumberRangePickerProps {
  value: unknown
  onChange: (value: unknown) => void
  placeholder?: string
  id?: string
  size?: PickerSize
  className?: string
  minPlaceholder?: string
  maxPlaceholder?: string
}

function parseNumberRangeValue(value: unknown): { min: string; max: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { min: "", max: "" }
  }
  const [min = "", max = ""] = value.split(",")
  return { min: min.trim(), max: max.trim() }
}

function serializeRange(min: string, max: string): string | undefined {
  const a = min.trim()
  const b = max.trim()
  if (!a && !b) return undefined
  return `${a},${b}`
}

export function NumberRangePicker({
  value,
  onChange,
  id,
  size = "sm",
  className,
  minPlaceholder = "Từ",
  maxPlaceholder = "Đến",
}: NumberRangePickerProps) {
  const parsed = parseNumberRangeValue(value)
  const [min, setMin] = useState(parsed.min)
  const [max, setMax] = useState(parsed.max)

  useEffect(() => {
    const next = parseNumberRangeValue(value)
    setMin(next.min)
    setMax(next.max)
  }, [value])

  const commit = (nextMin: string, nextMax: string) => {
    onChange(serializeRange(nextMin, nextMax))
  }

  return (
    <div
      id={id}
      className={cn(
        "flex min-w-0 items-center gap-1",
        pickerTriggerClassName(size, "w-full min-w-[9.5rem]"),
        className
      )}
    >
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        value={min}
        placeholder={minPlaceholder}
        className="h-7 min-w-0 flex-1 px-2 text-xs"
        onChange={(e) => {
          const next = e.target.value
          setMin(next)
          commit(next, max)
        }}
      />
      <span className="shrink-0 text-xs text-muted-foreground">–</span>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        value={max}
        placeholder={maxPlaceholder}
        className="h-7 min-w-0 flex-1 px-2 text-xs"
        onChange={(e) => {
          const next = e.target.value
          setMax(next)
          commit(min, next)
        }}
      />
    </div>
  )
}
