"use client"

import { Tag, Ticket } from "lucide-react"
import {
  AdminFormMain,
  AdminFormSidebar,
} from "../admin/pages/admin-form-layout"
import { ActiveStatusBadge } from "../badge-presets"
import { Badge } from "../badge"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "../field"
import { Input } from "../input"
import { Switch } from "../switch"
import { FormFieldCol } from "../typing"
import { cn } from "../../lib/utils"
import { PromoAdminDiscountKindPicker } from "./promo-admin-discount-kind-picker"
import type { PromoAdminFormFields } from "./promo-admin-form-types"
import {
  formatPromoUsageCount,
  formatPromoUsageLimit,
  previewPromoFromFormFields,
  promoUsagePercent,
} from "./promo-admin-format"
import { PromoAdminHeroCard } from "./promo-admin-hero-card"

export type PromoAdminEditFormProps = {
  fields: PromoAdminFormFields
  onFieldChange: <K extends keyof PromoAdminFormFields>(
    key: K,
    value: PromoAdminFormFields[K],
  ) => void
  codeDisabled?: boolean
  usageCount?: number
}

function UsageStat({
  usageCount,
  usageLimitStr,
}: {
  usageCount: number
  usageLimitStr: string
}) {
  const limitTrim = usageLimitStr.trim()
  const usageLimit = limitTrim ? Math.max(1, Math.floor(Number(limitTrim))) : null
  const percent = promoUsagePercent(usageCount, usageLimit)

  if (percent == null) {
    return (
      <p className="text-sm">
        <span className="font-semibold tabular-nums text-foreground">
          {usageCount.toLocaleString("vi-VN")}
        </span>
        <span className="text-muted-foreground"> lượt đã dùng</span>
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold tabular-nums">
        {formatPromoUsageCount(usageCount, usageLimit)}
      </p>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 90 ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function PromoAdminEditForm({
  fields,
  onFieldChange,
  codeDisabled = false,
  usageCount,
}: PromoAdminEditFormProps) {
  const preview = previewPromoFromFormFields(fields)
  const isPercent = fields.discountKind === "percent"

  return (
    <>
      <AdminFormMain>
        <FieldSet variant="section">
          <FieldSectionLegend
            icon={Ticket}
            title="Mã & giảm giá"
            description="Khách nhập mã tại checkout — áp dụng khi đơn đạt đơn tối thiểu."
          />
          <FieldSetContent
            variant="section"
            className="grid gap-5 pt-0 sm:grid-cols-2"
          >
            <FormFieldCol
              label="Mã coupon"
              required
              description={
                codeDisabled
                  ? "Mã không đổi sau khi tạo — tạo mã mới nếu cần đổi."
                  : "Chữ in hoa, không dấu — ví dụ GIAM50K."
              }
              className="sm:col-span-2"
            >
              {codeDisabled ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-outline-variant/40 bg-muted/30 px-3 py-2">
                  <Badge variant="coupon" className="font-mono text-sm">
                    {fields.code || "—"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Không thể sửa
                  </span>
                </div>
              ) : (
                <Input
                  value={fields.code}
                  onChange={(e) =>
                    onFieldChange("code", e.target.value.toUpperCase())
                  }
                  className="font-mono uppercase"
                  placeholder="GIAM50K"
                />
              )}
            </FormFieldCol>

            <FormFieldCol
              label="Nhãn hiển thị"
              required
              description="Hiện trong admin và gợi ý cho khách tại checkout."
              className="sm:col-span-2"
            >
              <Input
                value={fields.label}
                onChange={(e) => onFieldChange("label", e.target.value)}
                placeholder="Giảm 50.000đ cho đơn từ 200K"
              />
            </FormFieldCol>

            <FormFieldCol
              label="Kiểu giảm"
              className="sm:col-span-2"
            >
              <PromoAdminDiscountKindPicker
                value={fields.discountKind}
                onChange={(kind) => onFieldChange("discountKind", kind)}
              />
            </FormFieldCol>

            {isPercent ? (
              <>
                <FormFieldCol
                  label="Phần trăm giảm"
                  description="0–100% trên tổng đơn sau khi đạt min."
                >
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={fields.discountPercent}
                    onChange={(e) =>
                      onFieldChange("discountPercent", e.target.value)
                    }
                    className="tabular-nums"
                  />
                </FormFieldCol>
                <FormFieldCol
                  label="Trần giảm (VND)"
                  description="Để trống nếu không giới hạn trần."
                >
                  <Input
                    type="number"
                    min={0}
                    value={fields.discountCapVnd}
                    onChange={(e) =>
                      onFieldChange("discountCapVnd", e.target.value)
                    }
                    placeholder="Không giới hạn"
                    className="tabular-nums"
                  />
                </FormFieldCol>
              </>
            ) : (
              <FormFieldCol
                label="Số tiền giảm (VND)"
                description="Trừ trực tiếp vào tổng đơn."
                className="sm:col-span-2"
              >
                <Input
                  type="number"
                  min={0}
                  value={fields.discountFixed}
                  onChange={(e) =>
                    onFieldChange("discountFixed", e.target.value)
                  }
                  className="tabular-nums"
                />
              </FormFieldCol>
            )}

            <FormFieldCol
              label="Đơn tối thiểu"
              description="Tổng đơn phải đạt mức này mới áp dụng mã."
            >
              <Input
                type="number"
                min={0}
                value={fields.minOrderSubtotal}
                onChange={(e) =>
                  onFieldChange("minOrderSubtotal", e.target.value)
                }
                className="tabular-nums"
              />
            </FormFieldCol>

            <FormFieldCol
              label="Giới hạn lượt dùng"
              description="Để trống = không giới hạn toàn hệ thống."
            >
              <Input
                type="number"
                min={1}
                value={fields.usageLimit}
                onChange={(e) => onFieldChange("usageLimit", e.target.value)}
                placeholder="Không giới hạn"
                className="tabular-nums"
              />
            </FormFieldCol>
          </FieldSetContent>
        </FieldSet>
      </AdminFormMain>

      <AdminFormSidebar className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <PromoAdminHeroCard promo={preview} />

        <FieldSet variant="section">
          <FieldSectionLegend
            icon={Tag}
            title="Trạng thái"
            description="Tắt mã để ngừng áp dụng tại checkout."
          />
          <FieldSetContent
            variant="section"
            className="flex items-center justify-between gap-3 pt-0"
          >
            <ActiveStatusBadge
              active={fields.isActive}
              activeLabel="Đang bật"
              inactiveLabel="Đã tắt"
            />
            <Switch
              checked={fields.isActive}
              onCheckedChange={(v) => onFieldChange("isActive", v)}
              aria-label="Bật hoặc tắt mã khuyến mãi"
            />
          </FieldSetContent>
        </FieldSet>

        {usageCount != null ? (
          <FieldSet variant="section">
            <FieldSectionLegend title="Thống kê" />
            <FieldSetContent variant="section" className="space-y-2 pt-0">
              <UsageStat
                usageCount={usageCount}
                usageLimitStr={fields.usageLimit}
              />
              <p className="text-xs text-muted-foreground">
                Giới hạn: {formatPromoUsageLimit(
                  fields.usageLimit.trim()
                    ? Math.max(1, Math.floor(Number(fields.usageLimit)))
                    : null,
                )}
              </p>
            </FieldSetContent>
          </FieldSet>
        ) : null}
      </AdminFormSidebar>
    </>
  )
}
