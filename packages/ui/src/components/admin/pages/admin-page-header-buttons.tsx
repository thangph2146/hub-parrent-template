"use client"

import { ArrowLeft } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "../../button"

type AdminHeaderButtonProps = ComponentProps<typeof Button>
import { cn } from "../../../lib/utils"
import {
  ADMIN_PAGE_HEADER_BACK_BUTTON_CLASS,
  ADMIN_PAGE_HEADER_OUTLINE_BUTTON_CLASS,
  ADMIN_PAGE_HEADER_PRIMARY_BUTTON_CLASS,
} from "../../../lib/layout-shell"

export function AdminPageHeaderBackButton({
  className,
  children,
  ...props
}: AdminHeaderButtonProps & { children?: ReactNode }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(ADMIN_PAGE_HEADER_BACK_BUTTON_CLASS, className)}
      {...props}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children ?? "Quay lại"}
    </Button>
  )
}

export function AdminPageHeaderOutlineButton({
  className,
  ...props
}: AdminHeaderButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(ADMIN_PAGE_HEADER_OUTLINE_BUTTON_CLASS, className)}
      {...props}
    />
  )
}

export function AdminPageHeaderPrimaryButton({
  className,
  type = "button",
  variant = "default",
  ...props
}: AdminHeaderButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      className={cn(ADMIN_PAGE_HEADER_PRIMARY_BUTTON_CLASS, className)}
      {...props}
    />
  )
}
