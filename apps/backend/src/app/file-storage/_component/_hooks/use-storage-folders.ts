"use client"

import { useEffect, useState } from "react"
import { fetchStorageFolders, type FolderItem } from "@/lib/admin-uploads"

export function useStorageFolders(refreshKey = 0) {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchStorageFolders()
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
  }, [refreshKey])

  return { folders, loading }
}
