"use client"

import { useCallback, useState } from "react"
import {
  Controller,
  useFieldArray,
  useWatch,
  type UseFormReturn,
} from "react-hook-form"
import {
  ImageUrlListField,
  ProductUnitFormSubsection,
  ProductUnitOptionalSection,
  ProductUnitPromoDivider,
  ProductUnitPromoRuleCard,
  ProductUnitQtyInline,
  ProductUnitStockBlock,
  ProductUnitStockPoolBanner,
  ProductUnitVariantCardHeader,
  buildGiftsSummary,
  buildTierSummary,
  buildTierRuleText,
  buildWholesaleSummary,
  buildWholesaleRuleText,
  computeFormUnitStockPool,
  maxSellableFromPool,
} from "@ui/components/admin"
import { Button } from "@ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/components/collapsible"
import { StorageImagePickerDialog } from "@/lib/storage-image-picker-dialog"
import { parseImageUrls, formatImageUrls } from "./types"
import { FormFieldCol } from "@ui/components/typing"
import { Input } from "@ui/components/input"
import { ChevronDown, Gift, Layers, Plus, Tag, Trash2 } from "lucide-react"
import { cn } from "@ui/lib/utils"
import type { ProductFormValues } from "./types"
import { EMPTY_GIFT_ROW, EMPTY_UNIT_ROW } from "./types"
import { buildProductImageUploadContext } from "./product-image-storage"
import {
  firstProductImage,
  ProductCatalogPickerDialog,
} from "./product-catalog-picker-dialog"
import { hasGiftsData, ProductUnitGiftsField } from "./product-unit-gifts-field"

function hasWholesaleData(wholesalePrice: string, minWholesaleQty: string) {
  return Number(wholesalePrice) > 0 || Number(minWholesaleQty) > 0
}

function hasTierData(
  tierMinQty: string,
  tierUnitPrice: string,
  tierLabel: string
) {
  return Boolean(tierMinQty.trim() || tierUnitPrice.trim() || tierLabel.trim())
}

function UnitPromoSections({
  form,
  index,
  unitLabel,
  onPickGiftImage,
  onPickFromCatalog,
}: {
  form: UseFormReturn<ProductFormValues>
  index: number
  unitLabel: string
  onPickGiftImage: (giftIndex: number) => void
  onPickFromCatalog: (giftIndex: number) => void
}) {
  const { control, register, setValue } = form

  const unitRow =
    useWatch({
      control,
      name: `units.${index}`,
    }) ?? EMPTY_UNIT_ROW

  const resolvedUnitLabel = unitRow.label?.trim() || unitLabel

  const wholesalePrice = unitRow.wholesalePrice ?? "0"
  const minWholesaleQty = unitRow.minWholesaleQty ?? "0"
  const tierMinQty = unitRow.tierMinQty ?? ""
  const tierUnitPrice = unitRow.tierUnitPrice ?? ""
  const tierLabel = unitRow.tierLabel ?? ""
  const gifts = unitRow.gifts ?? []

  const wholesaleHasData = hasWholesaleData(wholesalePrice, minWholesaleQty)
  const tierHasData = hasTierData(tierMinQty, tierUnitPrice, tierLabel)
  const giftHasData = hasGiftsData(gifts)

  const [wholesaleDraft, setWholesaleDraft] = useState(false)
  const [tierDraft, setTierDraft] = useState(false)
  const [giftDraft, setGiftDraft] = useState(false)

  const wholesaleEnabled = wholesaleHasData || wholesaleDraft
  const tierEnabled = tierHasData || tierDraft
  const giftEnabled = giftHasData || giftDraft

  const wholesaleSummary = buildWholesaleSummary(
    wholesalePrice,
    minWholesaleQty
  )
  const tierSummary = buildTierSummary(tierMinQty, tierUnitPrice, tierLabel)
  const giftSummary = buildGiftsSummary(gifts)
  const wholesaleRuleText = buildWholesaleRuleText(
    minWholesaleQty,
    wholesalePrice
  )
  const tierRuleText = buildTierRuleText(tierMinQty, tierUnitPrice, tierLabel)

  return (
    <div className="mt-4 space-y-3">
      <ProductUnitPromoDivider />

      <ProductUnitOptionalSection
        icon={Tag}
        title="Giá sỉ / khuyến mãi"
        description="Một mức giá ưu đãi cố định khi khách mua đủ số lượng — khác bậc giá (giảm theo từng mức SL)."
        enabled={wholesaleEnabled}
        summary={wholesaleSummary}
        summaryVariant="promo"
        onEnabledChange={(on) => {
          setWholesaleDraft(on)
          if (!on) {
            setValue(`units.${index}.wholesalePrice`, "0")
            setValue(`units.${index}.minWholesaleQty`, "0")
          }
        }}
      >
        <ProductUnitPromoRuleCard
          hint={wholesaleRuleText}
          condition={
            <ProductUnitQtyInline
              prefix="Từ"
              suffix="sp"
              input={
                <Input
                  type="number"
                  min={1}
                  placeholder="10"
                  className="h-8 tabular-nums"
                  {...register(`units.${index}.minWholesaleQty`)}
                />
              }
            />
          }
          result={
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Input
                type="number"
                min={0}
                placeholder="28000"
                className="h-8 min-w-[6.5rem] flex-1 tabular-nums"
                {...register(`units.${index}.wholesalePrice`)}
              />
              <span className="text-sm text-muted-foreground">₫ / sp</span>
            </div>
          }
        />
      </ProductUnitOptionalSection>

      <ProductUnitOptionalSection
        icon={Layers}
        title="Bậc giá theo số lượng"
        description="Giảm đơn giá khi đạt ngưỡng SL — nhãn hiển thị trên storefront (vd. «Mua 5+»)."
        enabled={tierEnabled}
        summary={tierSummary}
        summaryVariant="category"
        onEnabledChange={(on) => {
          setTierDraft(on)
          if (!on) {
            setValue(`units.${index}.tierMinQty`, "")
            setValue(`units.${index}.tierUnitPrice`, "")
            setValue(`units.${index}.tierLabel`, "")
          }
        }}
      >
        <ProductUnitPromoRuleCard
          hint={tierRuleText}
          condition={
            <ProductUnitQtyInline
              prefix="Từ"
              suffix="sp"
              input={
                <Input
                  type="number"
                  min={1}
                  placeholder="5"
                  className="h-8 tabular-nums"
                  {...register(`units.${index}.tierMinQty`)}
                />
              }
            />
          }
          result={
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Input
                  type="number"
                  min={0}
                  placeholder="28000"
                  className="h-8 min-w-[6.5rem] flex-1 tabular-nums"
                  {...register(`units.${index}.tierUnitPrice`)}
                />
                <span className="text-sm text-muted-foreground">₫ / sp</span>
              </div>
              <Input
                {...register(`units.${index}.tierLabel`)}
                placeholder="Nhãn: Mua 5+"
                className="h-8"
              />
            </div>
          }
        />
      </ProductUnitOptionalSection>

      <ProductUnitOptionalSection
        icon={Gift}
        title="Quà tặng kèm"
        description="Tặng thêm sản phẩm khi khách mua đủ số lượng."
        enabled={giftEnabled}
        summary={giftSummary}
        summaryVariant="coupon"
        onEnabledChange={(on) => {
          setGiftDraft(on)
          if (on && gifts.length === 0) {
            setValue(`units.${index}.gifts`, [{ ...EMPTY_GIFT_ROW }])
          }
          if (!on) {
            setValue(`units.${index}.gifts`, [])
          }
        }}
      >
        <ProductUnitGiftsField
          control={control}
          register={register}
          setValue={setValue}
          unitIndex={index}
          unitLabel={resolvedUnitLabel}
          onPickGiftImage={onPickGiftImage}
          onPickFromCatalog={onPickFromCatalog}
        />
      </ProductUnitOptionalSection>
    </div>
  )
}

function UnitVariantCardBody({
  form,
  index,
  unitLabel,
  poolBase,
  onPickImages,
  onPickGiftImage,
  onPickFromCatalog,
}: {
  form: UseFormReturn<ProductFormValues>
  index: number
  unitLabel: string
  poolBase: number
  onPickImages: () => void
  onPickGiftImage: (giftIndex: number) => void
  onPickFromCatalog: (giftIndex: number) => void
}) {
  const { control, register, watch } = form
  const qtyPerUnit = watch(`units.${index}.qtyPerUnit`)
  const maxSell = maxSellableFromPool({ qtyPerUnit }, poolBase)

  return (
    <div className="space-y-4">
      <ProductUnitFormSubsection title="Định danh loại hàng">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldCol label="Mã loại (type)" required>
            <Input {...register(`units.${index}.type`)} placeholder="hop" />
          </FormFieldCol>
          <FormFieldCol label="Nhãn hiển thị" required>
            <Input {...register(`units.${index}.label`)} placeholder="Hộp" />
          </FormFieldCol>
          <FormFieldCol label="SKU biến thể" className="sm:col-span-2">
            <Input
              {...register(`units.${index}.sku`)}
              placeholder="DEMO-001-HOP"
            />
          </FormFieldCol>
        </div>
      </ProductUnitFormSubsection>

      <ProductUnitStockBlock
        unitLabel={unitLabel}
        qtyPerUnit={qtyPerUnit}
        poolBaseStock={poolBase}
        maxSellableFromPool={maxSell}
        qtyPerUnitInput={
          <Input
            type="number"
            min={1}
            placeholder="6"
            className="h-8 tabular-nums"
            {...register(`units.${index}.qtyPerUnit`)}
          />
        }
      />

      <ProductUnitFormSubsection title="Giá bán">
        <FormFieldCol
          label="Giá bán lẻ (VND)"
          required
          description="Giá mặc định khi chưa áp dụng KM, sỉ hay bậc giá."
          className="max-w-sm"
        >
          <Input
            type="number"
            min={0}
            className="tabular-nums"
            {...register(`units.${index}.retailPrice`)}
          />
        </FormFieldCol>
      </ProductUnitFormSubsection>

      <FormFieldCol label="Ảnh sản phẩm">
        <Controller
          control={control}
          name={`units.${index}.imageUrls`}
          render={({ field: imageField }) => (
            <ImageUrlListField
              value={imageField.value ?? ""}
              onChange={imageField.onChange}
              onPickFromStorage={onPickImages}
            />
          )}
        />
      </FormFieldCol>

      <UnitPromoSections
        form={form}
        index={index}
        unitLabel={unitLabel}
        onPickGiftImage={onPickGiftImage}
        onPickFromCatalog={onPickFromCatalog}
      />
    </div>
  )
}

export function ProductUnitVariantsField({
  form,
  currentProductId,
}: {
  form: UseFormReturn<ProductFormValues>
  currentProductId?: string | null
}) {
  const { control, register, watch, setValue } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  })
  const [picker, setPicker] = useState<{
    index: number
    field: "imageUrls" | "giftImage"
    giftIndex?: number
  } | null>(null)
  const [catalogPicker, setCatalogPicker] = useState<{
    unitIndex: number
    giftIndex: number
  } | null>(null)

  const allUnits = useWatch({ control, name: "units" }) ?? []
  const baseStock = useWatch({ control, name: "baseStock" })
  const poolBase = computeFormUnitStockPool(baseStock)
  const useCollapsible = fields.length > 1

  const resolveProductUpload = useCallback(
    () =>
      buildProductImageUploadContext({
        productName: form.getValues("name"),
        productSku: form.getValues("sku"),
      }),
    [form]
  )

  return (
    <div className="space-y-4">
      <ProductUnitStockPoolBanner baseStock={baseStock} units={allUnits} />

      {fields.map((field, index) => {
        const isDefault = watch(`units.${index}.isDefault`)
        const unitLabel = watch(`units.${index}.label`) ?? ""
        const retailPrice = watch(`units.${index}.retailPrice`)
        const qtyPerUnit = watch(`units.${index}.qtyPerUnit`)

        const headerActions = (
          <div className="flex shrink-0 gap-2">
            {!isDefault ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  fields.forEach((_, i) => {
                    setValue(`units.${i}.isDefault`, i === index)
                  })
                }}
              >
                Đặt mặc định
              </Button>
            ) : null}
            {fields.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                aria-label="Xóa loại hàng"
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        )

        const body = (
          <UnitVariantCardBody
            form={form}
            index={index}
            unitLabel={unitLabel}
            poolBase={poolBase}
            onPickImages={() => setPicker({ index, field: "imageUrls" })}
            onPickGiftImage={(giftIndex) =>
              setPicker({ index, field: "giftImage", giftIndex })
            }
            onPickFromCatalog={(giftIndex) =>
              setCatalogPicker({ unitIndex: index, giftIndex })
            }
          />
        )

        if (!useCollapsible) {
          return (
            <div
              key={field.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <ProductUnitVariantCardHeader
                  index={index}
                  label={unitLabel}
                  isDefault={isDefault}
                  retailPrice={retailPrice}
                  qtyPerUnit={qtyPerUnit}
                  poolBase={poolBase}
                  expanded
                />
                {headerActions}
              </div>
              {body}
            </div>
          )
        }

        return (
          <Collapsible
            key={field.id}
            defaultOpen={isDefault}
            className="group overflow-hidden rounded-lg border bg-card shadow-sm"
          >
            <div className="flex items-center gap-2 p-4 pb-3">
              <CollapsibleTrigger
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 rounded-md text-left transition-colors",
                  "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <ProductUnitVariantCardHeader
                  index={index}
                  label={unitLabel}
                  isDefault={isDefault}
                  retailPrice={retailPrice}
                  qtyPerUnit={qtyPerUnit}
                  poolBase={poolBase}
                  expanded={false}
                />
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-open:rotate-180"
                  aria-hidden
                />
              </CollapsibleTrigger>
              {headerActions}
            </div>
            <CollapsibleContent className="border-t px-4 pb-4 pt-3">
              {body}
            </CollapsibleContent>
          </Collapsible>
        )
      })}

      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() =>
          append({
            ...EMPTY_UNIT_ROW,
            isDefault: false,
            type: `loai-${fields.length + 1}`,
          })
        }
      >
        <Plus className="size-4" /> Thêm loại hàng
      </Button>

      <StorageImagePickerDialog
        open={picker !== null}
        multiSelect={picker?.field === "imageUrls"}
        resolveProductUpload={resolveProductUpload}
        onOpenChange={(open) => {
          if (!open) setPicker(null)
        }}
        onSelect={(urls) => {
          if (!picker || !urls[0]) return
          const idx = picker.index
          if (picker.field === "imageUrls") {
            const current = parseImageUrls(
              watch(`units.${idx}.imageUrls`) ?? ""
            )
            setValue(
              `units.${idx}.imageUrls`,
              formatImageUrls([...current, ...urls])
            )
          } else if (picker.giftIndex !== undefined) {
            setValue(`units.${idx}.gifts.${picker.giftIndex}.image`, urls[0]!)
          }
          setPicker(null)
        }}
      />

      <ProductCatalogPickerDialog
        open={catalogPicker !== null}
        onOpenChange={(open) => {
          if (!open) setCatalogPicker(null)
        }}
        excludeProductId={currentProductId}
        onSelect={(product) => {
          if (!catalogPicker) return
          const { unitIndex, giftIndex } = catalogPicker
          const base = `units.${unitIndex}.gifts.${giftIndex}` as const
          setValue(`${base}.productId`, product.id)
          setValue(`${base}.name`, product.name)
          setValue(`${base}.sku`, product.sku)
          const image = firstProductImage(product)
          if (image) setValue(`${base}.image`, image)
          const label = form.getValues(`${base}.label`)?.trim()
          if (!label) {
            setValue(`${base}.label`, `Tặng ${product.name}`)
          }
          setCatalogPicker(null)
        }}
      />
    </div>
  )
}
