"use client";

import { useCallback, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AdminDetailPageHeader,
  AdminPageHeaderOutlineButton,
  AdminPageHeaderPrimaryButton,
  AdminPageLoading,
  AdminPageSection,
  OrderAdminDetail,
  StoreOrderStatusBadge,
} from "@ui/components/admin";
import { formatAdminDateTime } from "@ui/lib/format-admin-datetime";
import { Headphones, ShoppingCart } from "lucide-react";
import { useOpenCartDrawer } from "@/components/shared/cart-drawer";
import { useOrder, useProducts } from "@/hooks/queries";
import { useSession } from "@/hooks/use-session";
import {
  buildSupportPageHref,
  mapStoreOrderRow,
  reorderOrdersToCart,
} from "../_component";

function StoreOrderDetailPageInner() {
  const router = useRouter();
  const openCart = useOpenCartDrawer();
  const session = useSession();
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params.orderId);
  const isValid = Number.isFinite(orderId) && orderId > 0;

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useOrder(isValid && session ? orderId : null, session?.username);
  const { data: products = [] } = useProducts();

  useEffect(() => {
    if (!isError) return;
    toast.error(error?.message ?? "Không tải được đơn hàng");
    router.replace("/store/orders");
  }, [error?.message, isError, router]);

  const handleReorder = useCallback(() => {
    if (!order) return;
    if (!products.length) {
      toast.error("Chưa tải được danh mục sản phẩm để mua lại.");
      return;
    }
    const result = reorderOrdersToCart([mapStoreOrderRow(order)], products);
    if (result.linesAdded === 0) {
      toast.warning(
        result.linesSkipped > 0
          ? "Không thêm được dòng nào — có thể hết hàng hoặc SP đã ngừng bán."
          : "Đơn không có dòng hàng để thêm vào giỏ.",
      );
      return;
    }
    openCart();
    toast.success(`Đã thêm ${result.linesAdded} dòng vào giỏ.`);
  }, [openCart, order, products]);

  const handleSupport = useCallback(() => {
    if (!order) return;
    router.push(buildSupportPageHref([mapStoreOrderRow(order)]));
  }, [order, router]);

  if (!isValid) {
    notFound();
  }

  if (isLoading) {
    return <AdminPageLoading variant="detail" />;
  }

  if (!order) {
    return null;
  }

  if (session && order.customerEmail !== session.username) {
    notFound();
  }

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <span>{order.orderNumber}</span>
            <StoreOrderStatusBadge status={order.status} />
          </span>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-medium text-foreground">
              {order.customerName}
            </span>
            <span className="text-muted-foreground" aria-hidden>
              ·
            </span>
            <span>{formatAdminDateTime(order.createdAt)}</span>
            {order.assignedShipper ? (
              <>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <span className="text-muted-foreground">
                  Shipper: {order.assignedShipper.fullName}
                </span>
              </>
            ) : null}
          </span>
        }
        onBack={() => router.push("/store/orders")}
        backLabel="Danh sách đơn"
        actions={
          <>
            <AdminPageHeaderOutlineButton onClick={handleSupport}>
              <Headphones className="size-4" aria-hidden />
              Hỗ trợ đơn
            </AdminPageHeaderOutlineButton>
            <AdminPageHeaderPrimaryButton onClick={handleReorder}>
              <ShoppingCart className="size-4" aria-hidden />
              Mua lại vào giỏ
            </AdminPageHeaderPrimaryButton>
          </>
        }
      />

      <OrderAdminDetail order={order} />
    </AdminPageSection>
  );
}

export default function StoreOrderDetailPage() {
  return <StoreOrderDetailPageInner />;
}
