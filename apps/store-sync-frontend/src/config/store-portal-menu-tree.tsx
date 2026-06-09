import { Package, ShoppingCart, Store } from "lucide-react";
import type { AdminMenuTreeItem } from "@ui/components/admin";

/** Menu sidebar cổng quản lý cửa hàng `/store`. */
export const STORE_PORTAL_MENU_TREE: AdminMenuTreeItem[] = [
  {
    type: "leaf",
    href: "/store/orders",
    label: "Đơn hàng",
    icon: Package,
    permission: null,
  },
  {
    type: "group",
    label: "Mua hàng",
    icon: ShoppingCart,
    children: [
      {
        href: "/catalog",
        label: "Danh mục sỉ",
        icon: ShoppingCart,
        permission: null,
      },
      {
        href: "/cart",
        label: "Giỏ hàng",
        icon: ShoppingCart,
        permission: null,
      },
    ],
  },
];
