"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "../button"
import { Calendar } from "../calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import {
  pickerTriggerClassName,
  type PickerSize,
} from "./picker-trigger-styles"

export interface DatePickerProps {
  value: unknown
  onChange: (value: unknown) => void
  placeholder?: string
  id?: string
  /** Năm sớm nhất trong dropdown (mặc định: năm hiện tại − 50). */
  fromYear?: number
  /** Năm muộn nhất trong dropdown (mặc định: năm hiện tại + 20). */
  toYear?: number
  size?: PickerSize
  className?: string
}

function formatIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Parse YYYY-MM-DD theo giờ local, tránh lệch ngày do UTC. */
export function parseIsoDateString(value: string): Date | undefined {
  const trimmed = value.trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const date = new Date(year, month - 1, day)
    return Number.isNaN(date.getTime()) ? undefined : date
  }
  const fallback = new Date(trimmed)
  return Number.isNaN(fallback.getTime()) ? undefined : fallback
}

function getDefaultYearBounds() {
  const currentYear = new Date().getFullYear()
  return { fromYear: currentYear - 50, toYear: currentYear + 20 }
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Tất cả",
  id,
  fromYear,
  toYear,
  size = "default",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const { startMonth, endMonth } = useMemo(() => {
    const bounds = getDefaultYearBounds()
    const minYear = fromYear ?? bounds.fromYear
    const maxYear = toYear ?? bounds.toYear
    return {
      startMonth: new Date(minYear, 0),
      endMonth: new Date(maxYear, 11),
    }
  }, [fromYear, toYear])

  const dateValue =
    typeof value === "string" && value ? parseIsoDateString(value) : undefined

  const [month, setMonth] = useState<Date>(() => dateValue ?? new Date())

  useEffect(() => {
    if (dateValue) setMonth(dateValue)
  }, [value])

  const displayLabel =
    dateValue && !Number.isNaN(dateValue.getTime())
      ? dateValue.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          type="button"
          variant="outline"
          id={id}
          className={pickerTriggerClassName(size, className)}
        >
          <span className="truncate">{displayLabel}</span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          month={month}
          onMonthChange={setMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          selected={dateValue}
          onSelect={(date) => {
            onChange(date ? formatIsoDate(date) : undefined)
            if (date) setOpen(false)
          }}
          initialFocus
        />
        {dateValue && (
          <div className="mt-2 border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full text-xs"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
            >
              Xóa ngày
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
