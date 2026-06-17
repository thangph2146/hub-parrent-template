"use client"

import { useEffect, useState } from "react"
import {
  Check,
  ChevronDown,
  Columns3,
  FileText,
  Folder,
  ListChecks,
  ListX,
  X,
} from "lucide-react"
import { Button } from "../button"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { cn } from "../../lib/utils"
import {
  pickerListOptionLabelClassName,
  pickerListPopoverClassName,
  pickerTriggerClassName,
  type PickerSize,
} from "./picker-trigger-styles"

export interface TreeOption {
  value: string
  label: string
  children?: TreeOption[]
}

export interface TreeMultiSelectPickerProps {
  value: unknown
  onChange: (value: unknown) => void
  options: TreeOption[]
  placeholder?: string
  id?: string
  /** Hiện nút chọn/bỏ chọn tất cả trong popover */
  showBulkActions?: boolean
  size?: PickerSize
  className?: string
}

function flattenTreeOptions(
  nodes: TreeOption[]
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = []
  for (const node of nodes) {
    result.push({ value: node.value, label: node.label })
    if (node.children?.length) {
      result.push(...flattenTreeOptions(node.children))
    }
  }
  return result
}

function TreeMultiSelectItem({
  label,
  value,
  depth,
  isParent,
  selected,
  onSelect,
}: {
  label: string
  value: string
  depth: number
  isParent: boolean
  selected: string[]
  onSelect: (value: string) => void
}) {
  const isSelected = selected.includes(value)
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm",
        isSelected && "bg-primary/10 font-medium text-primary",
        !isSelected && "cursor-pointer hover:bg-muted"
      )}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
    >
      {isParent ? (
        <Folder className="size-4 shrink-0 text-amber-500" />
      ) : (
        <FileText className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span className={pickerListOptionLabelClassName}>{label}</span>
      {isSelected && <Check className="size-4 shrink-0" />}
    </button>
  )
}

function TreeMultiSelectNode({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: TreeOption
  depth: number
  selected: string[]
  onSelect: (value: string) => void
}) {
  const isParent = (node.children?.length ?? 0) > 0
  return (
    <div>
      <TreeMultiSelectItem
        label={node.label}
        value={node.value}
        depth={depth}
        isParent={isParent}
        selected={selected}
        onSelect={onSelect}
      />
      {node.children?.map((child) => (
        <TreeMultiSelectNode
          key={child.value}
          node={child}
          depth={depth + 1}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export function TreeMultiSelectPicker({
  value,
  onChange,
  options,
  placeholder = "Tất cả",
  id,
  showBulkActions = false,
  size = "default",
  className,
}: TreeMultiSelectPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = Array.isArray(value) ? (value as string[]) : []
  const [draft, setDraft] = useState<string[]>(selected)
  const flatOptions = flattenTreeOptions(options)
  const allValues = flatOptions.map((option) => option.value)

  useEffect(() => {
    if (!open) {
      setDraft(selected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (flatOptions.find((o) => o.value === selected[0])?.label ??
          `${selected.length} đã chọn`)
        : `${selected.length} đã chọn`

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setDraft(selected)
    }
  }

  const handleSelect = (v: string) => {
    if (!v) {
      setDraft([])
      return
    }
    setDraft((prev) =>
      prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]
    )
  }

  const handleApply = () => {
    const next = draft.filter(Boolean)
    onChange(showBulkActions ? next : next.length ? next : undefined)
    setOpen(false)
  }

  const handleClear = () => {
    setDraft([])
    onChange(showBulkActions ? [] : undefined)
    setOpen(false)
  }

  const handleSelectAllDraft = () => {
    setDraft(allValues)
  }

  const handleClearDraft = () => {
    setDraft([])
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <Button
          type="button"
          variant="outline"
          id={id}
          className={pickerTriggerClassName(size, className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {showBulkActions ? (
              <Columns3
                className="size-4 shrink-0 text-primary/80"
                aria-hidden
              />
            ) : null}
            <span className="truncate">{triggerLabel}</span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={pickerListPopoverClassName()} align="start">
        {options.length === 0 ? (
          <p className="px-2 py-1 text-sm text-muted-foreground">
            Không có tùy chọn
          </p>
        ) : (
          <>
            {showBulkActions && allValues.length > 0 ? (
              <div className="mb-2 flex gap-2 border-b pb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 flex-1 gap-1.5 text-xs"
                  onClick={handleSelectAllDraft}
                >
                  <ListChecks className="size-3.5 shrink-0" aria-hidden />
                  Chọn tất cả
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 flex-1 gap-1.5 text-xs"
                  onClick={handleClearDraft}
                >
                  <ListX className="size-3.5 shrink-0" aria-hidden />
                  Bỏ chọn tất cả
                </Button>
              </div>
            ) : null}
            <div className="max-h-[min(60vh,18rem)] space-y-0.5 overflow-y-auto">
              {options.map((node) => (
                <TreeMultiSelectNode
                  key={node.value}
                  node={node}
                  depth={0}
                  selected={draft}
                  onSelect={handleSelect}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-2 border-t pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 flex-1 gap-1.5 text-xs"
                onClick={handleClear}
              >
                <X className="size-3.5 shrink-0" aria-hidden />
                Xóa
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 flex-1 gap-1.5 text-xs"
                onClick={handleApply}
              >
                <Check className="size-3.5 shrink-0" aria-hidden />
                Áp dụng
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
