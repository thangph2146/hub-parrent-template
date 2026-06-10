import type { LucideIcon } from "lucide-react";
import {
  CircleCheckBig,
  Layers,
  OctagonX,
  Truck,
} from "lucide-react";
import type { OrderStatus } from "@/lib/api";

export type StoreOrderStatusGroup =
  | "all"
  | "shipping"
  | "completed"
  | "cancelled";

export type StoreOrderStatusGroupOption = {
  key: StoreOrderStatusGroup;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  tone: string;
};

export const STORE_ORDER_STATUS_GROUPS: StoreOrderStatusGroupOption[] = [
  {
    key: "all",
    label: "Tất cả đơn",
    shortLabel: "Tất cả",
    icon: Layers,
    tone: "text-foreground bg-muted",
  },
  {
    key: "shipping",
    label: "Đang xử lý / giao",
    shortLabel: "Đang giao",
    icon: Truck,
    tone: "text-primary bg-primary/10",
  },
  {
    key: "completed",
    label: "Đã giao thành công",
    shortLabel: "Đã giao",
    icon: CircleCheckBig,
    tone: "text-success bg-success/15",
  },
  {
    key: "cancelled",
    label: "Đã hủy",
    shortLabel: "Đã hủy",
    icon: OctagonX,
    tone: "text-destructive bg-destructive/10",
  },
];

export function toStoreOrderStatusGroup(
  status: OrderStatus,
): Exclude<StoreOrderStatusGroup, "all"> {
  if (status === "delivered") return "completed";
  if (status === "cancelled") return "cancelled";
  return "shipping";
}

export function matchesStoreOrderStatusGroup(
  status: OrderStatus,
  group: StoreOrderStatusGroup,
): boolean {
  if (group === "all") return true;
  return toStoreOrderStatusGroup(status) === group;
}
