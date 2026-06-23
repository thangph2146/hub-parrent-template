"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { toast } from "../lib/toast"
import { cn } from "../lib/utils"
import { buttonVariants } from "./button"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

const TOAST_ICON_SIZE = 16
const TOAST_ICON_STROKE = 2

const toastIcons = {
  success: (
    <CircleCheckIcon
      size={TOAST_ICON_SIZE}
      strokeWidth={TOAST_ICON_STROKE}
      aria-hidden
    />
  ),
  info: (
    <InfoIcon size={TOAST_ICON_SIZE} strokeWidth={TOAST_ICON_STROKE} aria-hidden />
  ),
  warning: (
    <TriangleAlertIcon
      size={TOAST_ICON_SIZE}
      strokeWidth={TOAST_ICON_STROKE}
      aria-hidden
    />
  ),
  error: (
    <OctagonXIcon
      size={TOAST_ICON_SIZE}
      strokeWidth={TOAST_ICON_STROKE}
      aria-hidden
    />
  ),
  loading: (
    <Loader2Icon
      size={TOAST_ICON_SIZE}
      strokeWidth={TOAST_ICON_STROKE}
      className="animate-spin"
      aria-hidden
    />
  ),
}

const Toaster = ({
  position = "top-right",
  richColors = true,
  closeButton = true,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      richColors={richColors}
      closeButton={closeButton}
      icons={toastIcons}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          title: "cn-toast-title",
          description: "cn-toast-description",
          icon: "cn-toast-icon",
          loader: "cn-toast-loader",
          actionButton: cn(
            buttonVariants({ variant: "outline", size: "xs" }),
            "cn-toast-action",
          ),
          cancelButton: cn(
            buttonVariants({ variant: "ghost", size: "xs" }),
            "cn-toast-cancel",
          ),
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
export type { ToasterProps } from "sonner"
export type { AppToast, ToastOptions, ToastVariant } from "../lib/toast"
