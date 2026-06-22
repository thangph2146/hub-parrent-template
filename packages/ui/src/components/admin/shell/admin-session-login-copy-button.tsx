"use client"

import { useCallback, useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"
import type { AuthUser } from "@workspace/api-client"
import { cn } from "../../../lib/utils"
import { Button } from "../../button"
import { toast } from "../../sonner"
import {
  buildAdminSessionLoginCopyText,
  type AdminSessionLoginCopyContext,
} from "./admin-session-login-copy"

const IS_DEV = process.env.NODE_ENV === "development"

export type AdminSessionLoginCopyButtonProps = AdminSessionLoginCopyContext & {
  user: AuthUser
  className?: string
  /** `icon` — nút vuông header; `sm` — nút có chữ (menu). */
  layout?: "icon" | "sm"
}

export function AdminSessionLoginCopyButton({
  user,
  pagePath,
  loginPath,
  sessionStorageKey,
  portalLabel,
  className,
  layout = "icon",
}: AdminSessionLoginCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyText = useMemo(
    () =>
      buildAdminSessionLoginCopyText(user, {
        pagePath,
        loginPath,
        sessionStorageKey,
        portalLabel,
      }),
    [user, pagePath, loginPath, sessionStorageKey, portalLabel],
  )

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      toast.success("Đã sao chép cấu hình đăng nhập")
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Không sao chép được")
    }
  }, [copyText])

  if (!IS_DEV) return null

  if (layout === "sm") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("w-full justify-start gap-2 rounded-lg", className)}
        onClick={() => void onCopy()}
      >
        {copied ? (
          <>
            <Check className="size-3.5 shrink-0" aria-hidden />
            Đã sao chép
          </>
        ) : (
          <>
            <Copy className="size-3.5 shrink-0" aria-hidden />
            Sao chép cấu hình đăng nhập
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "h-10 w-10 shrink-0 rounded-lg border-border/70 bg-background/90 text-muted-foreground shadow-sm",
        "hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow active:scale-[0.98]",
        className,
      )}
      onClick={() => void onCopy()}
      title="Sao chép cấu hình đăng nhập tài khoản hiện tại (development)"
      aria-label="Sao chép cấu hình đăng nhập tài khoản hiện tại"
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </Button>
  )
}

export {
  buildAdminSessionLoginCopyText,
  buildAdminSessionDevLoginOption,
  type AdminSessionLoginCopyContext,
} from "./admin-session-login-copy"
