import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

/** Ba tông trạng thái sử dụng chuẩn admin. */
export type UsageStatusTone = "success" | "warning" | "danger"

export const USAGE_STATUS_LABELS: Record<UsageStatusTone, string> = {
  success: "Đang sử dụng",
  warning: "Cần lưu ý",
  danger: "Ngừng sử dụng",
}

const usageStatusBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center rounded-lg border border-transparent px-2.5 py-1 text-caption font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        success: "bg-success/10 text-success dark:bg-success/20",
        warning: "bg-warning/10 text-warning dark:bg-warning/20",
        danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
      },
    },
    defaultVariants: {
      tone: "success",
    },
  }
)

export type UsageStatusBadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof usageStatusBadgeVariants> & {
    tone: UsageStatusTone
    /** Ghi đè nhãn mặc định theo `tone`. */
    label?: string
  }

/** Badge trạng thái sử dụng — success / warning / danger. */
export function UsageStatusBadge({
  tone,
  label,
  className,
  children,
  ...props
}: UsageStatusBadgeProps) {
  const text = children ?? label ?? USAGE_STATUS_LABELS[tone]
  return (
    <span
      data-slot="usage-status-badge"
      data-tone={tone}
      className={cn(usageStatusBadgeVariants({ tone }), className)}
      {...props}
    >
      {text}
    </span>
  )
}

/**
 * Suy `tone` từ giá trị phổ biến trong admin (`1` hoạt động, `2` cảnh báo, còn lại ngừng/khóa).
 * Boolean: `true` → success, `false` → danger.
 */
export function resolveUsageStatusTone(
  value: number | boolean | UsageStatusTone
): UsageStatusTone {
  if (value === "success" || value === "warning" || value === "danger") {
    return value
  }
  if (typeof value === "boolean") return value ? "success" : "danger"
  if (value === 1) return "success"
  if (value === 2) return "warning"
  return "danger"
}

export type UsageStatusFromValueLabels = {
  success?: string
  warning?: string
  danger?: string
  /** `status === 1` */
  active?: string
  /** `status === 0` */
  locked?: string
}

export function resolveUsageStatusLabel(
  tone: UsageStatusTone,
  value?: number | boolean,
  labels?: UsageStatusFromValueLabels
): string {
  if (typeof value === "number") {
    if (value === 1 && labels?.active?.trim()) return labels.active.trim()
    if (value === 0 && labels?.locked?.trim()) return labels.locked.trim()
  }
  if (typeof value === "boolean") {
    if (value && labels?.active?.trim()) return labels.active.trim()
    if (!value && labels?.locked?.trim()) return labels.locked.trim()
  }
  const custom = labels?.[tone]?.trim()
  return custom || USAGE_STATUS_LABELS[tone]
}

export type UsageStatusFromValueProps = Omit<
  UsageStatusBadgeProps,
  "tone" | "label" | "children"
> & {
  value: number | boolean | UsageStatusTone
  labels?: UsageStatusFromValueLabels
}

/** Badge từ `status` số/boolean — dùng cho cột «Trạng thái» bảng admin. */
export function UsageStatusFromValue({
  value,
  labels,
  className,
  ...props
}: UsageStatusFromValueProps) {
  const tone = resolveUsageStatusTone(value)
  const label = resolveUsageStatusLabel(
    tone,
    typeof value === "number" || typeof value === "boolean" ? value : undefined,
    labels
  )
  return (
    <UsageStatusBadge
      tone={tone}
      label={label}
      className={className}
      {...props}
    />
  )
}
