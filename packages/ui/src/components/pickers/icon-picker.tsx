"use client"

import { useState, useMemo, createElement } from "react"
import { Search, Check, ChevronDown } from "lucide-react"
import { Button } from "../button"
import { Input } from "../input"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { ICON_NAMES, resolveIcon } from "../../lib/icons"
import { cn } from "../../lib/utils"

function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null
  return createElement(resolveIcon(name), { className })
}

export interface IconPickerProps {
  value: unknown
  onChange: (value: unknown) => void
  placeholder?: string
  id?: string
}

export function IconPicker({
  value,
  onChange,
  placeholder = "Chọn biểu tượng",
  id,
}: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selected = typeof value === "string" && value ? value : ""

  const filtered = useMemo(() => {
    if (!search.trim()) return ICON_NAMES
    const q = search.trim().toLowerCase()
    return ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
  }, [search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          type="button"
          variant="outline"
          id={id}
          className="h-9 w-full min-w-[160px] justify-between rounded-lg text-sm font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            <DynamicIcon name={selected} className="size-4 shrink-0" />
            {selected || placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm biểu tượng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
            autoFocus
          />
        </div>
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Không tìm thấy biểu tượng
          </p>
        ) : (
          <div className="grid grid-cols-6 gap-1 max-h-[min(60vh,18rem)] overflow-y-auto">
            {filtered.map((name) => {
              const Icon = resolveIcon(name)
              const isSelected = selected === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md p-2 text-xs transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                  title={name}
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="truncate w-full text-center leading-tight">
                    {name}
                  </span>
                  {isSelected && (
                    <Check className="size-3 shrink-0 absolute top-0.5 right-0.5" />
                  )}
                </button>
              )
            })}
          </div>
        )}
        {filtered.length > 48 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Hiển thị {filtered.length} biểu tượng
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
