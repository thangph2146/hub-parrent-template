"use client"

import { useCallback, useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"
import type { AuthUser } from "@workspace/api-client"
import { cn } from "../../../lib/utils"
import { toast } from "../../sonner"
import {
  buildAdminSessionLoginCopyText,
  type AdminSessionLoginCopyContext,
} from "./admin-session-login-copy"

const IS_DEV = process.env.NODE_ENV === "development"

export type AdminSessionLoginCopyButtonProps = AdminSessionLoginCopyContext & {
  user: AuthUser
  className?: string
}

export function AdminSessionLoginCopyButton({
  user,
  pagePath,
  loginPath,
  sessionStorageKey,
  portalLabel,
  menuTree,
  enabledAdminModules,
  className,
}: AdminSessionLoginCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyText = useMemo(
    () =>
      buildAdminSessionLoginCopyText(user, {
        pagePath,
        loginPath,
        sessionStorageKey,
        portalLabel,
        menuTree,
        enabledAdminModules,
      }),
    [
      user,
      pagePath,
      loginPath,
      sessionStorageKey,
      portalLabel,
      menuTree,
      enabledAdminModules,
    ],
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

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors",
        copied
          ? "bg-primary/5"
          : "hover:border-border/60 hover:bg-muted/40",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border",
          copied
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border/70 bg-background text-muted-foreground",
        )}
      >
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Copy className="size-4" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground">
          {copied ? "Đã sao chép cấu hình" : "Sao chép cấu hình đăng nhập"}
        </span>
        <span className="block text-xs text-muted-foreground">
          Dev — email, role, menu sidebar và gợi ý dev-login để paste
        </span>
      </span>
    </button>
  )
}

export {
  buildAdminSessionLoginCopyText,
  buildAdminSessionDevLoginOption,
  type AdminSessionLoginCopyContext,
} from "./admin-session-login-copy"
