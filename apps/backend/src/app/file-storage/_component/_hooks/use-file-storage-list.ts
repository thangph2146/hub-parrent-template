"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@ui/components/sonner";
import { fetchImages } from "@/lib/admin-uploads";
import type { FileStorageRow, StorageRealm, StorageTab } from "../types";

export function useFileStorageList(
  activeRealm: StorageRealm,
  activeFolderPath: string,
  page: number,
  pageSize: number,
  includeDescendants = false,
  uploadOwnerFilter = "",
) {
  const [rows, setRows] = useState<FileStorageRow[]>([]);
  const [realms, setRealms] = useState<StorageTab[]>([]);
  const [childFolders, setChildFolders] = useState<StorageTab[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);

  const reload = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await fetchImages(page, pageSize, {
        realm: activeRealm,
        folderPath: activeFolderPath || undefined,
        includeDescendants,
        uploadOwnerId: uploadOwnerFilter.trim() || undefined,
      });
      setRows(data.data);
      setRealms(data.realms ?? []);
      setChildFolders(data.childFolders ?? data.tabs ?? []);
      setBreadcrumb(data.breadcrumb ?? []);
      setTotal(data.pagination.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải danh sách");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [
    activeFolderPath,
    activeRealm,
    includeDescendants,
    page,
    pageSize,
    uploadOwnerFilter,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    rows,
    realms,
    childFolders,
    breadcrumb,
    loading,
    isFetching,
    total,
    reload,
  };
}
