"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { Ticket } from "lucide-react"
import { toast } from "@ui/components/sonner"
import { Badge } from "@ui/components/badge"
import { ActiveStatusBadge } from "@ui/components/product"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailPageHeader,
  AdminDetailSidebar,
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
} from "@ui/components/admin"
import {
  FieldSectionField,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useAuth } from "@/providers/auth-provider"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { api } from "@/lib/api"
import { usePromoDetailQuery } from "../_component"

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫"
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN")
}

function PromoDetailInner() {
  const crudNav = useAdminCrudNavigation("/promo-codes")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.PROMO_CODES_UPDATE) ||
      canUserAccess(user, PERMISSION_CODES.PROMO_CODES_MANAGE)
    : false
  const { data: promo, isLoading, isError } = usePromoDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được mã KM")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!promo) return null

  const discountLabel =
    promo.discountKind === "percent"
      ? `${promo.discountPercent}%${
          promo.discountCapVnd
            ? ` (tối đa ${formatVnd(promo.discountCapVnd)})`
            : ""
        }`
      : formatVnd(promo.discountFixed)

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={promo.code}
        subtitle={promo.label}
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(id) : undefined}
      />
      <AdminDetailLayout>
        <AdminDetailMain className="space-y-6">
          <FieldSet variant="section">
            <FieldSectionLegend icon={Ticket} title="Giảm giá" />
            <FieldSetContent
              variant="section"
              className="grid gap-4 sm:grid-cols-2"
            >
              <FieldSectionField label="Mã">
                <span className="font-mono font-medium">{promo.code}</span>
              </FieldSectionField>
              <FieldSectionField label="Nhãn">{promo.label}</FieldSectionField>
              <FieldSectionField label="Kiểu giảm">
                <Badge variant="outline">
                  {promo.discountKind === "percent" ? "Phần trăm" : "Cố định"}
                </Badge>
              </FieldSectionField>
              <FieldSectionField label="Giá trị">{discountLabel}</FieldSectionField>
              <FieldSectionField label="Đơn tối thiểu">
                {formatVnd(promo.minOrderSubtotal)}
              </FieldSectionField>
              <FieldSectionField label="Giới hạn lượt dùng">
                {promo.usageLimit ?? "Không giới hạn"}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar className="space-y-4">
          <FieldSet variant="section">
            <FieldSectionLegend title="Trạng thái" />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <FieldSectionField label="Hoạt động">
                <ActiveStatusBadge
                  active={promo.isActive}
                  activeLabel="Đang bật"
                  inactiveLabel="Đã tắt"
                />
              </FieldSectionField>
              <FieldSectionField label="Đã sử dụng">
                {promo.usageLimit
                  ? `${promo.usageCount}/${promo.usageLimit}`
                  : promo.usageCount}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend title="Thời gian" />
            <FieldSetContent variant="section" className="space-y-2 pt-0">
              <FieldSectionField label="Tạo lúc">
                {formatDate(promo.createdAt)}
              </FieldSectionField>
              <FieldSectionField label="Cập nhật">
                {formatDate(promo.updatedAt)}
              </FieldSectionField>
              {promo.validFrom ? (
                <FieldSectionField label="Hiệu lực từ">
                  {formatDate(promo.validFrom)}
                </FieldSectionField>
              ) : null}
              {promo.validUntil ? (
                <FieldSectionField label="Hết hạn">
                  {formatDate(promo.validUntil)}
                </FieldSectionField>
              ) : null}
            </FieldSetContent>
          </FieldSet>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function PromoDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <PromoDetailInner />
    </AdminPageGuard>
  )
}
