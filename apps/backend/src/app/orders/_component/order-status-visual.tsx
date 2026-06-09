import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2,
  CircleCheckBig,
  Clock3,
  OctagonX,
  Truck,
} from "lucide-react"
import type { OrderStatus } from "@workspace/api-client"

export type OrderStatusVisual = {
  icon: LucideIcon
  iconBgClassName: string
  iconClassName: string
}

export const ORDER_STATUS_VISUAL: Record<OrderStatus, OrderStatusVisual> = {
  pending: {
    icon: Clock3,
    iconBgClassName: "bg-amber-500/15",
    iconClassName: "text-amber-700 dark:text-amber-400",
  },
  confirmed: {
    icon: CheckCircle2,
    iconBgClassName: "bg-violet-500/15",
    iconClassName: "text-violet-700 dark:text-violet-400",
  },
  shipped: {
    icon: Truck,
    iconBgClassName: "bg-sky-500/15",
    iconClassName: "text-sky-700 dark:text-sky-400",
  },
  delivered: {
    icon: CircleCheckBig,
    iconBgClassName: "bg-emerald-500/15",
    iconClassName: "text-emerald-700 dark:text-emerald-400",
  },
  cancelled: {
    icon: OctagonX,
    iconBgClassName: "bg-red-500/15",
    iconClassName: "text-red-600 dark:text-red-400",
  },
}
