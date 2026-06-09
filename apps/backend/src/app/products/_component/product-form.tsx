"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
  ProductFormSidebar,
} from "@ui/components/admin"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import type {
  CreateProductInput,
  Product,
  ProductGiftRule,
  ProductUnitType,
} from "@workspace/api-client"
import { productBaseStock } from "@workspace/api-client"
import {
  EMPTY_UNIT_ROW,
  formatImageUrls,
  parseImageUrls,
  type ProductFormValues,
  type ProductUnitFormRow,
} from "./types"
import { ProductUnitVariantsField } from "./product-unit-variants-field"

const unitRowSchema = z.object({
  type: z.string().min(1, "Bắt buộc"),
  label: z.string().min(1, "Bắt buộc"),
  sku: z.string(),
  retailPrice: z.string().min(1, "Bắt buộc"),
  wholesalePrice: z.string(),
  minWholesaleQty: z.string(),
  qtyPerUnit: z.string(),
  imageUrls: z.string(),
  tierMinQty: z.string(),
  tierUnitPrice: z.string(),
  tierLabel: z.string(),
  gifts: z.array(
    z.object({
      label: z.string(),
      minQty: z.string(),
      name: z.string(),
      sku: z.string(),
      qty: z.string(),
      image: z.string(),
      productId: z.string(),
      scope: z.enum(["line", "product"]),
    })
  ),
  isDefault: z.boolean(),
})

const schema = z.object({
  sku: z.string().min(1, "Bắt buộc"),
  name: z.string().min(1, "Bắt buộc"),
  category: z.string().min(1, "Bắt buộc"),
  description: z.string(),
  isActive: z.boolean(),
  fulfillmentNote: z.string(),
  baseStock: z.string(),
  units: z.array(unitRowSchema).min(1, "Cần ít nhất một loại hàng"),
})

function unitRowToApi(row: ProductUnitFormRow, index: number): ProductUnitType {
  const retail = Math.max(0, Math.floor(Number(row.retailPrice) || 0))
  const wholesaleRaw = Math.floor(Number(row.wholesalePrice) || 0)
  const wholesale = wholesaleRaw > 0 ? wholesaleRaw : null
  const minQ = Math.max(0, Math.floor(Number(row.minWholesaleQty) || 0))
  const images = parseImageUrls(row.imageUrls)

  const tierMin = Math.floor(Number(row.tierMinQty) || 0)
  const tierPrice = Math.floor(Number(row.tierUnitPrice) || 0)
  const priceTiers =
    tierMin > 0 && tierPrice > 0
      ? [
          {
            minQty: tierMin,
            unitPrice: tierPrice,
            label: row.tierLabel.trim() || undefined,
          },
        ]
      : undefined

  const giftRules: ProductGiftRule[] = []
  row.gifts.forEach((gift, giftIndex) => {
    const giftMin = Math.floor(Number(gift.minQty) || 0)
    const giftName = gift.name.trim()
    if (giftMin <= 0 || !giftName) return
    giftRules.push({
      id: `gift-${row.type.trim() || index}-${giftIndex}`,
      label: gift.label.trim() || giftName,
      trigger: { scope: gift.scope, minQty: giftMin },
      gift: {
        name: giftName,
        sku: gift.sku.trim() || undefined,
        productId: gift.productId.trim() ? Number(gift.productId) : undefined,
        qty: Math.max(1, Math.floor(Number(gift.qty) || 1)),
        image: gift.image.trim() || undefined,
        qtyMultiplier: "once",
      },
      applyPer: "order",
    })
  })
  const giftRulesOrUndefined = giftRules.length ? giftRules : undefined

  return {
    type: row.type.trim(),
    label: row.label.trim() || row.type.trim(),
    sku: row.sku.trim() || undefined,
    retailPrice: retail,
    wholesalePrice: wholesale,
    minWholesaleQty: minQ,
    qtyPerUnit: Math.max(1, Math.floor(Number(row.qtyPerUnit) || 1)),
    images: images.length ? images : undefined,
    priceTiers,
    giftRules: giftRulesOrUndefined,
    isDefault: row.isDefault,
    isActive: true,
  }
}

export function useProductForm(defaults?: Partial<ProductFormValues>) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: "",
      name: "",
      category: "general",
      description: "",
      isActive: true,
      fulfillmentNote: "",
      baseStock: "0",
      units: [{ ...EMPTY_UNIT_ROW }],
      ...defaults,
    },
  })
  return { form }
}

function unitToFormRow(
  unit: ProductUnitType,
  isDefault: boolean
): ProductUnitFormRow {
  const tier = unit.priceTiers?.[0]
  return {
    type: unit.type,
    label: unit.label,
    sku: unit.sku ?? "",
    retailPrice: String(unit.retailPrice ?? 0),
    wholesalePrice: String(unit.wholesalePrice ?? 0),
    minWholesaleQty: String(unit.minWholesaleQty ?? 0),
    qtyPerUnit: String(unit.qtyPerUnit ?? 1),
    imageUrls: formatImageUrls(unit.images),
    tierMinQty: tier ? String(tier.minQty) : "",
    tierUnitPrice: tier ? String(tier.unitPrice) : "",
    tierLabel: tier?.label ?? "",
    gifts: (unit.giftRules ?? []).map((gift) => ({
      label: gift.label ?? "",
      minQty: gift.trigger.minQty ? String(gift.trigger.minQty) : "",
      name: gift.gift.name ?? "",
      sku: gift.gift.sku ?? "",
      qty: String(gift.gift.qty ?? 1),
      image: gift.gift.image ?? "",
      productId: gift.gift.productId ? String(gift.gift.productId) : "",
      scope: gift.trigger.scope === "product" ? "product" : "line",
    })),
    isDefault,
  }
}

export function productToFormValues(product: Product): ProductFormValues {
  const units = product.unitTypes?.length
    ? product.unitTypes.map((u, i) => unitToFormRow(u, u.isDefault ?? i === 0))
    : [
        unitToFormRow(
          {
            type: product.unit,
            label: product.unit,
            retailPrice: product.retailPrice,
            wholesalePrice: product.wholesalePrice,
            minWholesaleQty: 0,
            qtyPerUnit: 1,
            images: product.images ?? undefined,
          },
          true
        ),
      ]

  if (!units.some((u) => u.isDefault)) {
    units[0] = { ...units[0]!, isDefault: true }
  }

  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    description: product.description ?? "",
    isActive: product.isActive,
    fulfillmentNote: product.fulfillmentNote ?? "",
    baseStock: String(productBaseStock(product)),
    units,
  }
}

export function buildProductPayload(
  values: ProductFormValues
): CreateProductInput {
  const unitTypes = values.units.map((row, index) => unitRowToApi(row, index))
  const defaultUnit = unitTypes.find((u) => u.isDefault) ?? unitTypes[0]!
  const allImages = unitTypes.flatMap((u) => u.images ?? [])
  const totalStock = Math.max(0, Math.floor(Number(values.baseStock) || 0))

  return {
    sku: values.sku.trim(),
    name: values.name.trim(),
    category: values.category.trim(),
    description: values.description?.trim() || null,
    basePrice: defaultUnit.retailPrice,
    retailPrice: defaultUnit.retailPrice,
    wholesalePrice: defaultUnit.wholesalePrice ?? 0,
    stock: totalStock,
    unit: defaultUnit.type,
    unitTypes,
    images: allImages.length ? [...new Set(allImages)] : null,
    fulfillmentNote: values.fulfillmentNote.trim() || null,
    isActive: values.isActive,
  }
}

export function ProductFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
}: {
  form: UseFormReturn<ProductFormValues>
  onSubmit: (values: ProductFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}) {
  const { register, watch, setValue } = form
  const isActive = watch("isActive")
  const units = watch("units") ?? []
  const baseStock = watch("baseStock")

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        subtitle="Mỗi loại hàng có giá, ảnh, tồn và quà tặng riêng — snapshot lúc checkout."
        onBack={onBack}
        onReset={onReset}
        formId="product-form"
        submitting={submitting}
        isEdit={!!editingId}
      />
      <AdminFormLayout id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
        <AdminFormMain className="space-y-6">
          <FieldSet variant="section">
            <FieldSectionLegend
              title="Loại hàng (biến thể)"
              description="Giá, ảnh, tồn pool chung, bậc giá và quà tặng theo từng loại."
            />
            <FieldSetContent variant="section" className="pt-0">
              <ProductUnitVariantsField
                form={form}
                currentProductId={editingId}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>
        <AdminFormSidebar className="sticky top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <ProductFormSidebar
            register={register}
            isActive={isActive}
            onIsActiveChange={(v) => setValue("isActive", v)}
            baseStock={baseStock}
            units={units}
          />
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
