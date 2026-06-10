"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnFiltersState, RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  AdminDataTable,
  adminTableRowSelectionProps,
  type AdminDataTableBulkAction,
} from "@ui/components/data-table";
import {
  AdminListPageHeader,
  AdminPageSection,
} from "@ui/components/admin";
import { Button } from "@ui/components/button";
import {
  Copy,
  Headphones,
  Package,
  PackagePlus,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { useOpenCartDrawer } from "@/components/shared/cart-drawer";
import { useOrders, useProducts } from "@/hooks/queries";
import { useSession } from "@/hooks/use-session";
import {
  buildOrderSummaryText,
  buildOrdersSupportMessage,
  buildSupportPageHref,
  copyTextToClipboard,
  getStoreOrderColumns,
  getStoreOrderGlobalFilterText,
  mapStoreOrderRow,
  matchesStoreOrderStatusGroup,
  reorderOrderLineToCart,
  reorderOrdersToCart,
  StoreOrderItemsTable,
  type StoreOrderItemRow,
  type StoreOrderItemRowActionHandlers,
  type StoreOrderRow,
  type StoreOrderRowActionHandlers,
  type StoreOrderStatusGroup,
} from "./_component";
import { StoreOrdersStatCards } from "./_component/store-orders-stat-cards";

function StoreOrdersPageInner() {
  const router = useRouter();
  const session = useSession();
  const openCart = useOpenCartDrawer();
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusGroup, setStatusGroup] = useState<StoreOrderStatusGroup>("all");
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({});
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useOrders(session?.username);
  const { data: products = [] } = useProducts();

  const rows = useMemo(
    () => (data ?? []).map(mapStoreOrderRow),
    [data],
  );

  const rowsForTable = useMemo(
    () =>
      rows.filter((row) => matchesStoreOrderStatusGroup(row.status, statusGroup)),
    [rows, statusGroup],
  );

  const openDetail = useCallback(
    (row: StoreOrderRow) => {
      router.push(`/store/orders/${row.id}`);
    },
    [router],
  );

  const handleReorder = useCallback(
    async (orders: StoreOrderRow[]) => {
      if (!products.length) {
        toast.error("Chưa tải được danh mục sản phẩm để mua lại.");
        return;
      }
      const result = reorderOrdersToCart(orders, products);
      if (result.linesAdded === 0) {
        toast.warning(
          result.linesSkipped > 0
            ? "Không thêm được dòng nào — có thể hết hàng hoặc SP đã ngừng bán."
            : "Đơn không có dòng hàng để thêm vào giỏ.",
        );
        return;
      }
      openCart();
      const skipped =
        result.linesSkipped > 0
          ? ` (${result.linesSkipped} dòng bỏ qua)`
          : "";
      toast.success(
        `Đã thêm ${result.linesAdded} dòng vào giỏ từ ${result.ordersProcessed} đơn${skipped}.`,
      );
    },
    [openCart, products],
  );

  const handleCopyCode = useCallback(async (order: StoreOrderRow) => {
    const ok = await copyTextToClipboard(order.orderNumber);
    if (ok) toast.success(`Đã sao chép ${order.orderNumber}`);
    else toast.error("Không sao chép được mã đơn.");
  }, []);

  const handleCopySummary = useCallback(async (order: StoreOrderRow) => {
    const ok = await copyTextToClipboard(buildOrderSummaryText(order));
    if (ok) toast.success("Đã sao chép tóm tắt đơn.");
    else toast.error("Không sao chép được nội dung.");
  }, []);

  const handleContactSupport = useCallback(
    (orders: StoreOrderRow[]) => {
      if (orders.length === 1) {
        void copyTextToClipboard(buildOrdersSupportMessage(orders));
      }
      router.push(buildSupportPageHref(orders));
    },
    [router],
  );

  const actionHandlers = useMemo<StoreOrderRowActionHandlers>(
    () => ({
      onViewDetail: openDetail,
      onReorder: async (order) => {
        setBusyOrderId(order.id);
        try {
          await handleReorder([order]);
        } finally {
          setBusyOrderId(null);
        }
      },
      onCopyCode: handleCopyCode,
      onCopySummary: handleCopySummary,
      onContactSupport: (order) => handleContactSupport([order]),
      busyOrderId,
    }),
    [
      busyOrderId,
      handleContactSupport,
      handleCopyCode,
      handleCopySummary,
      handleReorder,
      openDetail,
    ],
  );

  const columns = useMemo(
    () => getStoreOrderColumns({ actionHandlers }),
    [actionHandlers],
  );

  const bulkActions = useMemo<AdminDataTableBulkAction<StoreOrderRow>[]>(
    () => [
      {
        id: "bulk-reorder",
        label: "Mua lại vào giỏ",
        icon: <ShoppingCart className="size-4" aria-hidden />,
        variant: "default",
        confirm: {
          title: "Mua lại các đơn đã chọn?",
          description: (selected) =>
            `Thêm sản phẩm từ ${selected.length} đơn vào giỏ hiện tại. Dòng hết hàng hoặc ngừng bán sẽ được bỏ qua.`,
          confirmLabel: "Thêm vào giỏ",
        },
        onAction: (selected) => handleReorder(selected),
        clearSelectionOnSuccess: true,
      },
      {
        id: "bulk-copy-codes",
        label: "Sao chép mã đơn",
        icon: <Copy className="size-4" aria-hidden />,
        variant: "outline",
        confirm: false,
        onAction: async (selected) => {
          const text = selected.map((row) => row.orderNumber).join("\n");
          const ok = await copyTextToClipboard(text);
          if (ok) toast.success(`Đã sao chép ${selected.length} mã đơn.`);
          else toast.error("Không sao chép được.");
        },
        clearSelectionOnSuccess: true,
      },
      {
        id: "bulk-support",
        label: "Hỗ trợ đơn đã chọn",
        icon: <Headphones className="size-4" aria-hidden />,
        variant: "outline",
        confirm: false,
        onAction: (selected) => handleContactSupport(selected),
        clearSelectionOnSuccess: true,
      },
    ],
    [handleContactSupport, handleReorder],
  );

  const clearFilters = useCallback(() => {
    setGlobalFilter("");
    setColumnFilters([]);
    setStatusGroup("all");
  }, []);

  const getRowClassName = useCallback((row: { original: StoreOrderRow }) => {
    if (row.original.status === "cancelled") {
      return "bg-destructive/[0.03] hover:bg-destructive/[0.06]";
    }
    if (row.original.status === "delivered") {
      return "bg-success/[0.03] hover:bg-success/[0.06]";
    }
    return undefined;
  }, []);

  const itemActionHandlers = useMemo<StoreOrderItemRowActionHandlers>(
    () => ({
      onViewProduct: (item) => {
        router.push(`/catalog/${item.productId}`);
      },
      onReorderLine: async (item) => {
        if (!products.length) {
          toast.error("Chưa tải được danh mục sản phẩm để mua lại.");
          return;
        }
        setBusyItemId(item.id);
        try {
          const result = reorderOrderLineToCart(item, products);
          if (result === "added") {
            openCart();
            toast.success(`Đã thêm ${item.name} vào giỏ.`);
          } else {
            toast.warning("Không thêm được — có thể hết hàng hoặc SP đã ngừng bán.");
          }
        } finally {
          setBusyItemId(null);
        }
      },
      onCopySku: async (item: StoreOrderItemRow) => {
        const ok = await copyTextToClipboard(item.sku);
        if (ok) toast.success(`Đã sao chép ${item.sku}`);
        else toast.error("Không sao chép được SKU.");
      },
      busyItemId,
    }),
    [busyItemId, openCart, products, router],
  );

  const renderExpandedRow = useCallback(
    (row: { original: StoreOrderRow }) => (
      <StoreOrderItemsTable
        orderId={row.original.id}
        items={row.original.items}
        actionHandlers={itemActionHandlers}
      />
    ),
    [itemActionHandlers],
  );

  const getRowCanExpand = useCallback(
    (row: { original: StoreOrderRow }) => (row.original.items?.length ?? 0) > 0,
    [],
  );

  return (
    <AdminPageSection className="space-y-6">
      <AdminListPageHeader
        icon={Package}
        title="Đơn hàng của cửa hàng"
        subtitle="Bấm mũi tên để mở bảng sản phẩm trong đơn — lọc, thao tác đơn hoặc hàng loạt"
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/catalog">
              <Button size="lg" className="h-11 w-full font-bold sm:w-auto">
                <PackagePlus className="mr-2 size-4" />
                Đặt hàng mới
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => void refetch()}
              className="h-11 font-bold"
            >
              <RefreshCw
                className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </div>
        }
      />

      <StoreOrdersStatCards
        orders={rows}
        activeGroup={statusGroup}
        onGroupChange={setStatusGroup}
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center">
          <p className="text-lg font-bold text-destructive">
            Không tải được đơn hàng
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      ) : (
        <AdminDataTable<StoreOrderRow>
          tableScope="store-orders"
          data={rowsForTable}
          getRowId={(row) => row.id}
          defaultExpandedAll={false}
          renderExpandedRow={renderExpandedRow}
          getRowCanExpand={getRowCanExpand}
          columns={columns}
          isLoading={loading}
          emptyLabel={
            statusGroup === "all"
              ? "Chưa có đơn hàng. Hãy đặt hàng từ danh mục sỉ."
              : "Không có đơn phù hợp nhóm trạng thái này."
          }
          getGlobalFilterText={getStoreOrderGlobalFilterText}
          globalFilterPlaceholder="Tìm mã đơn, email, SĐT, địa chỉ, SKU, tên hàng…"
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onClearFilters={clearFilters}
          getRowClassName={getRowClassName}
          clientPagination={{
            initialPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
            itemLabel: "đơn",
          }}
          xlsxExport={{
            fileName: "don-hang-cua-hang.xlsx",
            sheetName: "Đơn hàng",
            title: "Đơn hàng cửa hàng",
            subtitle: session?.displayName ?? session?.username,
            metadata: [
              { label: "Đại lý", value: session?.displayName ?? "—" },
              { label: "Email", value: session?.username ?? "—" },
            ],
          }}
          {...adminTableRowSelectionProps(selectedRowIds, setSelectedRowIds)}
          bulkActions={bulkActions}
          onRowPointerEnter={(row) => {
            router.prefetch(`/store/orders/${row.original.id}`);
          }}
        />
      )}
    </AdminPageSection>
  );
}

export default function StoreOrdersPage() {
  return <StoreOrdersPageInner />;
}
