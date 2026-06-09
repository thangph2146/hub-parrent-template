import type { ReactNode } from "react"
import type { VariantProps } from "class-variance-authority"
import { Badge, badgeVariants } from "../../badge"
import { cn } from "../../../lib/utils"

export type AdminFormBadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>

/** Trạng thái «Tắt» trên section tuỳ chọn (KM, bậc giá, quà…). */
export function AdminOptionalSectionOffBadge({
  className,
}: {
  className?: string
}) {
  return (
    <Badge
      variant="muted"
      size="xs"
      shape="pill"
      className={cn("font-normal", className)}
    >
      Tắt
    </Badge>
  )
}

/** Tóm tắt cấu hình khi section đang bật. */
export function AdminOptionalSectionSummaryBadge({
  children,
  variant = "promo",
  className,
}: {
  children: ReactNode
  variant?: AdminFormBadgeVariant
  className?: string
}) {
  return (
    <Badge
      variant={variant}
      size="sm"
      className={cn("max-w-full truncate font-normal", className)}
    >
      {children}
    </Badge>
  )
}

/** Đếm ảnh trong `ImageUrlListField`. */
export function AdminMediaCountBadge({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  return (
    <Badge
      variant="muted"
      size="xs"
      className={cn("ml-auto tabular-nums", className)}
    >
      {count} ảnh
    </Badge>
  )
}

/** Nhãn loại hàng mặc định trên form SP. */
export function AdminDefaultVariantBadge({
  className,
}: {
  className?: string
}) {
  return (
    <Badge variant="category" size="xs" className={cn("font-normal", className)}>
      Mặc định
    </Badge>
  )
}

/** Số lượng quà trên ảnh xem trước. */
export function AdminGiftQtyOverlayBadge({
  qty,
  className,
}: {
  qty: number
  className?: string
}) {
  return (
    <Badge
      variant="overlay"
      size="xs"
      shape="pill"
      className={cn(
        "absolute right-0.5 bottom-0.5 px-1 font-semibold tabular-nums shadow-sm",
        className
      )}
    >
      ×{qty}
    </Badge>
  )
}
