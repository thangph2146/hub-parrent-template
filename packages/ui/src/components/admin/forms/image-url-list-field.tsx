"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { ChevronDown, ImageIcon, Link2, Plus, Trash2 } from "lucide-react"
import { cn } from "../../../lib/utils"
import {
  formatImageUrlList,
  parseImageUrlList,
  resolveMediaUrl,
} from "../../../lib/resolve-media-url"
import {
  AdminDataTable,
  adminTableRowSelectionProps,
  defineDataTableActionsColumn,
} from "../../data-table"
import { AdminTablePurgeButton } from "../presets/table-row-actions"
import { Badge } from "../../badge"
import { Button } from "../../button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../collapsible"
import { Input } from "../../input"
import { Textarea } from "../../textarea"

export type ImageUrlRow = {
  id: string
  url: string
}

export type ImageUrlListFieldProps = {
  value: string
  onChange: (value: string) => void
  onPickFromStorage?: () => void
  pickFromStorageLabel?: string
  placeholder?: string
  emptyHint?: string
  className?: string
}

function urlsEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((url, i) => url === b[i])
}

function mergeRowsFromUrls(urls: string[], prev: ImageUrlRow[]): ImageUrlRow[] {
  const used = new Set<string>()
  return urls.map((url, index) => {
    const atIndex = prev[index]
    if (atIndex?.url === url && !used.has(atIndex.id)) {
      used.add(atIndex.id)
      return atIndex
    }
    const duplicateCount = urls.filter((u) => u === url).length
    if (duplicateCount === 1) {
      const found = prev.find((row) => row.url === url && !used.has(row.id))
      if (found) {
        used.add(found.id)
        return found
      }
    }
    const fresh: ImageUrlRow = {
      id: `img-${index}-${url.slice(-12)}-${Math.random().toString(36).slice(2, 8)}`,
      url,
    }
    used.add(fresh.id)
    return fresh
  })
}

function buildImageUrlListColumns({
  onRemove,
}: {
  onRemove: (row: ImageUrlRow) => void
}): ColumnDef<ImageUrlRow, unknown>[] {
  return [
    {
      id: "preview",
      header: "Ảnh",
      enableSorting: false,
      enableColumnFilter: false,
      size: 88,
      meta: { className: "w-[88px] min-w-[88px] max-w-[88px]" },
      cell: ({ row }) => (
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-md border bg-muted">
          <img
            src={resolveMediaUrl(row.original.url, 120)}
            alt=""
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      ),
    },
    {
      accessorKey: "url",
      header: "URL",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const url = String(getValue() ?? "")
        return (
          <p
            className="max-w-md truncate font-mono text-xs text-muted-foreground"
            title={url}
          >
            {url}
          </p>
        )
      },
    },
    defineDataTableActionsColumn<ImageUrlRow>({
      header: "",
      cell: ({ row }) => (
        <AdminTablePurgeButton
          label="Xóa"
          title="Xóa ảnh khỏi danh sách"
          onClick={() => onRemove(row.original)}
        />
      ),
    }),
  ]
}

export function ImageUrlListField({
  value,
  onChange,
  onPickFromStorage,
  pickFromStorageLabel = "Chọn từ kho ảnh",
  placeholder = "/api/uploads/images/...",
  emptyHint = "Chưa có ảnh cho loại hàng này",
  className,
}: ImageUrlListFieldProps) {
  const scopeId = useId().replace(/:/g, "")
  const idCounter = useRef(0)
  const [manualOpen, setManualOpen] = useState(false)
  const [urlDraft, setUrlDraft] = useState("")
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({})
  const [rows, setRows] = useState<ImageUrlRow[]>(() =>
    mergeRowsFromUrls(parseImageUrlList(value), [])
  )
  const rowsRef = useRef(rows)
  rowsRef.current = rows

  const commitRows = useCallback(
    (next: ImageUrlRow[]) => {
      rowsRef.current = next
      setRows(next)
      onChange(formatImageUrlList(next.map((row) => row.url)))
    },
    [onChange]
  )

  useEffect(() => {
    const fromProp = parseImageUrlList(value)
    setRows((prev) => {
      const fromState = prev.map((row) => row.url)
      if (urlsEqual(fromProp, fromState)) return prev
      const next = mergeRowsFromUrls(fromProp, prev)
      rowsRef.current = next
      return next
    })
  }, [value])

  const removeRow = useCallback(
    (row: ImageUrlRow) => {
      const next = rowsRef.current.filter((item) => item.id !== row.id)
      commitRows(next)
      setSelectedRowIds((prev) => {
        const selection = { ...prev }
        delete selection[row.id]
        return selection
      })
    },
    [commitRows]
  )

  const columns = useMemo(
    () => buildImageUrlListColumns({ onRemove: removeRow }),
    [removeRow]
  )

  const addUrl = (raw: string) => {
    const next = raw.trim()
    if (!next) return
    if (rows.some((row) => row.url === next)) return
    const row: ImageUrlRow = {
      id: `img-new-${idCounter.current++}`,
      url: next,
    }
    commitRows([...rows, row])
    setUrlDraft("")
  }

  const handleBulkRemove = useCallback(
    (selected: ImageUrlRow[]) => {
      const removeIds = new Set(selected.map((row) => row.id))
      const next = rowsRef.current.filter((row) => !removeIds.has(row.id))
      commitRows(next)
      setSelectedRowIds({})
    },
    [commitRows]
  )

  const handleReorder = useCallback(
    (ordered: ImageUrlRow[]) => {
      commitRows(ordered)
    },
    [commitRows]
  )

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedRowIds[row.id]),
    [rows, selectedRowIds]
  )
  const selectedCount = selectedRows.length

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {onPickFromStorage ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPickFromStorage}
          >
            <ImageIcon className="size-4" />
            {pickFromStorageLabel}
          </Button>
        ) : null}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Dán URL ảnh…"
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addUrl(urlDraft)
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => addUrl(urlDraft)}
            disabled={!urlDraft.trim()}
          >
            <Plus className="size-4" />
            Thêm
          </Button>
        </div>
        {rows.length > 0 ? (
          <Badge variant="secondary" className="ml-auto">
            {rows.length} ảnh
          </Badge>
        ) : null}
      </div>

      {rows.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
          {selectedCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-primary/15 bg-primary/5 px-2.5 py-1.5">
              <span className="text-xs text-muted-foreground">
                Đã chọn{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {selectedCount}
                </span>
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 gap-1 rounded-md px-2 text-xs"
                onClick={() => handleBulkRemove(selectedRows)}
              >
                <Trash2 className="size-3.5" />
                Xóa đã chọn
              </Button>
            </div>
          ) : null}
          <AdminDataTable<ImageUrlRow>
            tableScope={`image-url-list-${scopeId}`}
            data={rows}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel={emptyHint}
            showTableToolbar={false}
            showColumnFilters={false}
            showTableColumnPicker={false}
            stickyTableHeader={false}
            showIndexColumn
            indexColumnLabel="#"
            rowReorderEnabled
            onRowReorder={handleReorder}
            rowReorderHandleAriaLabel="Kéo để đổi thứ tự hiển thị ảnh"
            rowContextMenu={false}
            tableBodyMaxHeight={360}
            {...adminTableRowSelectionProps(selectedRowIds, setSelectedRowIds)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{emptyHint}</p>
            <p className="text-xs text-muted-foreground">
              Chọn từ kho lưu trữ hoặc dán URL phía trên
            </p>
          </div>
          {onPickFromStorage ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPickFromStorage}
            >
              <ImageIcon className="size-4" />
              {pickFromStorageLabel}
            </Button>
          ) : null}
        </div>
      )}

      <Collapsible open={manualOpen} onOpenChange={setManualOpen}>
        <CollapsibleTrigger className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
          <Link2 className="size-3.5" />
          Nhập URL thủ công
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              manualOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-xs"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Mỗi URL một dòng. Thay đổi ở đây sẽ cập nhật bảng ảnh phía trên.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export type ImageUrlFieldProps = {
  value: string
  onChange: (value: string) => void
  onPickFromStorage?: () => void
  pickFromStorageLabel?: string
  placeholder?: string
  className?: string
}

export function ImageUrlField({
  value,
  onChange,
  onPickFromStorage,
  pickFromStorageLabel = "Kho ảnh",
  placeholder = "/api/uploads/images/...",
  className,
}: ImageUrlFieldProps) {
  const trimmed = value.trim()

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-start",
        className
      )}
    >
      {trimmed ? (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
          <img
            src={resolveMediaUrl(trimmed, 160)}
            alt="Ảnh quà tặng"
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-1 right-1 size-6 shadow-sm"
            onClick={() => onChange("")}
            aria-label="Xóa ảnh"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted/30">
          <ImageIcon className="size-6 text-muted-foreground/60" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0"
        />
        {onPickFromStorage ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={onPickFromStorage}
          >
            {pickFromStorageLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
