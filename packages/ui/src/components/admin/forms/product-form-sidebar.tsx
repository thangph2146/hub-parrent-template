"use client"

import { useState, type ComponentProps } from "react"
import {
  Boxes,
  ChevronDown,
  FileText,
  Package,
  Power,
  Tag,
} from "lucide-react"
import { cn } from "../../../lib/utils"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "../../field"
import { FormFieldCol } from "../../typing"
import { Input } from "../../input"
import { Textarea } from "../../textarea"
import { Switch } from "../../switch"
import { Badge } from "../../badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../collapsible"
import {
  computeFormUnitStockPool,
  maxSellableFromPool,
  type FormUnitStockRow,
} from "./product-unit-stock-pool"

/** Các field sidebar form sản phẩm — tách type để dùng với react-hook-form. */
export type ProductFormSidebarFields = {
  sku: string
  name: string
  category: string
  baseStock: string
  fulfillmentNote: string
  description: string
  isActive: boolean
}

export type ProductFormSidebarRegister = (
  name: keyof ProductFormSidebarFields,
) => Pick<
  ComponentProps<"input"> & ComponentProps<"textarea">,
  "name" | "onChange" | "onBlur" | "ref"
>

export type ProductFormSidebarProps = {
  register: ProductFormSidebarRegister
  isActive: boolean
  onIsActiveChange: (active: boolean) => void
  baseStock: string
  units: FormUnitStockRow[]
  className?: string
}

function ProductFormStockPanel({
  baseStock,
  units,
  stockInput,
}: {
  baseStock: string
  units: FormUnitStockRow[]
  stockInput: React.ReactNode
}) {
  const poolBase = computeFormUnitStockPool(baseStock)
  const rows = units.map((u, index) => ({
    label: u.label?.trim() || u.type?.trim() || `Loại #${index + 1}`,
    maxSell: maxSellableFromPool(u, poolBase),
    per: Math.max(1, Math.floor(Number(u.qtyPerUnit) || 1)),
  }))

  return (
    <div className="space-y-3">
      {poolBase > 0 ? (
        <div className="rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2.5 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Pool hiện tại
          </p>
          <p className="text-2xl font-bold tabular-nums leading-tight text-primary">
            {poolBase.toLocaleString("vi-VN")}
          </p>
          <p className="text-[11px] text-muted-foreground">sp gốc</p>
        </div>
      ) : null}

      {stockInput}

      {poolBase > 0 ? (
        <div className="rounded-lg border border-border/70 bg-muted/15 p-2.5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            SL tối đa từng loại
          </p>
          <ul className="space-y-1.5">
            {rows.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-2 rounded-md bg-background/80 px-2 py-1.5 text-xs"
              >
                <span className="min-w-0 truncate font-medium text-foreground">
                  {row.label}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
                  <Badge variant="muted" className="px-1.5 text-[10px]">
                    ×{row.per}
                  </Badge>
                  <span className="min-w-[2ch] text-right font-semibold text-foreground">
                    {row.maxSell}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-border/80 bg-muted/10 px-3 py-2.5 text-xs text-muted-foreground">
          <Boxes className="mt-0.5 size-4 shrink-0 opacity-60" aria-hidden />
          <p>
            Nhập tồn sp gốc để xem SL tối đa bán được của từng loại hàng bên
            trái.
          </p>
        </div>
      )}
    </div>
  )
}

export function ProductFormSidebar({
  register,
  isActive,
  onIsActiveChange,
  baseStock,
  units,
  className,
}: ProductFormSidebarProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <div className={cn("space-y-4", className)}>
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Power}
          title="Xuất bản"
          description="Hiển thị trên storefront."
        />
        <FieldSetContent variant="section" className="pt-0">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium">Trạng thái bán</p>
              <Badge
                variant={isActive ? "default" : "muted"}
                className="text-[10px]"
              >
                {isActive ? "Đang bán" : "Tạm ẩn"}
              </Badge>
            </div>
            <Switch checked={isActive} onCheckedChange={onIsActiveChange} />
          </div>
        </FieldSetContent>
      </FieldSet>

      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Package}
          title="Sản phẩm"
          description="Định danh và nhóm danh mục."
        />
        <FieldSetContent variant="section" className="grid gap-4 pt-0">
          <FormFieldCol label="Tên hiển thị" required>
            <Input
              {...register("name")}
              placeholder="Mì gói đại lý thùng 30 gói"
            />
          </FormFieldCol>
          <FormFieldCol label="SKU cha" required>
            <Input {...register("sku")} placeholder="MI-GOI-001" />
          </FormFieldCol>
          <FormFieldCol label="Danh mục" required>
            <Input {...register("category")} placeholder="general" />
          </FormFieldCol>

          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger
              type="button"
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/10 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <FileText className="size-3.5" aria-hidden />
                Mô tả storefront
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200",
                  detailsOpen && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="grid gap-3 pt-3">
              <FormFieldCol
                label="Ghi chú kho / quà chung"
                description="Nội bộ kho, không hiện trên cửa hàng."
              >
                <Textarea rows={2} {...register("fulfillmentNote")} />
              </FormFieldCol>
              <FormFieldCol
                label="Mô tả"
                description="Hiển thị trên trang chi tiết sản phẩm."
              >
                <Textarea rows={3} {...register("description")} />
              </FormFieldCol>
            </CollapsibleContent>
          </Collapsible>
        </FieldSetContent>
      </FieldSet>

      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Boxes}
          title="Tồn kho"
          description="Một pool sp gốc — SL từng loại tự tính."
        />
        <FieldSetContent variant="section" className="pt-0">
          <ProductFormStockPanel
            baseStock={baseStock}
            units={units}
            stockInput={
              <FormFieldCol
                label="Tồn sp gốc"
                required
                description="Nhập một lần; chia tự động theo quy đổi từng loại."
              >
                <div className="relative">
                  <Tag
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="200"
                    className="h-9 pl-8 text-base tabular-nums"
                    {...register("baseStock")}
                  />
                </div>
              </FormFieldCol>
            }
          />
        </FieldSetContent>
      </FieldSet>
    </div>
  )
}
