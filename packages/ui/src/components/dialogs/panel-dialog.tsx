"use client"

import type { ReactNode } from "react"
import { Loader2, MapPin, Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { Input } from "../input"
import { Label } from "../label"
import { ScrollArea } from "../scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../dialog"

export type PanelDialogSize = "sm" | "md" | "lg"

const PANEL_DIALOG_SIZE: Record<
  PanelDialogSize,
  { maxWidth: string; maxHeight: string }
> = {
  sm: {
    maxWidth: "max-w-md",
    maxHeight: "max-h-[min(90vh,560px)]",
  },
  md: {
    maxWidth: "max-w-lg",
    maxHeight: "max-h-[min(90vh,720px)]",
  },
  lg: {
    maxWidth: "max-w-xl",
    maxHeight: "max-h-[min(90vh,760px)]",
  },
}

export type PanelDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** Nội dung bên trái footer (vd. đích lưu, tóm tắt). */
  footerLeading?: ReactNode
  size?: PanelDialogSize
  contentClassName?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
}

export function PanelDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  footerLeading,
  size = "md",
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
}: PanelDialogProps) {
  const sizeClass = PANEL_DIALOG_SIZE[size]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          sizeClass.maxWidth,
          sizeClass.maxHeight,
          contentClassName
        )}
      >
        <DialogHeader
          className={cn(
            "relative shrink-0 gap-0 border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-background px-6 py-5",
            headerClassName
          )}
        >
          <div className="flex items-start gap-3 pr-10">
            {icon ? (
              <div
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 [&_svg]:size-5"
              >
                {icon}
              </div>
            ) : null}
            <div className="min-w-0 space-y-1.5">
              <DialogTitle className="text-base leading-snug font-semibold">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="text-[13px] leading-relaxed">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div
          className={cn(
            "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5",
            bodyClassName
          )}
        >
          {children}
        </div>

        {footer || footerLeading ? (
          <div
            data-slot="panel-dialog-footer"
            className={cn(
              "flex shrink-0 flex-col gap-3 border-t border-border/60 bg-muted/30 px-6 py-4",
              footerLeading
                ? "sm:flex-row sm:items-center sm:justify-between"
                : "sm:flex-row sm:justify-end",
              footerClassName
            )}
          >
            {footerLeading ? (
              <div className="min-w-0 flex-1">{footerLeading}</div>
            ) : null}
            {footer ? (
              <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {footer}
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type PanelDialogSearchProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PanelDialogSearch({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: PanelDialogSearchProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-9 bg-background/80 pl-9 shadow-sm"
          disabled={disabled}
        />
      </div>
    </div>
  )
}

type PanelDialogDestinationProps = {
  label: string
  value: ReactNode
  ready?: boolean
  className?: string
}

export function PanelDialogDestination({
  label,
  value,
  ready = false,
  className,
}: PanelDialogDestinationProps) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2.5 text-sm", className)}>
      <MapPin
        className={cn(
          "mt-0.5 size-4 shrink-0",
          ready ? "text-primary" : "text-muted-foreground"
        )}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p
          className={cn(
            "font-mono text-sm leading-snug break-all",
            ready ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

type PanelDialogTreePanelProps = {
  children: ReactNode
  className?: string
  heightClassName?: string
}

export function PanelDialogTreePanel({
  children,
  className,
  heightClassName = "h-56",
}: PanelDialogTreePanelProps) {
  return (
    <ScrollArea
      className={cn(
        "rounded-xl border border-border/70 bg-card/50 shadow-sm ring-1 ring-foreground/[0.03]",
        heightClassName,
        className
      )}
    >
      {children}
    </ScrollArea>
  )
}

type PanelDialogLoadingProps = {
  label?: string
  className?: string
}

export function PanelDialogLoading({
  label = "Đang tải…",
  className,
}: PanelDialogLoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 py-10 text-sm text-muted-foreground",
        className
      )}
    >
      <Loader2 className="size-4 animate-spin text-primary" />
      {label}
    </div>
  )
}

type PanelDialogEmptyProps = {
  children: ReactNode
  className?: string
}

export function PanelDialogEmpty({
  children,
  className,
}: PanelDialogEmptyProps) {
  return (
    <p
      className={cn(
        "rounded-xl border border-dashed bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  )
}

type PanelDialogHintProps = {
  children: ReactNode
  className?: string
}

export function PanelDialogHint({ children, className }: PanelDialogHintProps) {
  return (
    <p
      className={cn(
        "rounded-lg border border-border/60 bg-muted/25 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  )
}

type PanelDialogInfoCardProps = {
  icon?: ReactNode
  title: ReactNode
  children: ReactNode
  className?: string
}

export function PanelDialogInfoCard({
  icon,
  title,
  children,
  className,
}: PanelDialogInfoCardProps) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-border/70 bg-muted/25 p-4 text-sm shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        {icon ? (
          <span className="mt-0.5 shrink-0 text-primary [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <div className="text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  )
}
