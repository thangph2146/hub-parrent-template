"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "@ui/components/sonner"
import {
  AdminDetailPageHeader,
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
  PromoAdminDetail,
} from "@ui/components/admin"
import { Badge } from "@ui/components/badge"
import { ActiveStatusBadge } from "@ui/components/product"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useAuth } from "@/providers/auth-provider"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { api } from "@/lib/api"
import { usePromoDetailQuery } from "../_component"

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

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <Badge variant="coupon" className="font-mono text-sm">
              {promo.code}
            </Badge>
            <ActiveStatusBadge
              active={promo.isActive}
              activeLabel="Đang bật"
              inactiveLabel="Đã tắt"
            />
          </span>
        }
        subtitle={promo.label}
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(id) : undefined}
      />

      <PromoAdminDetail promo={promo} />
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
