"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
} from "@ui/components/admin"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { FormFieldCol } from "@ui/components/typing"
import { Input } from "@ui/components/input"
import { Switch } from "@ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select"
import { Ticket } from "lucide-react"
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
}: {
  form: UseFormReturn<PromoFormValues>
  onSubmit: (values: PromoFormValues) => Promise<void>
  submitting: boolean
  editingId: string | null
  onBack: () => void
  onReset: () => void
}) {
  const { register, watch, setValue } = form
  const kind = watch("discountKind")
  const isActive = watch("isActive")

  return (
    <>
      <AdminFormPageHeader
        title={editingId ? "Sửa mã KM" : "Thêm mã KM"}
        subtitle="Áp dụng lúc checkout qua couponCode — có minOrderSubtotal."
        onBack={onBack}
        onReset={onReset}
        formId="promo-form"
        submitting={submitting}
        isEdit={!!editingId}
      />
      <AdminFormLayout id="promo-form" onSubmit={form.handleSubmit(onSubmit)}>
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend icon={Ticket} title="Mã & giảm giá" />
            <FieldSetContent
              variant="section"
              className="grid gap-4 pt-0 sm:grid-cols-2"
            >
              <FormFieldCol label="Mã" required>
                <Input
                  {...register("code")}
                  disabled={!!editingId}
                  className="font-mono uppercase"
                />
              </FormFieldCol>
              <FormFieldCol label="Nhãn" required>
                <Input {...register("label")} />
              </FormFieldCol>
              <FormFieldCol label="Kiểu giảm">
                <Select
                  value={kind}
                  onValueChange={(v) =>
                    setValue("discountKind", v as PromoDiscountKind)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldCol>
              <FormFieldCol label="Đơn tối thiểu (VND)">
                <Input type="number" {...register("minOrderSubtotal")} />
              </FormFieldCol>
              {kind === "percent" ? (
                <>
                  <FormFieldCol label="Phần trăm">
                    <Input type="number" {...register("discountPercent")} />
                  </FormFieldCol>
                  <FormFieldCol label="Trần giảm (VND)">
                    <Input type="number" {...register("discountCapVnd")} />
                  </FormFieldCol>
                </>
              ) : (
                <FormFieldCol label="Giảm (VND)">
                  <Input type="number" {...register("discountFixed")} />
                </FormFieldCol>
              )}
              <FormFieldCol label="Giới hạn lượt dùng">
                <Input
                  type="number"
                  {...register("usageLimit")}
                  placeholder="Không giới hạn"
                />
              </FormFieldCol>
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>
        <AdminFormSidebar>
          <FieldSet variant="section">
            <FieldSectionLegend title="Trạng thái" />
            <FieldSetContent
              variant="section"
              className="flex items-center justify-between pt-0"
            >
              <span>Đang bật</span>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
      </AdminFormLayout>
    </>
  )
}
