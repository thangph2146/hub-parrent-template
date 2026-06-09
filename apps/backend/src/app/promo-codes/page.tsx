"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Ticket } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { ActiveStatusBadge } from "@ui/components/product"
import { AdminDataTable } from "@ui/components/data-table"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageHeaderPrimaryButton,
  AdminPageSection,
} from "@ui/components/admin"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { api } from "@/lib/api"
import type { PromoCode } from "@workspace/api-client"

type PromoRow = Omit<PromoCode, "id"> & { id: string }

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫"
}

function PromoCodesPageInner() {
  const crudNav = useAdminCrudNavigation("/promo-codes")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [globalFilter, setGlobalFilter] = useState("")

  const listQuery = useQuery({
    queryKey: ["promo-codes", "list", page, pageSize, globalFilter],
    queryFn: async () => {
      const result = await api.promoCodes.list({
        page,
        limit: pageSize,
        q: globalFilter.trim() || undefined,
      })
      return {
        items: result.items.map((row) => ({ ...row, id: String(row.id) })),
        total: result.total,
      }
    },
  })

  const columns = useMemo<ColumnDef<PromoRow>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Mã",
        cell: ({ row, getValue }) => (
          <button
            type="button"
            className="font-mono font-medium hover:text-primary"
            onClick={() => crudNav.edit(row.original.id)}
          >
            {String(getValue())}
          </button>
        ),
      },
      { accessorKey: "label", header: "Mô tả" },
      {
        accessorKey: "discountKind",
        header: "Kiểu",
        cell: ({ getValue }) => (getValue() === "percent" ? "%" : "Cố định"),
      },
      {
        id: "value",
        header: "Giá trị",
        cell: ({ row }) =>
          row.original.discountKind === "percent"
            ? `${row.original.discountPercent}%`
            : formatVnd(row.original.discountFixed),
      },
      {
        accessorKey: "minOrderSubtotal",
        header: "Đơn tối thiểu",
        cell: ({ getValue }) => formatVnd(Number(getValue()) || 0),
      },
      {
        accessorKey: "usageCount",
        header: "Đã dùng",
        cell: ({ row }) => {
          const limit = row.original.usageLimit
          const used = row.original.usageCount
          return limit ? `${used}/${limit}` : String(used)
        },
      },
      {
        accessorKey: "isActive",
        header: "TT",
        cell: ({ getValue }) => (
          <ActiveStatusBadge
            active={Boolean(getValue())}
            activeLabel="Bật"
            inactiveLabel="Tắt"
          />
        ),
      },
    ],
    [crudNav]
  )

  return (
    <AdminPageSection>
      <AdminListPageHeader
        title="Mã khuyến mãi"
        subtitle="Checkout gửi couponCode — server tính discountAmount."
        icon={Ticket}
        actions={
          <AdminPageHeaderPrimaryButton
            type="button"
            onClick={() => crudNav.new()}
          >
            <Plus className="size-5" aria-hidden /> Thêm mã
          </AdminPageHeaderPrimaryButton>
        }
      />
      <AdminDataTable<PromoRow>
        tableScope="promo-codes"
        data={listQuery.data?.items ?? []}
        getRowId={(row) => row.id}
        columns={columns}
        isLoading={listQuery.isLoading}
        emptyLabel="Chưa có mã KM."
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onClearFilters={() => setGlobalFilter("")}
        pagination={{
          mode: "server",
          page,
          pageSize,
          total: listQuery.data?.total ?? 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </AdminPageSection>
  )
}

export default function PromoCodesPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <PromoCodesPageInner />
    </AdminPageGuard>
  )
}
