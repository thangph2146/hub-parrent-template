import type { ReactNode } from "react"
import { cn } from "../../../lib/utils"

export type AdminEmptyStateProps = {
  icon: ReactNode
  title: string
  description?: string
  /** Gợi ý từng bước — hiển thị dạng danh sách có số thứ tự. */
  hints?: readonly string[]
  actions?: ReactNode
  /** `compact` dùng trong tab / vùng con; `default` cho empty toàn trang. */
  size?: "default" | "compact"
  className?: string
}

export function AdminEmptyState({
  icon,
  title,
  description,
  hints,
  actions,
  size = "default",
  className,
}: AdminEmptyStateProps) {
  const isCompact = size === "compact"

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/25 via-background to-muted/15 text-center",
        isCompact ? "px-5 py-10" : "px-6 py-14 sm:py-16",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/12 to-primary/5 shadow-sm",
          isCompact ? "mb-4 size-14" : "mb-5 size-16"
        )}
        aria-hidden
      >
        <div
          className={cn(isCompact ? "size-7" : "size-8", "[&_svg]:size-full")}
        >
          {icon}
        </div>
      </div>

      <h3
        className={cn(
          "font-semibold tracking-tight text-foreground",
          isCompact ? "text-base" : "text-lg sm:text-xl"
        )}
      >
        {title}
      </h3>

      {description ? (
        <p
          className={cn(
            "mt-2 max-w-lg text-muted-foreground",
            isCompact ? "text-sm" : "text-sm sm:text-base"
          )}
        >
          {description}
        </p>
      ) : null}

      {hints && hints.length > 0 ? (
        <ul
          className={cn(
            "mt-6 w-full max-w-xl space-y-2 text-left",
            isCompact && "mt-4 max-w-md"
          )}
        >
          {hints.map((hint, index) => (
            <li
              key={hint}
              className="flex gap-3 rounded-xl border border-border/50 bg-card/70 px-4 py-2.5 text-sm text-muted-foreground shadow-sm"
            >
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums"
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="min-w-0 pt-0.5 leading-snug">{hint}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {actions ? (
        <div
          className={cn(
            "mt-6 flex flex-wrap items-center justify-center gap-2",
            isCompact && "mt-4"
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  )
}
