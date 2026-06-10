"use client"

import { useEffect, useMemo, useState } from "react"
import { Package } from "lucide-react"
import {
  PanelDialog,
  PanelDialogSearch,
} from "@ui/components/dialogs/panel-dialog"
import { Button } from "@ui/components/button"
import { resolveMediaUrl } from "@ui/lib/resolve-media-url"
import { api } from "@/lib/api"
import { useProductsListQuery } from "./use-products-queries"
import type { ProductRow } from "./types"

function firstProductImage(product: ProductRow): string {
  const fromUnit = product.unitTypes?.find((u) => u.images?.length)?.images?.[0]
  return fromUnit ?? product.images?.[0] ?? ""
}

export type ProductCatalogPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: ProductRow) => void
  excludeProductId?: string | null
  title?: string
}

export function ProductCatalogPickerDialog({
  open,
  onOpenChange,
  onSelect,
  excludeProductId,
  title = "Chọn sản phẩm quà tặng",
}: ProductCatalogPickerDialogProps) {
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")

  useEffect(() => {
    if (!open) {
      setQ("")
      setDebouncedQ("")
      return
    }
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 280)
    return () => window.clearTimeout(timer)
  }, [q, open])

  const listQuery = useProductsListQuery(api, {
    page: 1,
    limit: 30,
    q: debouncedQ || undefined,
    enabled: open,
  })

  const items = useMemo(() => {
    const rows = listQuery.data?.items ?? []
    if (!excludeProductId) return rows
    return rows.filter((row) => row.id !== excludeProductId)
  }, [listQuery.data?.items, excludeProductId])

  return (
    <PanelDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Chọn sản phẩm có sẵn trong kho làm quà tặng kèm."
      size="md"
      footer={
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        <PanelDialogSearch
          id="product-catalog-picker-q"
          value={q}
          onChange={setQ}
          placeholder="Tìm theo tên hoặc SKU…"
        />

        <div className="max-h-[min(52vh,420px)] space-y-1 overflow-y-auto rounded-lg border bg-card p-1">
          {listQuery.isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Đang tải…
            </p>
          ) : listQuery.isError ? (
            <p className="px-3 py-6 text-center text-sm text-destructive">
              Không tải được danh sách sản phẩm.
            </p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Không có sản phẩm phù hợp.
            </p>
          ) : (
            items.map((product) => {
              const image = firstProductImage(product)
              const imageSrc = image ? resolveMediaUrl(image, 96) : ""
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    onSelect(product)
                    onOpenChange(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/60"
                >
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Package
                          className="size-4 text-muted-foreground/50"
                          aria-hidden
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </PanelDialog>
  )
}

export { firstProductImage }
