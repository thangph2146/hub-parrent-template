"use client"

import { useState } from "react"
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form"
import {
  ImageUrlField,
  ProductUnitGiftCatalogCard,
  ProductUnitGiftPreview,
  ProductUnitGiftSourcePanel,
  type ProductUnitGiftSource,
  formatGiftScopeLabel,
} from "@ui/components/admin"
import { Button } from "@ui/components/button"
import { FormFieldCol } from "@ui/components/typing"
import { Input } from "@ui/components/input"
import { SelectPicker } from "@ui/components/pickers"
import { Plus, Trash2 } from "lucide-react"
import {
  EMPTY_GIFT_ROW,
  type ProductFormValues,
  type ProductUnitGiftFormRow,
} from "./types"

export function hasSingleGiftData(gift: ProductUnitGiftFormRow) {
  return Boolean(
    gift.label.trim() ||
    gift.minQty.trim() ||
    gift.name.trim() ||
    gift.sku.trim() ||
    gift.image.trim() ||
    gift.productId.trim()
  )
}

export function hasGiftsData(gifts: ProductUnitGiftFormRow[] | undefined) {
  return (gifts ?? []).some(hasSingleGiftData)
}

type ProductUnitGiftsFieldProps = {
  control: Control<ProductFormValues>
  register: UseFormRegister<ProductFormValues>
  setValue: UseFormSetValue<ProductFormValues>
  unitIndex: number
  unitLabel: string
  onPickGiftImage: (giftIndex: number) => void
  onPickFromCatalog: (giftIndex: number) => void
}

function GiftRuleCard({
  control,
  register,
  setValue,
  unitIndex,
  giftIndex,
  unitLabel,
  onRemove,
  canRemove,
  onPickGiftImage,
  onPickFromCatalog,
}: {
  control: Control<ProductFormValues>
  register: UseFormRegister<ProductFormValues>
  setValue: UseFormSetValue<ProductFormValues>
  unitIndex: number
  giftIndex: number
  unitLabel: string
  onRemove: () => void
  canRemove: boolean
  onPickGiftImage: () => void
  onPickFromCatalog: () => void
}) {
  const base = `units.${unitIndex}.gifts.${giftIndex}` as const

  const gift =
    useWatch({
      control,
      name: base,
    }) ?? EMPTY_GIFT_ROW

  const [tabOverride, setTabOverride] = useState<ProductUnitGiftSource | null>(
    null
  )
  const sourceTab: ProductUnitGiftSource = gift.productId?.trim()
    ? "catalog"
    : (tabOverride ?? "manual")

  const handleSourceChange = (source: ProductUnitGiftSource) => {
    setTabOverride(source)
    if (source === "manual") {
      setValue(`${base}.productId`, "")
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Quà #{giftIndex + 1}</p>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label={`Xóa quà #${giftIndex + 1}`}
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}
      </div>

      <ProductUnitGiftSourcePanel
        source={sourceTab}
        onSourceChange={handleSourceChange}
        catalogContent={
          <ProductUnitGiftCatalogCard
            linked={Boolean(gift.productId?.trim())}
            name={gift.name}
            sku={gift.sku}
            imageUrl={gift.image}
            onPick={onPickFromCatalog}
            onClear={() => setValue(`${base}.productId`, "")}
          />
        }
        manualContent={
          <div className="grid gap-3 sm:grid-cols-2">
            <FormFieldCol label="Tên quà">
              <Input
                {...register(`${base}.name`)}
                placeholder="Cốc thủy tinh"
              />
            </FormFieldCol>
            <FormFieldCol label="SKU quà">
              <Input {...register(`${base}.sku`)} placeholder="GIFT-COC" />
            </FormFieldCol>
            <FormFieldCol label="Ảnh quà" className="sm:col-span-2">
              <Controller
                control={control}
                name={`${base}.image`}
                render={({ field }) => (
                  <ImageUrlField
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onPickFromStorage={onPickGiftImage}
                  />
                )}
              />
            </FormFieldCol>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FormFieldCol label="Khi mua từ (sp)">
          <Input
            type="number"
            min={1}
            placeholder="10"
            className="tabular-nums"
            {...register(`${base}.minQty`)}
          />
        </FormFieldCol>
        <FormFieldCol
          label="Phạm vi đếm SL"
          description="SL kiểm tra điều kiện nhận quà này."
        >
          <SelectPicker
            value={gift.scope ?? "line"}
            onChange={(value) =>
              setValue(
                `${base}.scope`,
                (typeof value === "string" ? value : "line") as
                  | "line"
                  | "product"
              )
            }
            options={[
              {
                value: "line",
                label: formatGiftScopeLabel("line", unitLabel),
              },
              {
                value: "product",
                label: formatGiftScopeLabel("product", unitLabel),
              },
            ]}
            placeholder="Chọn phạm vi đếm SL"
            allowClear={false}
            className="w-full"
          />
        </FormFieldCol>
        <FormFieldCol label="Nhãn KM (ngắn)">
          <Input {...register(`${base}.label`)} placeholder="Tặng cốc" />
        </FormFieldCol>
        <FormFieldCol label="Số quà / lần">
          <Input
            type="number"
            min={1}
            placeholder="1"
            className="tabular-nums"
            {...register(`${base}.qty`)}
          />
        </FormFieldCol>
      </div>
    </div>
  )
}

export function ProductUnitGiftsField({
  control,
  register,
  setValue,
  unitIndex,
  unitLabel,
  onPickGiftImage,
  onPickFromCatalog,
}: ProductUnitGiftsFieldProps) {
  const giftsPath = `units.${unitIndex}.gifts` as const
  const { fields, append, remove } = useFieldArray({
    control,
    name: giftsPath,
  })

  const gifts =
    useWatch({
      control,
      name: giftsPath,
    }) ?? []

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(200px,240px)]">
      <div className="space-y-3">
        {fields.map((field, giftIndex) => (
          <GiftRuleCard
            key={field.id}
            control={control}
            register={register}
            setValue={setValue}
            unitIndex={unitIndex}
            giftIndex={giftIndex}
            unitLabel={unitLabel}
            canRemove={fields.length > 1}
            onRemove={() => remove(giftIndex)}
            onPickGiftImage={() => onPickGiftImage(giftIndex)}
            onPickFromCatalog={() => onPickFromCatalog(giftIndex)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => append({ ...EMPTY_GIFT_ROW })}
        >
          <Plus className="size-4" /> Thêm quà tặng
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:sticky lg:top-2">
        <p className="text-xs font-medium text-muted-foreground">
          Xem trước khách hàng
        </p>
        {gifts.length === 0 ? (
          <p className="rounded-lg border bg-card p-3 text-xs text-muted-foreground shadow-sm">
            Chưa có quà tặng — bấm «Thêm quà tặng» để bắt đầu.
          </p>
        ) : (
          gifts.map((gift, i) => (
            <ProductUnitGiftPreview
              key={fields[i]?.id ?? i}
              giftLabel={gift?.label ?? ""}
              giftName={gift?.name ?? ""}
              giftMinQty={gift?.minQty ?? ""}
              giftQty={gift?.qty ?? "1"}
              giftImage={gift?.image ?? ""}
              giftScope={gift?.scope ?? "line"}
              unitLabel={unitLabel}
            />
          ))
        )}
      </div>
    </div>
  )
}
