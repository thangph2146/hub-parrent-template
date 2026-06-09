"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, MapPin, Phone } from "lucide-react";
import {
  DATA_TABLE_ACTIONS_COLUMN_ID,
  formatAdminDateTime,
} from "@ui/components/data-table";
import {
  ORDER_STATUS_LABELS,
  StoreOrderStatusBadge,
} from "@ui/components/product";
import type { OrderStatus } from "@/lib/api";
import { formatVND } from "@/lib/format";
import { StoreOrderProgressCell } from "./store-order-progress-cell";
import {
  StoreOrderRowActions,
  storeOrderActionsColumnMeta,
  type StoreOrderRowActionHandlers,
} from "./store-order-row-actions";
import { type StoreOrderRow, STORE_ORDER_STATUSES } from "./types";

const ORDER_STATUS_FILTER_OPTIONS = STORE_ORDER_STATUSES.map((value) => ({
  value,
  label: ORDER_STATUS_LABELS[value],
}));

export function getStoreOrderGlobalFilterText(row: StoreOrderRow): string {
  return [
    row.orderNumber,
    row.customerName,
    row.customerEmail,
    row.customerPhone ?? "",
    row.shippingAddress ?? "",
    ...(row.items?.map((item) => `${item.name} ${item.sku}`) ?? []),
  ]
    .join(" ")
    .trim();
}

export function getStoreOrderColumns({
  actionHandlers,
}: {
  actionHandlers: StoreOrderRowActionHandlers;
}): ColumnDef<StoreOrderRow>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: "Mã đơn",
      enableColumnFilter: true,
      meta: {
        filterVariant: "text",
        filterLabel: "Mã đơn",
        filterPlaceholder: "Nhập mã đơn…",
      },
      cell: ({ row, getValue }) => {
        const order = row.original;
        const items = order.items ?? [];
        const preview = items[0]?.name;
        const extra = items.length > 1 ? ` · ${items.length} dòng` : "";
        return (
          <div className="min-w-[9rem]">
            <button
              type="button"
              className="font-mono text-sm font-semibold text-foreground underline-offset-2 hover:text-primary hover:underline"
              onClick={() => actionHandlers.onViewDetail(order)}
            >
              {String(getValue())}
            </button>
            {preview ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {preview}
                {extra}
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "progress",
      header: "Tiến độ",
      enableColumnFilter: false,
      enableSorting: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => (
        <StoreOrderProgressCell status={row.original.status} />
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        filterVariant: "select",
        filterLabel: "Trạng thái",
        selectOptions: ORDER_STATUS_FILTER_OPTIONS,
      },
      cell: ({ getValue }) => (
        <StoreOrderStatusBadge status={getValue() as OrderStatus} />
      ),
    },
    {
      id: "itemsCount",
      header: "Dòng",
      enableColumnFilter: false,
      meta: { disableColumnFilter: true },
      cell: ({ row }) => (
        <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold tabular-nums">
          {row.original.items?.length ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng tiền",
      enableColumnFilter: true,
      enableSorting: true,
      meta: {
        filterVariant: "number-range",
        filterLabel: "Tổng tiền",
        numberRangeMinPlaceholder: "Từ (₫)",
        numberRangeMaxPlaceholder: "Đến (₫)",
      },
      cell: ({ getValue }) => (
        <span className="font-bold tabular-nums text-primary">
          {formatVND(Number(getValue()) || 0)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày đặt",
      enableColumnFilter: true,
      enableSorting: true,
      meta: {
        filterVariant: "date-range",
        filterLabel: "Ngày đặt",
        filterPlaceholder: "Chọn khoảng ngày",
        className: "w-[180px] min-w-[180px] max-w-[185px]",
        exportHeader: "Ngày đặt",
        exportValue: (row: StoreOrderRow) => {
          const formatted = formatAdminDateTime(row.createdAt);
          return formatted === "—" ? "" : formatted;
        },
      },
      cell: ({ getValue }) => {
        const formatted = formatAdminDateTime(getValue() as string);
        return (
          <span className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            {formatted}
          </span>
        );
      },
    },
    {
      accessorKey: "customerPhone",
      header: "SĐT",
      enableColumnFilter: true,
      meta: {
        filterVariant: "text",
        filterLabel: "Số điện thoại",
        filterPlaceholder: "SĐT nhận hàng…",
        defaultHidden: true,
      },
      cell: ({ getValue }) => {
        const phone = String(getValue() ?? "").trim();
        if (!phone) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Phone className="size-3.5 text-muted-foreground" aria-hidden />
            {phone}
          </span>
        );
      },
    },
    {
      accessorKey: "shippingAddress",
      header: "Địa chỉ giao",
      enableColumnFilter: true,
      meta: {
        filterVariant: "text",
        filterLabel: "Địa chỉ",
        filterPlaceholder: "Địa chỉ nhận hàng…",
        defaultHidden: true,
      },
      cell: ({ getValue }) => {
        const address = String(getValue() ?? "").trim();
        if (!address) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="inline-flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-2">{address}</span>
          </span>
        );
      },
    },
    {
      id: DATA_TABLE_ACTIONS_COLUMN_ID,
      header: "Thao tác",
      enableSorting: false,
      enableColumnFilter: false,
      meta: storeOrderActionsColumnMeta,
      cell: ({ row }) => (
        <StoreOrderRowActions
          order={row.original}
          handlers={actionHandlers}
        />
      ),
    },
  ];
}
