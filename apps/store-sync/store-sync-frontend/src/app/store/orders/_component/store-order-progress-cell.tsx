"use client";

import { cn } from "@ui/lib/utils";
import type { OrderStatus } from "@/lib/api";

const STEPS = ["Đặt", "Giao", "Xong"] as const;

function stepIndex(status: OrderStatus): number {
  if (status === "delivered") return 2;
  if (status === "cancelled") return -1;
  if (status === "shipped" || status === "confirmed") return 1;
  return 0;
}

export function StoreOrderProgressCell({ status }: { status: OrderStatus }) {
  const active = stepIndex(status);

  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
        Đã hủy
      </span>
    );
  }

  return (
    <div className="flex min-w-[7.5rem] items-center gap-1">
      {STEPS.map((label, index) => {
        const done = active >= index;
        const current = active === index;
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                done ? "bg-primary" : "bg-muted",
                current && "ring-2 ring-primary/25",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                done ? "text-primary" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
