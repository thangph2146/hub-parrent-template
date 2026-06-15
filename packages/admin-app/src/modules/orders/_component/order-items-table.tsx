"use client"

import { useMemo } from "react"
import type { OrderItem } from "@workspace/api-client"
import { AdminDataTable } from "@ui/components/data-table"
import { getOrderItemColumns } from "./order-items-columns"
import type { OrderItemRowActionHandlers } from "./order-item-row-actions"
import { mapOrderItemRows, type OrderItemRow } from "./types"

export function OrderItemsTable({
  orderId,
  items,
  actionHandlers,
  getProductDetailHref,
}: {
  orderId: string
  items?: OrderItem[]
  actionHandlers: OrderItemRowActionHandlers
  getProductDetailHref: (productId: string | number) => string
}) {
  const rows = useMemo(
    () => mapOrderItemRows(orderId, items),
    [items, orderId]
  )

  const columns = useMemo(
    () => getOrderItemColumns({ actionHandlers, getProductDetailHref }),
    [actionHandlers, getProductDetailHref]
  )

  if (rows.length === 0) {
    return (
      <p className="py-2 text-center text-sm text-muted-foreground">
        Không có sản phẩm trong đơn.
      </p>
    )
  }

  return (
    <AdminDataTable<OrderItemRow>
      embedded
      tableScope={`order-${orderId}-items`}
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      showTableToolbar={false}
      showColumnFilters={false}
      showTableColumnPicker={false}
      showIndexColumn
      indexColumnLabel="#"
      stickyTableHeader={false}
      horizontalScrollButtons={false}
      emptyLabel="Không có sản phẩm."
    />
  )
}
