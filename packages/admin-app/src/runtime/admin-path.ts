"use client"

import { useCallback } from "react"
import type { AdminModuleId } from "../config/types"
import { moduleHref } from "../registry/module-routes"
import { useAdminApp } from "./admin-app-context"

/** Ghép `basePath` deploy (vd. `/admin`) với segment route module. */
export function joinAdminPath(
  basePath: string,
  ...parts: Array<string | number>
): string {
  const segments = [
    (basePath ?? "").replace(/\/+$/, ""),
    ...parts.flatMap((part) =>
      String(part)
        .replace(/^\/+/, "")
        .split("/")
        .filter(Boolean),
    ),
  ].filter(Boolean)
  return `/${segments.join("/")}`.replace(/\/+/g, "/")
}

/** Trả hàm ghép path theo `basePath` của app host. */
export function useAdminPath() {
  const { basePath } = useAdminApp()
  return useCallback(
    (...parts: Array<string | number>) => joinAdminPath(basePath ?? "", ...parts),
    [basePath],
  )
}

/** Base path CRUD của một module (vd. `/admin/products`). */
export function useAdminModulePath(moduleId: AdminModuleId) {
  const { basePath } = useAdminApp()
  return useCallback(
    (...suffixParts: Array<string | number>) =>
      joinAdminPath(
        basePath ?? "",
        moduleHref(moduleId).replace(/^\//, ""),
        ...suffixParts,
      ),
    [basePath, moduleId],
  )
}
