"use client"

import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"
import { Label } from "./label"
import { Separator } from "./separator"

/** HR / panel: viền solid rõ, legend cắt viền trên. */
export const FIELDSET_CUSTOM_CLASS =
  "relative box-border min-w-0 m-0 rounded-sm border-2 border-solid border-slate-300 bg-white px-2.5 pb-2.5 pt-6 dark:border-border dark:bg-card hover:border-primary/50"

/** Legend absolute top-left, nằm ngang trên border fieldset (khớp `.legend-custom`). */
export const FIELD_LEGEND_CUSTOM_CLASS =
  "w-fit absolute start-2.5 left-2.5 top-0 z-[1] -translate-y-1/2 border-0 bg-white px-2 text-[15px] font-bold uppercase leading-none tracking-wide text-foreground dark:bg-card"

/** Card chi tiết admin: bo góc, viền solid đậm hơn slate-200. */
export const FIELDSET_SECTION_CLASS =
  "box-border flex min-w-0 flex-col overflow-hidden rounded-xl border-2 border-solid border-slate-300 bg-white dark:border-border dark:bg-card hover:border-primary/50"

export const FIELD_LEGEND_SECTION_CLASS =
  "!float-none !-mt-0 block w-fit max-w-full border-0 ml-4 px-2 py-2 font-normal text-foreground"

export const FIELD_PANEL_ITEM_CLASS =
  "min-h-[2.75rem] bg-slate-50 px-2.5 py-2 text-sm leading-normal text-foreground dark:bg-muted/30"

/** Badge đếm góc phải header section (vd. số danh mục con). */
export const FIELD_SECTION_BADGE_CLASS =
  "inline-flex size-6 min-w-6 items-center justify-center rounded-md bg-red-950 px-0 text-xs font-bold text-white"

function FieldSectionBadge({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="field-section-badge"
      className={cn(FIELD_SECTION_BADGE_CLASS, className)}
      {...props}
    >
      {children}
    </span>
  )
}

const fieldSetVariants = cva("", {
  variants: {
    variant: {
      default:
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
      /** `.fieldset-custom` — groove 2px, padding 5px 10px. */
      custom: FIELDSET_CUSTOM_CLASS,
      /** Alias `custom` (kèm FieldPanelGrid cho lưới đọc-only). */
      panel: FIELDSET_CUSTOM_CLASS,
      /** Section card trong trang chi tiết (không groove). */
      section: FIELDSET_SECTION_CLASS,
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const fieldLegendVariants = cva("font-medium", {
  variants: {
    variant: {
      legend: "mb-1.5 text-base",
      label: "mb-1.5 text-sm",
      /** `.legend-custom` */
      custom: FIELD_LEGEND_CUSTOM_CLASS,
      panel: FIELD_LEGEND_CUSTOM_CLASS,
      /** Legend hàng ngang: icon + tiêu đề + badge. */
      section: FIELD_LEGEND_SECTION_CLASS,
    },
  },
  defaultVariants: {
    variant: "legend",
  },
})

const fieldSetContentVariants = cva("", {
  variants: {
    variant: {
      default: "",
      custom: "",
      panel: "",
      section: "px-6 pb-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

/** Reset viền mặc định UA (groove/inset) để Tailwind kiểm soát hoàn toàn. */
const FIELDSET_BASE_CLASS = "min-w-0 border-solid [border-image:initial]"

function FieldSet({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"fieldset"> & VariantProps<typeof fieldSetVariants>) {
  return (
    <fieldset
      data-slot="field-set"
      data-variant={variant}
      className={cn(
        FIELDSET_BASE_CLASS,
        fieldSetVariants({ variant }),
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & VariantProps<typeof fieldLegendVariants>) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(fieldLegendVariants({ variant }), className)}
      {...props}
    />
  )
}

/** Mô tả phụ dưới tiêu đề (đặt trong `FieldSectionHeader` hoặc `FieldLegend`). */
function FieldLegendDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-legend-description"
      className={cn(
        "mt-0.5 text-sm font-normal text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

type FieldSectionHeaderProps = {
  icon?: React.ComponentType<{ className?: string }>
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

/** Legend section card: icon + tiêu đề + mô tả (+ badge) — hiển thị trong `<legend>`. */
function FieldSectionLegend({
  icon: Icon,
  title,
  description,
  badge,
  className,
  ...props
}: FieldSectionHeaderProps &
  Omit<React.ComponentProps<typeof FieldLegend>, "title" | "variant">) {
  return (
    <FieldLegend
      variant="section"
      data-slot="field-section-legend"
      className={className}
      {...props}
    >
      <span className="flex w-full items-start gap-2.5">
        {Icon ? (
          <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex w-full items-center gap-2">
            <span className="text-[15px] leading-snug font-bold text-foreground">
              {title}
            </span>
            {badge ? <span className="ml-auto shrink-0">{badge}</span> : null}
          </span>
          {description != null && description !== "" ? (
            typeof description === "string" ? (
              <FieldLegendDescription>{description}</FieldLegendDescription>
            ) : (
              description
            )
          ) : null}
        </span>
      </span>
    </FieldLegend>
  )
}

/** @deprecated Dùng `FieldSectionLegend` (cùng API, render `<legend>`). */
function FieldSectionHeader(props: FieldSectionHeaderProps) {
  return <FieldSectionLegend {...props} />
}

/** Bọc nội dung sau legend — `clear-both` tránh chồng khi legend float UA. */
function FieldSetContent({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldSetContentVariants>) {
  return (
    <div
      data-slot="field-set-content"
      className={cn(fieldSetContentVariants({ variant }), className)}
      {...props}
    />
  )
}

const fieldPanelGridRowVariants = cva(
  "grid w-full divide-x divide-y divide-slate-300 overflow-hidden rounded-sm border border-slate-300 dark:divide-border dark:border-border",
  {
    variants: {
      columns: {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      },
    },
    defaultVariants: {
      columns: 3,
    },
  }
)

/** Lưới ô có viền chung (table-grid) — Tailwind thuần. */
function FieldPanelGrid({
  className,
  columns = 3,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof fieldPanelGridRowVariants>) {
  return (
    <div
      data-slot="field-panel-grid"
      className={cn(fieldPanelGridRowVariants({ columns }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export type FieldPanelItemProps = React.ComponentProps<"div"> & {
  label: React.ReactNode
  /** Tự thêm " :" sau label nếu false. Mặc định true. */
  showColon?: boolean
  value?: React.ReactNode
  children?: React.ReactNode
}

/** Ô label đậm + giá trị (cùng dòng) trong lưới panel. */
function FieldPanelItem({
  label,
  showColon = true,
  value,
  children,
  className,
  ...props
}: FieldPanelItemProps) {
  const content = children ?? value

  return (
    <div
      data-slot="field-panel-item"
      className={cn(FIELD_PANEL_ITEM_CLASS, className)}
      {...props}
    >
      <span className="font-bold">{label}</span>
      {showColon ? <span className="font-bold"> :</span> : null}
      {content != null && content !== "" ? (
        <span className="font-normal"> {content}</span>
      ) : null}
    </div>
  )
}

/** Khung viền chỉ bọc giá trị — label đặt bên ngoài (không viền). */
export const FIELD_SECTION_VALUE_CLASS =
  "rounded-md border border-solid border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-foreground dark:border-border dark:bg-muted/30"

function FieldSectionValue({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-section-value"
      className={cn(FIELD_SECTION_VALUE_CLASS, className)}
      {...props}
    >
      {children}
    </div>
  )
}

type FieldSectionFieldProps = {
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  valueClassName?: string
  children: React.ReactNode
}

/** Một field section: label (không viền) + nội dung trong khung viền. */
function FieldSectionField({
  label,
  icon,
  className,
  valueClassName,
  children,
}: FieldSectionFieldProps) {
  return (
    <div
      data-slot="field-section-field"
      className={cn("flex flex-col gap-1.5", className)}
    >
      <FieldSectionLabel icon={icon}>{label}</FieldSectionLabel>
      <FieldSectionValue className={valueClassName}>
        {children}
      </FieldSectionValue>
    </div>
  )
}

/** Nhãn uppercase trong section card (vd. SLUG / ĐƯỜNG DẪN). */
function FieldSectionLabel({
  className,
  icon: Icon,
  children,
  ...props
}: React.ComponentProps<"p"> & {
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <p
      data-slot="field-section-label"
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="size-3 shrink-0" aria-hidden /> : null}
      {children}
    </p>
  )
}

/** Gạch ngang giữa các khối trong section card. */
function FieldSectionDivider({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="field-section-divider"
      className={cn("bg-slate-100 dark:bg-border", className)}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldLegendDescription,
  FieldSectionBadge,
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionHeader,
  FieldSectionLegend,
  FieldSectionLabel,
  FieldSectionValue,
  FieldPanelGrid,
  FieldPanelItem,
  FieldSeparator,
  FieldSet,
  FieldSetContent,
  FieldContent,
  FieldTitle,
  fieldLegendVariants,
  fieldPanelGridRowVariants,
  fieldSetContentVariants,
  fieldSetVariants,
}
