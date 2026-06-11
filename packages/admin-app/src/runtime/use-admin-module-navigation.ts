"use client"

import type { AdminModuleId } from "../config/types"
import { moduleHref } from "../registry/module-routes"
import { useAdminApp } from "./admin-app-context"
import { useAdminCrudNavigation } from "../lib/admin-navigation"

/**
 * Điều hướng CRUD theo module id — tự ghép `basePath` của app deploy.
 * Thay `useAdminModuleNavigation("staff")` trong module dùng chung.
 */
export function useAdminModuleNavigation(
  moduleId: AdminModuleId,
  options?: Parameters<typeof useAdminCrudNavigation>[1],
) {
  const { basePath } = useAdminApp()
  const href = moduleHref(moduleId)
  const full =
    `${basePath}${href}`.replace(/\/+/g, "/") || "/"
  return useAdminCrudNavigation(full as `/${string}`, options)
}
