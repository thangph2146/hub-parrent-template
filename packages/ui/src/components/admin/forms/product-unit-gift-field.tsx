"use client"

import type { ReactNode } from "react"
import { Package, PackageOpen, Pencil, X } from "lucide-react"
import { cn } from "../../../lib/utils"
import { Button } from "../../button"
import { resolveMediaUrl } from "../../../lib/resolve-media-url"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs"

export type ProductUnitGiftSource = "catalog" | "manual"

export type ProductUnitGiftSourcePanelProps = {
  source: ProductUnitGiftSource
  onSourceChange: (source: ProductUnitGiftSource) => void
  catalogContent: ReactNode
  manualContent: ReactNode
  className?: string
}

export function ProductUnitGiftSourcePanel({
  source,
  onSourceChange,
  catalogContent,
  manualContent,
  className,
}: ProductUnitGiftSourcePanelProps) {
  return (
    <Tabs
      value={source}
      onValueChange={(v) => onSourceChange(v as ProductUnitGiftSource)}
      className={cn("space-y-3", className)}
    >
      <TabsList className="grid h-9 w-full grid-cols-2">
        <TabsTrigger value="catalog" className="gap-1.5 text-xs sm:text-sm">
          <Package className="size-3.5 shrink-0" aria-hidden />
          Từ kho SP
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-1.5 text-xs sm:text-sm">
          <Pencil className="size-3.5 shrink-0" aria-hidden />
          Quà ngoài
        </TabsTrigger>
      </TabsList>
      <TabsContent value="catalog" className="mt-0 space-y-3">
        {catalogContent}
      </TabsContent>
      <TabsContent value="manual" className="mt-0 space-y-3">
        {manualContent}
      </TabsContent>
    </Tabs>
  )
}

export type ProductUnitGiftCatalogCardProps = {
  /** Đã liên kết SP trong kho (có giftProductId). */
  linked?: boolean
  name?: string
  sku?: string
  imageUrl?: string
  onPick: () => void
  onClear: () => void
  className?: string
}

export function ProductUnitGiftCatalogCard({
  linked = false,
  name,
  sku,
  imageUrl,
  onPick,
  onClear,
  className,
}: ProductUnitGiftCatalogCardProps) {
  const hasSelection = linked

  if (!hasSelection) {
    return (
      <button
        type="button"
        onClick={onPick}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/[0.03] p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.06]",
          className
        )}
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
          <PackageOpen className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Chọn sản phẩm trong kho</p>
          <p className="text-xs text-muted-foreground">
            Tự điền tên, SKU và ảnh từ sản phẩm có sẵn.
          </p>
        </div>
      </button>
    )
  }

  const resolvedImage = imageUrl?.trim()
    ? resolveMediaUrl(imageUrl.trim(), 96)
    : ""

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm",
        className
      )}
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {resolvedImage ? (
          <img
            src={resolvedImage}
            alt=""
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted/50">
            <Package className="size-5 text-muted-foreground/50" aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm leading-snug font-semibold">{name}</p>
        {sku?.trim() ? (
          <p className="truncate font-mono text-xs text-muted-foreground">
            {sku.trim()}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Liên kết sản phẩm trong kho
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button type="button" variant="outline" size="sm" onClick={onPick}>
          Đổi
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onClear}
        >
          <X className="size-3.5" aria-hidden />
          Bỏ
        </Button>
      </div>
    </div>
  )
}
