"use client";

import { useMemo } from "react";
import { AdminDataTable } from "@ui/components/data-table";
import type { Order } from "@/lib/api";
import { getStoreOrderItemColumns } from "./store-order-items-columns";
import type { StoreOrderItemRowActionHandlers } from "./store-order-item-row-actions";
import { mapStoreOrderItemRows, type StoreOrderItemRow } from "./types";

export function StoreOrderItemsTable({
  orderId,
  items,
  actionHandlers,
}: {
  orderId: string;
  items?: Order["items"];
  actionHandlers: StoreOrderItemRowActionHandlers;
}) {
  const rows = useMemo(
    () => mapStoreOrderItemRows(orderId, items),
    [items, orderId],
  );

  const columns = useMemo(
    () => getStoreOrderItemColumns({ actionHandlers }),
    [actionHandlers],
  );

  if (rows.length === 0) {
    return (
      <p className="py-2 text-center text-sm text-muted-foreground">
        Không có sản phẩm trong đơn.
      </p>
    );
  }

  return (
    <AdminDataTable<StoreOrderItemRow>
      embedded
      tableScope={`store-order-${orderId}-items`}
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
  );
}
