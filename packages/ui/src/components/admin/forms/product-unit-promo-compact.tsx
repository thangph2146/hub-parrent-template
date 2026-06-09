"use client"

import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "../../../lib/utils"

export type ProductUnitPromoRuleCardProps = {
  condition: ReactNode
  result: ReactNode
  hint?: string | null
  className?: string
}

/** Một dòng điều kiện SL → kết quả (giá sỉ / bậc giá). */
export function ProductUnitPromoRuleCard({
  condition,
  result,
  hint,
  className,
}: ProductUnitPromoRuleCardProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-2 rounded-lg border border-border/80 bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:gap-3">
        <div className="min-w-0 flex-1">{condition}</div>
        <ArrowRight
          className="mx-auto size-4 shrink-0 text-primary/45 sm:mx-0 sm:rotate-0"
          aria-hidden
        />
        <div className="min-w-0 flex-1">{result}</div>
      </div>
      {hint ? (
        <p className="text-xs text-muted-foreground">
          Quy tắc: <span className="font-medium text-foreground">{hint}</span>
        </p>
      ) : null}
    </div>
  )
}
