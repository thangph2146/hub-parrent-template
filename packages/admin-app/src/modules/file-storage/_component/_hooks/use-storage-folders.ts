"use client"

import { useEffect, useState } from "react"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { fetchStorageFolders, type FolderItem } from "@workspace/admin-app/lib/admin-uploads"

export function useStorageFolders(refreshKey = 0) {
  const api = useAdminApi()
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchStorageFolders(api)
      .then((data) => {
        if (!cancelled) setFolders(data)
      })
      .catch(() => {
        if (!cancelled) setFolders([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey, api])

  return { folders, loading }
}
