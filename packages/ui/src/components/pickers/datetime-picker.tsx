"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarClock } from "lucide-react"
import { Button } from "../button"
import { Calendar } from "../calendar"
import { Input } from "../input"
import { Label } from "../label"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import {
  pickerTriggerClassName,
  type PickerSize,
} from "./picker-trigger-styles"
import { parseIsoDateString } from "./date-picker"

export interface DateTimePickerProps {
  value: unknown
  onChange: (value: unknown) => void
  placeholder?: string
  id?: string
  fromYear?: number
  toYear?: number
  size?: PickerSize
  className?: string
  disabled?: boolean
  /** Mặc định `true`. */
  allowClear?: boolean
}

function formatIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function getDefaultYearBounds() {
  const currentYear = new Date().getFullYear()
  return { fromYear: currentYear - 50, toYear: currentYear + 20 }
}

/** Parse `YYYY-MM-DDTHH:mm` theo giờ local. */
export function parseDatetimeLocalString(value: string): {
  date?: Date
  time: string
} {
  const trimmed = value.trim()
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(trimmed)
  if (match) {
    const date = parseIsoDateString(match[1]!)
    const time = `${match[2]}:${match[3]}`
    return { date, time }
  }
  return { time: "00:00" }
}

export function formatDatetimeLocalString(date: Date, time: string): string {
  const [hour = "00", minute = "00"] = time.split(":")
  const h = String(Number.parseInt(hour, 10) || 0).padStart(2, "0")
  const m = String(Number.parseInt(minute, 10) || 0).padStart(2, "0")
  return `${formatIsoDate(date)}T${h}:${m}`
}

function formatDisplayLabel(value: string, placeholder: string): string {
  const { date, time } = parseDatetimeLocalString(value)
  if (!date || Number.isNaN(date.getTime())) return placeholder
  const [hour, minute] = time.split(":")
  const dateLabel = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  return `${dateLabel} ${hour}:${minute}`
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày giờ",
  id,
  fromYear,
  toYear,
  size = "default",
  className,
  disabled = false,
  allowClear = true,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const stringValue = typeof value === "string" ? value.trim() : ""

  const parsed = useMemo(
    () => parseDatetimeLocalString(stringValue),
    [stringValue]
  )

  const [draftDate, setDraftDate] = useState<Date | undefined>(parsed.date)
  const [draftTime, setDraftTime] = useState(parsed.time)
  const [month, setMonth] = useState<Date>(() => parsed.date ?? new Date())

  const { startMonth, endMonth } = useMemo(() => {
    const bounds = getDefaultYearBounds()
    const minYear = fromYear ?? bounds.fromYear
    const maxYear = toYear ?? bounds.toYear
    return {
      startMonth: new Date(minYear, 0),
      endMonth: new Date(maxYear, 11),
    }
  }, [fromYear, toYear])

  useEffect(() => {
    if (!open) {
      setDraftDate(parsed.date)
      setDraftTime(parsed.time)
      if (parsed.date) setMonth(parsed.date)
    }
  }, [open, parsed.date, parsed.time])

  const displayLabel = stringValue
    ? formatDisplayLabel(stringValue, placeholder)
    : placeholder

  const commitDraft = (date: Date | undefined, time: string) => {
    if (!date || Number.isNaN(date.getTime())) {
      onChange(undefined)
      return
    }
    onChange(formatDatetimeLocalString(date, time))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          className={pickerTriggerClassName(size, className)}
        >
          <span className="truncate">{displayLabel}</span>
          <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 shrink-0">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              startMonth={startMonth}
              endMonth={endMonth}
              selected={draftDate}
              onSelect={(date) => {
                setDraftDate(date)
                if (date) setMonth(date)
              }}
              initialFocus
            />
          </div>
          <div className="flex min-w-[7.5rem] flex-col justify-between gap-3 border-border sm:border-l sm:pl-3">
            <div className="space-y-1">
              <Label
                htmlFor={id ? `${id}-time` : undefined}
                className="text-xs"
              >
                Giờ
              </Label>
              <Input
                id={id ? `${id}-time` : undefined}
                type="time"
                value={draftTime}
                onChange={(event) =>
                  setDraftTime(event.target.value || "00:00")
                }
                className="h-8"
              />
            </div>
            <div className="flex flex-col gap-2">
              {allowClear ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full text-xs"
                  onClick={() => {
                    setDraftDate(undefined)
                    setDraftTime("00:00")
                    onChange(undefined)
                    setOpen(false)
                  }}
                >
                  Xóa
                </Button>
              ) : null}
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 w-full text-xs"
                disabled={!draftDate}
                onClick={() => {
                  commitDraft(draftDate, draftTime)
                  setOpen(false)
                }}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
