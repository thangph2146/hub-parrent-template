"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@ui/components/sonner";
import { fetchImages } from "@/lib/admin-uploads";
import type { FileStorageRow, FileStorageTab } from "../types";

export function useFileStorageList(
  activeTab: FileStorageTab,
  page: number,
  pageSize: number,
) {
  const [rows, setRows] = useState<FileStorageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchImages(page, pageSize, activeTab);
      setRows(data.data);
      setTotal(data.pagination.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { rows, loading, total, reload };
}
