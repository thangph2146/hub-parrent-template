"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm, useWatch, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import {
  AdminFormLayout,
  AdminFormPageHeader,
  PromoAdminEditForm,
  type PromoAdminEditFormProps,
  type PromoAdminFormFields,
} from "@ui/components/admin"
import type {
  CreatePromoCodeInput,
  PromoDiscountKind,
} from "@workspace/api-client"

const schema = z.object({
  code: z.string().min(1, "Bắt buộc"),
  label: z.string().min(1, "Bắt buộc"),
  discountKind: z.enum(["fixed", "percent"]),
  discountFixed: z.string(),
  discountPercent: z.string(),
  discountCapVnd: z.string(),
  minOrderSubtotal: z.string(),
  usageLimit: z.string(),
  isActive: z.boolean(),
})

export type PromoFormValues = z.infer<typeof schema>

export function usePromoForm(defaults?: Partial<PromoFormValues>) {
  const form = useForm<PromoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      label: "",
      discountKind: "percent",
      discountFixed: "0",
      discountPercent: "10",
      discountCapVnd: "",
      minOrderSubtotal: "0",
      usageLimit: "",
      isActive: true,
      ...defaults,
    },
  })
  return { form }
}

export function promoToFormValues(promo: {
  code: string
  label: string
  discountKind: PromoDiscountKind
  discountFixed: number
  discountPercent: number
  discountCapVnd?: number | null
  minOrderSubtotal: number
  usageLimit?: number | null
  isActive: boolean
}): PromoFormValues {
  return {
    code: promo.code,
    label: promo.label,
    discountKind: promo.discountKind,
    discountFixed: String(promo.discountFixed ?? 0),
    discountPercent: String(promo.discountPercent ?? 0),
    discountCapVnd:
      promo.discountCapVnd != null ? String(promo.discountCapVnd) : "",
    minOrderSubtotal: String(promo.minOrderSubtotal ?? 0),
    usageLimit: promo.usageLimit != null ? String(promo.usageLimit) : "",
    isActive: promo.isActive,
  }
}

function buildPromoBody(
  values: PromoFormValues
): Omit<CreatePromoCodeInput, "code"> {
  const cap = values.discountCapVnd.trim()
  const limit = values.usageLimit.trim()
  return {
    label: values.label.trim(),
    discountKind: values.discountKind,
    discountFixed: Math.max(0, Math.floor(Number(values.discountFixed) || 0)),
    discountPercent: Math.max(
      0,
      Math.min(100, Math.floor(Number(values.discountPercent) || 0))
    ),
    discountCapVnd: cap ? Math.max(0, Math.floor(Number(cap))) : null,
    minOrderSubtotal: Math.max(
      0,
      Math.floor(Number(values.minOrderSubtotal) || 0)
    ),
    usageLimit: limit ? Math.max(1, Math.floor(Number(limit))) : null,
    isActive: values.isActive,
  }
}

export function buildPromoPayload(
  values: PromoFormValues
): CreatePromoCodeInput {
  return {
    code: values.code.trim().toUpperCase(),
    ...buildPromoBody(values),
  }
}

export function buildPromoUpdatePayload(
  values: PromoFormValues
): Omit<CreatePromoCodeInput, "code"> {
  return buildPromoBody(values)
}

export function PromoFormShell({
  form,
  onSubmit,
  submitting,
  editingId,
  onBack,
  onReset,
  headerTitle,
  headerSubtitle,
  usageCount,
}: {
  form: UseFormReturn<PromoFormValues>
  onSubmit: (values: PromoFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
  headerTitle?: ReactNode
  headerSubtitle?: ReactNode
  usageCount?: number
}) {
  const { control, setValue } = form
  // useWatch (không phải watch()) — re-render khi setValue trên field controlled không register
  const watched = useWatch({ control })
  const fields = (watched ?? form.getValues()) as PromoAdminFormFields

  const handleFieldChange: PromoAdminEditFormProps["onFieldChange"] = (
    key,
    value
  ) => {
    setValue(key, value as never, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  return (
    <>
      <AdminFormPageHeader
        title={
          headerTitle ?? (editingId ? "Sửa mã KM" : "Thêm mã KM")
        }
        subtitle={
          headerSubtitle ??
          "Cấu hình mã áp dụng tại checkout storefront."
        }
        onBack={onBack}
        onReset={onReset}
        formId="promo-form"
        submitting={submitting}
        isEdit={!!editingId}
      />
      <AdminFormLayout id="promo-form" onSubmit={form.handleSubmit(onSubmit)}>
        <PromoAdminEditForm
          fields={fields}
          onFieldChange={handleFieldChange}
          codeDisabled={!!editingId}
          usageCount={usageCount}
        />
      </AdminFormLayout>
    </>
  )
}
