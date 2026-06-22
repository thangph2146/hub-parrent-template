"use client"

import type { AuthUser } from "@workspace/api-client"
import { AdminSessionLoginCopyButton } from "./admin-session-login-copy-button"
import type { AdminSessionLoginCopyContext } from "./admin-session-login-copy"

const IS_DEV = process.env.NODE_ENV === "development"

export type AdminProfileMenuDevSectionProps = AdminSessionLoginCopyContext & {
  user: AuthUser
}

export function AdminProfileMenuDevSection({
  user,
  pagePath,
  loginPath,
  sessionStorageKey,
  portalLabel,
  menuTree,
  enabledAdminModules,
}: AdminProfileMenuDevSectionProps) {
  if (!IS_DEV) return null

  return (
    <section
      aria-label="Công cụ development"
      className="border-t border-dashed border-amber-500/35 bg-amber-500/[0.05] p-2 dark:bg-amber-500/[0.08]"
    >
      <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800/90 dark:text-amber-300/90">
        Development
      </p>
      <AdminSessionLoginCopyButton
        user={user}
        pagePath={pagePath}
        loginPath={loginPath}
        sessionStorageKey={sessionStorageKey}
        portalLabel={portalLabel}
        menuTree={menuTree}
        enabledAdminModules={enabledAdminModules}
      />
    </section>
  )
}
