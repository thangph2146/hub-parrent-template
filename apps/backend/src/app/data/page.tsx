"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Badge } from "@ui/components/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@ui/components/alert";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldSectionDivider,
  FieldSectionLabel,
  FieldSectionLegend,
  FieldSectionValue,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field";
import { cn } from "@ui/lib/utils";
import { readAdminSession } from "@/lib/auth-session";
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin";
import { DEFAULT_API_URL, canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import { useAuth } from "@/providers/auth-provider";
import {
  Database,
  Download,
  FileSpreadsheet,
  FileJson,
  FolderOpen,
  Loader2,
  Upload,
} from "lucide-react";
import {
  ImportProgressPanel,
  withSkippedRemaining,
} from "./import-progress-panel";
import { EntitySchemaPanel } from "./_component";
import {
  pickExportDirectory,
  saveExportBlob,
  supportsExportDirectoryPicker,
} from "@/lib/export-file-save";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  error?: string | null;
  data?: T;
};

const FILE_INPUT_CLASS =
  "h-9 w-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 cursor-pointer text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/15";

async function readNdjsonStream(
  response: Response,
  onEvent: (event: Record<string, unknown>) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body not readable");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        onEvent(JSON.parse(trimmed) as Record<string, unknown>);
      } catch {
        /* skip malformed line */
      }
    }
  }
  if (buffer.trim()) {
    try {
      onEvent(JSON.parse(buffer.trim()) as Record<string, unknown>);
    } catch {
      /* skip */
    }
  }
}

function DataBackupPageInner() {
  const { user } = useAuth();
  const canExport = user
    ? canUserAccess(user, PERMISSION_CODES.SETTINGS_EXPORT) ||
      canUserAccess(user, PERMISSION_CODES.SETTINGS_MANAGE)
    : false;
  const canImport = user
    ? canUserAccess(user, PERMISSION_CODES.SETTINGS_IMPORT) ||
      canUserAccess(user, PERMISSION_CODES.SETTINGS_MANAGE)
    : false;
  const [exporting, setExporting] = useState<"json" | "excel" | null>(null);
  const [importProgress, setImportProgress] = useState<{
    active: boolean;
    models: Array<{
      name: string;
      records: number;
      status: "pending" | "importing" | "done" | "error" | "skipped";
      error?: string;
    }>;
    currentIndex: number;
    total: number;
    totalRecords: number;
    cumulativeImported: number;
    status: "idle" | "importing" | "done" | "error";
    message?: string;
  }>({
    active: false,
    models: [],
    currentIndex: 0,
    total: 0,
    totalRecords: 0,
    cumulativeImported: 0,
    status: "idle",
  });
  const [pickingDirectory, setPickingDirectory] = useState(false);
  const [exportDirectory, setExportDirectory] =
    useState<FileSystemDirectoryHandle | null>(null);
  const directoryPickerSupported = supportsExportDirectoryPicker();

  const dateStamp = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const authHeaders = (): HeadersInit => {
    const headers: Record<string, string> = {};
    const uid = readAdminSession()?.id;
    if (uid != null) headers["X-User-Id"] = String(uid);
    return headers;
  };

  const toastFetchError = useCallback(async (res: Response): Promise<string> => {
    let msg = "";
    try {
      const json = (await res.json()) as ApiEnvelope<unknown>;
      msg =
        json.message?.trim() ||
        (typeof json.error === "string" ? json.error.trim() : "") ||
        "";
    } catch {
      const t = await res.text();
      msg = t.length > 280 ? `${t.slice(0, 280)}…` : t;
    }
    if (res.status === 401) {
      const m = "API từ chối: thiếu hoặc sai X-User-Id — hãy đăng nhập lại admin.";
      toast.error(m);
      return m;
    }
    if (res.status === 403) {
      const m = msg || "Không đủ quyền xuất nhập hệ thống cho tài khoản hiện tại.";
      toast.error(m);
      return m;
    }
    const m = msg || `Lỗi ${res.status}`;
    toast.error(m);
    return m;
  }, []);
  const chooseExportDirectory = async (): Promise<void> => {
    if (!directoryPickerSupported) {
      toast.error(
        "Trình duyệt không hỗ trợ chọn thư mục. Dùng Chrome hoặc Edge, hoặc hộp thoại lưu file sẽ mở khi xuất.",
      );
      return;
    }
    setPickingDirectory(true);
    try {
      const dir = await pickExportDirectory();
      if (!dir) return;
      setExportDirectory(dir);
      toast.success(`Đã chọn thư mục lưu: ${dir.name}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể chọn thư mục lưu export.",
      );
    } finally {
      setPickingDirectory(false);
    }
  };

  const persistExportBlob = async (
    blob: Blob,
    filename: string,
    mimeType: string,
    mimeLabel: string,
  ): Promise<boolean> => {
    const mode = await saveExportBlob(blob, filename, {
      directory: exportDirectory,
      mimeType,
      mimeLabel,
    });
    if (mode === "cancelled") {
      toast.message("Đã hủy lưu file export.");
      return false;
    }
    if (mode === "directory") {
      toast.success(
        `Đã lưu ${filename} vào thư mục ${exportDirectory?.name ?? "đã chọn"}.`,
      );
      return true;
    }
    if (mode === "save-picker") {
      toast.success(`Đã lưu ${filename}.`);
      return true;
    }
    toast.success(`Đã tải ${filename} (thư mục Tải xuống mặc định).`);
    return true;
  };

  const exportReady =
    !directoryPickerSupported || exportDirectory !== null;

  const exportJson = async (): Promise<void> => {
    if (!exportReady) {
      toast.error("Hãy chọn thư mục lưu trước khi xuất JSON.");
      return;
    }
    setExporting("json");
    try {
      const res = await fetch(`${apiBase()}/admin/system/export`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        await toastFetchError(res);
        return;
      }
      const payload = (await res.json()) as ApiEnvelope<
        Record<string, unknown[]>
      >;
      if (!payload.success || !payload.data) {
        toast.error(payload.message || "API không trả dữ liệu export hợp lệ.");
        return;
      }

      const filename = `hub-system-export-${dateStamp()}.json`;
      const blob = new Blob([JSON.stringify(payload.data, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      await persistExportBlob(blob, filename, "application/json", "JSON");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Lỗi mạng — kiểm tra API đang chạy.",
      );
    } finally {
      setExporting(null);
    }
  };

  const exportExcel = async (): Promise<void> => {
    if (!exportReady) {
      toast.error("Hãy chọn thư mục lưu trước khi xuất Excel.");
      return;
    }
    setExporting("excel");
    try {
      const res = await fetch(`${apiBase()}/admin/system/export/excel`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        await toastFetchError(res);
        return;
      }
      const filename = `hub-system-export-${dateStamp()}.xlsx`;
      const blob = await res.blob();
      await persistExportBlob(
        blob,
        filename,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Excel",
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Lỗi mạng — kiểm tra API đang chạy.",
      );
    } finally {
      setExporting(null);
    }
  };

  const resetImportProgress = useCallback(() => {
    setImportProgress({
      active: false,
      models: [],
      currentIndex: 0,
      total: 0,
      totalRecords: 0,
      cumulativeImported: 0,
      status: "idle",
    });
  }, []);

  const handleImportStream = useCallback(
    async (res: Response) => {
      if (!res.ok) {
        await toastFetchError(res);
        resetImportProgress();
        return;
      }

      setImportProgress((prev) => ({ ...prev, status: "importing" }));

      let errorMessage = "";

      await readNdjsonStream(res, (event) => {
        const type = event.type as string;

        if (type === "start") {
          const modelNames = (event.models as string[]) ?? [];
          const records = (event.records as number[]) ?? [];
          setImportProgress({
            active: true,
            models: modelNames.map((name, i) => ({
              name,
              records: records[i] ?? 0,
              status: "pending" as const,
            })),
            currentIndex: 0,
            total: (event.total as number) ?? modelNames.length,
            totalRecords: (event.totalRecords as number) ?? 0,
            cumulativeImported: 0,
            status: "importing",
          });
        } else if (type === "model-start") {
          const modelName = event.model as string;
          setImportProgress((prev) => ({
            ...prev,
            currentIndex: (event.index as number) ?? prev.currentIndex,
            models: prev.models.map((m) =>
              m.name === modelName ? { ...m, status: "importing" as const } : m,
            ),
          }));
        } else if (type === "model-end") {
          const modelName = event.model as string;
          const success = event.success as boolean;
          const error = event.error as string | undefined;
          const rowErrors = event.rowErrors as
            | Array<{ model: string; index: number; message: string }>
            | undefined;
          setImportProgress((prev) => ({
            ...prev,
            cumulativeImported:
              (event.cumulativeImported as number) ?? prev.cumulativeImported,
            models: prev.models.map((m) => {
              if (m.name !== modelName) return m;
              const modelRowErr = rowErrors?.filter((r) => r.model === m.name);
              const errMsg =
                error ??
                modelRowErr?.[0]?.message ??
                (!success ? `Import ${modelName} thất bại` : undefined);
              const ok = success && !errMsg;
              return {
                ...m,
                status: ok ? ("done" as const) : ("error" as const),
                error: errMsg,
              };
            }),
          }));
        } else if (type === "complete") {
          const success = event.success as boolean;
          const message = (event.message as string) ?? "";
          setImportProgress((prev) => ({
            ...prev,
            status: success ? ("done" as const) : ("error" as const),
            message,
            models: success ? prev.models : withSkippedRemaining(prev.models),
          }));
          toast[success ? "success" : "error"](
            message || (success ? "Import hoàn tất." : "Import có lỗi."),
          );
        } else if (type === "error") {
          errorMessage = (event.message as string) ?? "Lỗi không xác định";
        }
      });

      if (errorMessage) {
        setImportProgress((prev) => ({
          ...prev,
          status: "error",
          message: errorMessage,
          models: withSkippedRemaining(prev.models),
        }));
        toast.error(errorMessage);
      }
    },
    [toastFetchError, resetImportProgress],
  );

  const importJsonFile = async (file: File | null): Promise<void> => {
    if (!file) return;
    resetImportProgress();

    try {
      const text = await file.text();
      let body: Record<string, unknown[]>;
      try {
        body = JSON.parse(text) as Record<string, unknown[]>;
      } catch {
        toast.error("File không phải JSON hợp lệ.");
        return;
      }

      const modelKeys = Object.keys(body).filter(
        (k) => Array.isArray(body[k]) && body[k].length > 0,
      );
      if (modelKeys.length === 0) {
        toast.error("File JSON không chứa dữ liệu nào.");
        return;
      }

      // Một request — API import theo thứ tự FK và gộp bảng liên quan (user+userRole, …)
      const res = await fetch(
        `${apiBase()}/admin/system/import?stream=true&skipClear=false`,
        {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      await handleImportStream(res);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Lỗi mạng — kiểm tra API đang chạy.",
      );
      resetImportProgress();
    }
  };

  const importExcelFile = async (file: File | null): Promise<void> => {
    if (!file) return;
    resetImportProgress();

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(
        `${apiBase()}/admin/system/import/excel?stream=true`,
        {
          method: "POST",
          headers: authHeaders(),
          body: fd,
        },
      );
      await handleImportStream(res);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Lỗi mạng — kiểm tra API đang chạy.",
      );
      resetImportProgress();
    }
  };

  const importBusy = importProgress.active && importProgress.status === "importing";
  const exportBusy = exporting !== null;

  const showBackupPanel = canExport || canImport;

  return (
    <AdminPageSection className="space-y-4">
      <AdminListPageHeader
        icon={Database}
        title="Sao lưu & phục hồi dữ liệu"
        subtitle="Snapshot toàn hệ thống — chọn thư mục lưu, xuất hoặc import file export."
      />

      {readAdminSession() == null ? (
        <Alert variant="destructive" className="py-3">
          <AlertTitle className="text-sm">Chưa đăng nhập admin</AlertTitle>
          <AlertDescription className="text-xs">
            Cần quyền{" "}
            <code className="rounded bg-muted px-1">settings:manage</code> hoặc{" "}
            <code className="rounded bg-muted px-1">settings:import</code>.
          </AlertDescription>
        </Alert>
      ) : null}

      {showBackupPanel ? (
        <FieldSet variant="section">
          <FieldSectionLegend
            icon={Database}
            title="Thao tác sao lưu"
            description="hub-system-export-YYYY-MM-DD (.json / .xlsx)"
            badge={
              canExport ? (
                exportReady ? (
                  <Badge variant="outline" className="text-xs font-normal">
                    Sẵn sàng xuất
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs font-normal">
                    Chọn thư mục
                  </Badge>
                )
              ) : undefined
            }
          />
          <FieldSetContent
            variant="section"
            className="space-y-4 px-4 pb-4 pt-0 sm:px-5"
          >
            {canExport ? (
              <div className="space-y-2">
                <FieldSectionLabel icon={Download}>
                  Xuất dữ liệu
                </FieldSectionLabel>
                <FieldSectionValue className="flex min-h-10 flex-wrap items-center gap-2 py-2">
                  <FolderOpen
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate font-mono text-xs sm:text-sm",
                      exportDirectory
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                    title={
                      exportDirectory?.name ??
                      (directoryPickerSupported
                        ? "Chưa chọn thư mục"
                        : "Hộp thoại lưu khi xuất")
                    }
                  >
                    {exportDirectory
                      ? exportDirectory.name
                      : directoryPickerSupported
                        ? "Chưa chọn thư mục"
                        : "Hộp thoại lưu khi xuất"}
                  </span>
                  {directoryPickerSupported ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 shrink-0 gap-1.5"
                        disabled={pickingDirectory || exportBusy}
                        onClick={() => void chooseExportDirectory()}
                      >
                        {pickingDirectory ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <FolderOpen className="size-3.5" />
                        )}
                        Thư mục
                      </Button>
                      {exportDirectory ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 shrink-0 px-2 text-muted-foreground"
                          disabled={exportBusy}
                          onClick={() => setExportDirectory(null)}
                        >
                          Bỏ
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                  <span
                    className="hidden h-5 w-px shrink-0 bg-border sm:block"
                    aria-hidden
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 gap-1.5"
                    disabled={exportBusy || !exportReady}
                    onClick={() => void exportJson()}
                  >
                    {exporting === "json" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <FileJson className="size-3.5" />
                    )}
                    JSON
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 shrink-0 gap-1.5"
                    disabled={exportBusy || !exportReady}
                    onClick={() => void exportExcel()}
                  >
                    {exporting === "excel" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="size-3.5" />
                    )}
                    Excel
                  </Button>
                </FieldSectionValue>
              </div>
            ) : null}

            {canExport && canImport ? (
              <FieldSectionDivider />
            ) : null}

            {canImport ? (
              <div className="space-y-2">
                <FieldSectionLabel
                  icon={Upload}
                  className="text-destructive normal-case"
                >
                  Import — ghi đè toàn bộ
                  <Badge
                    variant="destructive"
                    className="ml-2 align-middle text-[10px] font-normal"
                  >
                    Nguy hiểm
                  </Badge>
                </FieldSectionLabel>
                <FieldDescription className="text-xs">
                  Xóa dữ liệu các bảng đã đăng ký rồi nạp lại — chỉ dùng khi đã
                  sao lưu.
                </FieldDescription>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field className="gap-1.5">
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium normal-case">
                      <FileJson className="size-3.5 text-sky-600" />
                      File JSON
                    </FieldLabel>
                    <FieldSectionValue className="px-4 py-1">
                      <Input
                        type="file"
                        accept="application/json,.json"
                        disabled={importBusy}
                        className={FILE_INPUT_CLASS}
                        onChange={(e) =>
                          void importJsonFile(
                            e.target.files?.[0] ?? null,
                          ).finally(() => {
                            e.target.value = "";
                          })
                        }
                      />
                    </FieldSectionValue>
                  </Field>

                  <Field className="gap-1.5">
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium normal-case">
                      <FileSpreadsheet className="size-3.5 text-emerald-600" />
                      File Excel
                    </FieldLabel>
                    <FieldSectionValue className="px-4 py-1">
                      <Input
                        type="file"
                        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        disabled={importBusy}
                        className={FILE_INPUT_CLASS}
                        onChange={(e) =>
                          void importExcelFile(
                            e.target.files?.[0] ?? null,
                          ).finally(() => {
                            e.target.value = "";
                          })
                        }
                      />
                    </FieldSectionValue>
                  </Field>
                </div>

                {importProgress.active ? (
                  <ImportProgressPanel
                    progress={importProgress}
                    onReset={resetImportProgress}
                  />
                ) : null}
              </div>
            ) : null}
          </FieldSetContent>
        </FieldSet>
      ) : null}

      <EntitySchemaPanel />
    </AdminPageSection>
  );
}

export default function DataBackupPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <DataBackupPageInner />
    </AdminPageGuard>
  );
}
