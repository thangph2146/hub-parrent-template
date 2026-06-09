"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent } from "@ui/components/card";
import { cn } from "@ui/lib/utils";
import type { OrderStatus } from "@/lib/api";
import {
  STORE_ORDER_STATUS_GROUPS,
  matchesStoreOrderStatusGroup,
  type StoreOrderStatusGroup,
} from "./store-order-status-groups";
import type { StoreOrderRow } from "./types";

export function StoreOrdersStatCards({
  orders,
  activeGroup,
  onGroupChange,
}: {
  orders: StoreOrderRow[];
  activeGroup: StoreOrderStatusGroup;
  onGroupChange: (group: StoreOrderStatusGroup) => void;
}) {
  const counts = STORE_ORDER_STATUS_GROUPS.reduce(
    (acc, option) => {
      if (option.key === "all") {
        acc[option.key] = orders.length;
        return acc;
      }
      acc[option.key] = orders.filter((order) =>
        matchesStoreOrderStatusGroup(order.status, option.key),
      ).length;
      return acc;
    },
    {} as Record<StoreOrderStatusGroup, number>,
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {STORE_ORDER_STATUS_GROUPS.map((option) => {
        const active = activeGroup === option.key;
        const Icon = option.icon;
        return (
          <Button
            key={option.key}
            type="button"
            variant="ghost"
            onClick={() => onGroupChange(option.key)}
            className="h-auto w-full whitespace-normal p-0 text-left font-normal text-foreground shadow-none hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Card
              className={cn(
                "h-full w-full cursor-pointer border-outline-variant bg-background transition-all",
                active
                  ? "border-primary shadow-md ring-1 ring-primary/20"
                  : "hover:border-primary/40 hover:shadow-sm",
              )}
            >
              <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {option.shortLabel}
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums text-foreground">
                    {counts[option.key]}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {option.label}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12",
                    option.tone,
                  )}
                >
                  <Icon className="size-5 sm:size-6" aria-hidden />
                </div>
              </CardContent>
            </Card>
          </Button>
        );
      })}
    </div>
  );
}

export function countOrdersByStatus(
  orders: StoreOrderRow[],
  status: OrderStatus,
): number {
  return orders.filter((order) => order.status === status).length;
}
