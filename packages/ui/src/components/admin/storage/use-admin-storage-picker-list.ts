"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "../../sonner"
import type {
  AdminStoragePickerAdapters,
  AdminStoragePickerListParams,
  AdminStorageFileRow,
} from "./types"
import type { StorageRealm, StorageTab } from "@workspace/api-client"

export function useAdminStoragePickerList(
  adapters: AdminStoragePickerAdapters,
  activeRealm: StorageRealm,
  activeFolderPath: string,
  page: number,
  pageSize: number,
  includeDescendants = false
) {
  const [rows, setRows] = useState<AdminStorageFileRow[]>([])
  const [realms, setRealms] = useState<StorageTab[]>([])
  const [childFolders, setChildFolders] = useState<StorageTab[]>([])
  const [breadcrumb, setBreadcrumb] = useState<
    Array<{ id: string; label: string }>
  >([])
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [total, setTotal] = useState(0)

  const reload = useCallback(async () => {
    setIsFetching(true)
    try {
      const params: AdminStoragePickerListParams = {
        realm: activeRealm,
        folderPath: activeFolderPath || undefined,
        page,
        limit: pageSize,
        includeDescendants,
      }
      const data = await adapters.listFiles(params)
      setRows(data.data)
      setRealms(data.realms ?? [])
      setChildFolders(data.childFolders ?? data.tabs ?? [])
      setBreadcrumb(data.breadcrumb ?? [])
      setTotal(data.pagination.total)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải danh sách")
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [
    activeFolderPath,
    activeRealm,
    adapters,
    includeDescendants,
    page,
    pageSize,
  ])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    rows,
    realms,
    childFolders,
    breadcrumb,
    loading,
    isFetching,
    total,
    reload,
  }
}
