import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "border-destructive/25 bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/15 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/15",
        outline:
          "border-border bg-transparent text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "border-transparent hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
        /** Danh mục / nhãn phân loại — tông primary nhạt. */
        category:
          "border-primary/20 bg-primary/10 font-semibold text-primary",
        /** Mã giảm giá / coupon. */
        coupon:
          "border-destructive/20 bg-destructive/10 font-semibold text-destructive",
        /** Khuyến mãi, giá KM, nhãn KM. */
        promo: "border-primary/25 bg-primary/10 font-semibold text-primary",
        /** Giá lẻ / giá tham chiếu khi chưa đủ điều kiện KM. */
        retail:
          "border-outline-variant/35 bg-muted/40 font-semibold text-muted-foreground",
        success:
          "border-success/25 bg-success/10 font-semibold text-success dark:bg-success/15",
        warning:
          "border-warning/30 bg-warning/10 font-semibold text-warning dark:bg-warning/15",
        muted:
          "border-outline-variant/30 bg-muted/25 font-medium text-muted-foreground",
        /** Badge nổi trên ảnh / overlay. */
        overlay:
          "border-background/30 bg-background/90 font-semibold text-foreground shadow-sm backdrop-blur-sm",
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
