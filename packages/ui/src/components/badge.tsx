import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

/**
 * Badge tonal — luôn dùng cặp token semantic (bg + text + border), không hardcode opacity lẻ.
 * Light/dark map trong `globals.css` (`--accent`, `--error-container`, `--success`, …).
 */
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary/90",
        destructive:
          "border-destructive/30 bg-destructive/10 font-semibold text-destructive dark:border-destructive/40 dark:bg-destructive/20 dark:text-destructive-foreground",
        outline:
          "border-border bg-transparent text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
        /** Danh mục / loại hàng — accent surface (khác promo). */
        category:
          "border-border/70 bg-accent font-semibold text-accent-foreground dark:border-outline-variant/55 dark:bg-surface-container dark:text-on-surface-variant",
        /** Mã giảm giá — error container (burgundy family). */
        coupon:
          "border-error-container/80 bg-error-container font-semibold text-on-error-container",
        /** Khuyến mãi / giá KM — primary container tonal. */
        promo:
          "border-primary/30 bg-primary/10 font-semibold text-primary dark:border-primary/45 dark:bg-primary/25 dark:text-primary-foreground",
        /** Giá lẻ / tham chiếu khi chưa đủ điều kiện KM. */
        retail:
          "border-outline-variant/60 bg-surface-container font-semibold text-on-surface-variant",
        success:
          "border-success/30 bg-success/10 font-semibold text-success dark:border-success/40 dark:bg-success/20 dark:text-success",
        warning:
          "border-warning/35 bg-warning/10 font-semibold text-warning dark:border-warning/40 dark:bg-warning/20 dark:text-warning-foreground",
        muted:
          "border-outline-variant/50 bg-muted/60 font-medium text-muted-foreground dark:bg-surface-container dark:text-on-surface-variant",
        /** Badge nổi trên ảnh / overlay. */
        overlay:
          "border-background/40 bg-background/92 font-semibold text-foreground shadow-sm backdrop-blur-sm dark:border-foreground/15 dark:bg-card/90",
      },
      size: {
        xs: "min-h-4 px-1.5 py-0.5 text-[10px] [&>svg:not([class*='size-'])]:size-2.5",
        sm: "min-h-5 px-2 py-0.5 text-[11px] [&>svg:not([class*='size-'])]:size-3",
        default:
          "min-h-5 px-2.5 py-1 text-caption [&>svg:not([class*='size-'])]:size-3",
        lg: "min-h-6 px-3 py-1 text-xs [&>svg:not([class*='size-'])]:size-3.5",
      },
      shape: {
        default: "rounded-lg",
        pill: "rounded-full",
      },
    },
    compoundVariants: [
      { shape: "pill", size: "xs", class: "px-2" },
      { shape: "pill", size: "sm", class: "px-2.5" },
      { shape: "pill", size: "default", class: "px-3" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  shape = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size, shape }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
