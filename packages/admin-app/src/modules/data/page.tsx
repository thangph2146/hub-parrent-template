"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import { Button } from "@ui/components/button"
import { Badge } from "@ui/components/badge"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import {
  FieldSectionLabel,
  FieldSectionLegend,
  FieldSectionValue,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import { readAdminSession, refreshAdminSessionFromServer } from "@workspace/admin-app/lib/auth-session"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import {
  DEFAULT_API_URL,
  canUserAccess,
  PERMISSION_CODES,
} from "@workspace/api-client"
import { useAdminAuth as useAuth, useAdminApi } from "@workspace/admin-app/runtime"
import {
  Database,
  Download,
  FileSpreadsheet,
  FileJson,
  FolderOpen,
  Loader2,
  Upload,
} from "lucide-react"
import {
  ImportProgressPanel,
  type ImportProgressState,
} from "./import-progress-panel"
import { EntitySchemaPanel } from "./_component"
import {
  runChunkedImport,
} from "./_component/import-chunked"
import {
  buildImportProgressReportFromState,
  formatImportNetworkError,
} from "./_component/import-error-message"
import { ApiError } from "@workspace/api-client"
import { parseExcelToImportData } from "./_component/excel-to-import-data"
import {
  pickExportDirectory,
  saveExportBlob,
  supportsExportDirectoryPicker,
} from "@workspace/admin-app/lib/export-file-save"

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "")
}

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  error?: string | null
  data?: T
}

const FILE_INPUT_HIDDEN = "sr-only"

function DataBackupPageInner() {
  const { user } = useAuth()
  const api = useAdminApi()
  const queryClient = useQueryClient()
  const canExport = user
    ? canUserAccess(user, PERMISSION_CODES.SETTINGS_EXPORT) ||
      canUserAccess(user, PERMISSION_CODES.SETTINGS_MANAGE)
    : false
  const canImport = user
    ? canUserAccess(user, PERMISSION_CODES.SETTINGS_IMPORT) ||
      canUserAccess(user, PERMISSION_CODES.SETTINGS_MANAGE)
    : false
  const [exporting, setExporting] = useState<"json" | "excel" | null>(null)
  const [importProgress, setImportProgress] = useState<ImportProgressState>({
    active: false,
    models: [],
    currentIndex: 0,
    total: 0,
    totalRecords: 0,
    cumulativeImported: 0,
    status: "idle",
  })
  const importProgressRef = useRef(importProgress)
  useEffect(() => {
    importProgressRef.current = importProgress
  }, [importProgress])
  const [pickingDirectory, setPickingDirectory] = useState(false)
  const [exportDirectory, setExportDirectory] =
    useState<FileSystemDirectoryHandle | null>(null)
  const directoryPickerSupported = supportsExportDirectoryPicker()
  const jsonFileInputRef = useRef<HTMLInputElement>(null)
  const excelFileInputRef = useRef<HTMLInputElement>(null)

  const dateStamp = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const authHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = {}
    const session = readAdminSession()
    const uid = session?.id
    if (uid != null) headers["X-User-Id"] = String(uid)
    const email = session?.email?.trim()
    if (email) headers["X-User-Email"] = email
    return headers
  }, [])

  const toastFetchError = useCallback(
    async (res: Response): Promise<string> => {
      let msg = ""
      try {
        const json = (await res.json()) as ApiEnvelope<unknown>
        msg =
          json.message?.trim() ||
          (typeof json.error === "string" ? json.error.trim() : "") ||
          ""
      } catch {
        const t = await res.text()
        msg = t.length > 280 ? `${t.slice(0, 280)}…` : t
      }
      if (res.status === 401) {
        const m =
          msg ||
          "API từ chối: thiếu hoặc sai X-User-Id — hãy đăng nhập lại admin."
        toast.error(m)
        return m
      }
      if (res.status === 403) {
        const m =
          msg || "Không đủ quyền xuất nhập hệ thống cho tài khoản hiện tại."
        toast.error(m)
        return m
      }
      const m = msg || `Lỗi ${res.status}`
      toast.error(m)
      return m
    },
    []
  )
  const chooseExportDirectory = async (): Promise<void> => {
    if (!directoryPickerSupported) {
      toast.error(
        "Trình duyệt không hỗ trợ chọn thư mục. Dùng Chrome hoặc Edge, hoặc hộp thoại lưu file sẽ mở khi xuất."
      )
      return
    }
    setPickingDirectory(true)
    try {
      const dir = await pickExportDirectory()
      if (!dir) return
      setExportDirectory(dir)
      toast.success(`Đã chọn thư mục lưu: ${dir.name}`)
    } catch {
      /* toast: MutationCache */
    } finally {
      setPickingDirectory(false)
    }
  }

  const persistExportBlob = async (
    blob: Blob,
    filename: string,
    mimeType: string,
    mimeLabel: string
  ): Promise<boolean> => {
    const mode = await saveExportBlob(blob, filename, {
      directory: exportDirectory,
      mimeType,
      mimeLabel,
    })
    if (mode === "cancelled") {
      toast.message("Đã hủy lưu file export.")
      return false
    }
    if (mode === "directory") {
      toast.success(
        `Đã lưu ${filename} vào thư mục ${exportDirectory?.name ?? "đã chọn"}.`
      )
      return true
    }
    if (mode === "save-picker") {
      toast.success(`Đã lưu ${filename}.`)
      return true
    }
    toast.success(`Đã tải ${filename} (thư mục Tải xuống mặc định).`)
    return true
  }

  const exportReady = !directoryPickerSupported || exportDirectory !== null

  const exportJson = async (): Promise<void> => {
    if (!exportReady) {
      toast.error("Hãy chọn thư mục lưu trước khi xuất JSON.")
      return
    }
    setExporting("json")
    try {
      const res = await fetch(`${apiBase()}/admin/system/export`, {
        headers: authHeaders(),
      })
      if (!res.ok) {
        await toastFetchError(res)
        return
      }
      const payload = (await res.json()) as ApiEnvelope<
        Record<string, unknown[]>
      >
      if (!payload.success || !payload.data) {
        toast.error(payload.message || "API không trả dữ liệu export hợp lệ.")
        return
      }

      const filename = `hub-system-export-${dateStamp()}.json`
      const blob = new Blob([JSON.stringify(payload.data, null, 2)], {
        type: "application/json;charset=utf-8",
      })
      await persistExportBlob(blob, filename, "application/json", "JSON")
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Lỗi mạng — kiểm tra API đang chạy."
      )
    } finally {
      setExporting(null)
    }
  }

  const exportExcel = async (): Promise<void> => {
    if (!exportReady) {
      toast.error("Hãy chọn thư mục lưu trước khi xuất Excel.")
      return
    }
    setExporting("excel")
    try {
      const res = await fetch(`${apiBase()}/admin/system/export/excel`, {
        headers: authHeaders(),
      })
      if (!res.ok) {
        await toastFetchError(res)
        return
      }
      const filename = `hub-system-export-${dateStamp()}.xlsx`
      const blob = await res.blob()
      await persistExportBlob(
        blob,
        filename,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Excel"
      )
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Lỗi mạng — kiểm tra API đang chạy."
      )
    } finally {
      setExporting(null)
    }
  }

  const resetImportProgress = useCallback(() => {
    setImportProgress({
      active: false,
      models: [],
      currentIndex: 0,
      total: 0,
      totalRecords: 0,
      cumulativeImported: 0,
      status: "idle",
    })
  }, [])

  const runFileImport = useCallback(
    async (
      data: Record<string, unknown[]>,
      source: {
        format: ImportProgressState["sourceFormat"]
        fileName: string
        label: string
        modelTableNames?: Record<string, string>
      }
    ) => {
      const modelKeys = Object.keys(data).filter(
        (key) => Array.isArray(data[key]) && data[key].length > 0
      )
      if (modelKeys.length === 0) {
        toast.error(`File ${source.label} không chứa dữ liệu nào.`)
        return
      }

      const totalRecords = modelKeys.reduce(
        (sum, key) => sum + (data[key] as unknown[]).length,
        0
      )
      const pendingState: ImportProgressState = {
        ...importProgressRef.current,
        active: true,
        sourceFormat: source.format,
        sourceFileName: source.fileName,
        totalRecords,
        status: "importing",
        message: "Đang tải cấu hình import…",
      }
      importProgressRef.current = pendingState
      setImportProgress(pendingState)
      const importStartedAt = Date.now()

      try {
        const config = await api.system.getImportConfig()
        const result = await runChunkedImport({
          api,
          config,
          data,
          sourceFormat: source.format,
          sourceFileName: source.fileName,
          modelTableNames: source.modelTableNames,
          onProgress: (state) => {
            importProgressRef.current = state
            setImportProgress(state)
          },
        })
        const toastOpts = {
          copyStartedAt: importStartedAt,
          copyReport:
            result.copyReport ??
            buildImportProgressReportFromState(importProgressRef.current),
        }
        if (result.success) {
          toast.success(result.message, toastOpts)
          try {
            await refreshAdminSessionFromServer()
          } catch {
            /* session refresh best-effort */
          }
          await queryClient.invalidateQueries({
            queryKey: ["system", "database-schema"],
          })
          await queryClient.refetchQueries({
            queryKey: ["system", "database-schema"],
          })
        } else {
          toast.error(result.message, toastOpts)
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message.trim() ||
              "Không tải được cấu hình import từ API."
            : formatImportNetworkError(error)
        const errorState: ImportProgressState = {
          ...importProgressRef.current,
          active: true,
          status: "error",
          message,
        }
        importProgressRef.current = errorState
        setImportProgress(errorState)
        toast.error(message, {
          copyStartedAt: importStartedAt,
          copyReport: buildImportProgressReportFromState(errorState),
        })
      }
    },
    [api, queryClient]
  )

  const importJsonFile = async (file: File | null): Promise<void> => {
    if (!file) return
    resetImportProgress()

    try {
      const text = await file.text()
      let body: Record<string, unknown[]>
      try {
        body = JSON.parse(text) as Record<string, unknown[]>
      } catch {
        toast.error("File không phải JSON hợp lệ.")
        return
      }
      await runFileImport(body, {
        format: "json",
        fileName: file.name,
        label: "JSON",
        modelTableNames: Object.fromEntries(
          Object.keys(body)
            .filter((key) => Array.isArray(body[key]) && body[key]!.length > 0)
            .map((key) => [key, key])
        ),
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không đọc được file JSON."
      )
      resetImportProgress()
    }
  }

  const importExcelFile = async (file: File | null): Promise<void> => {
    if (!file) return
    resetImportProgress()

    try {
      const buffer = await file.arrayBuffer()
      const { data: body, modelTableNames } = parseExcelToImportData(buffer)
      await runFileImport(body, {
        format: "xlsx",
        fileName: file.name,
        label: "Excel",
        modelTableNames,
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không đọc được file Excel."
      )
      resetImportProgress()
    }
  }

  const importBusy =
    importProgress.active && importProgress.status === "importing"
  const exportBusy = exporting !== null

  const showBackupPanel = canExport || canImport

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
            className="space-y-4 px-4 pt-0 pb-4 sm:px-5"
          >
            <div
              className={cn(
                "grid gap-4",
                canExport && canImport ? "md:grid-cols-2" : "grid-cols-1"
              )}
            >
              {canExport ? (
                <div className="min-w-0 space-y-2">
                  <FieldSectionLabel icon={Download}>
                    Xuất dữ liệu
                  </FieldSectionLabel>
                  <FieldSectionValue copyable={false} className="p-2 sm:p-2.5">
                    <div className="flex flex-col gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <FolderOpen
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-xs sm:text-sm",
                            exportDirectory
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
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
                          <div className="flex shrink-0 items-center gap-0.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 px-2 text-xs"
                              disabled={pickingDirectory || exportBusy}
                              onClick={() => void chooseExportDirectory()}
                            >
                              {pickingDirectory ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <FolderOpen className="size-3.5" />
                              )}
                              Chọn
                            </Button>
                            {exportDirectory ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-muted-foreground"
                                disabled={exportBusy}
                                onClick={() => setExportDirectory(null)}
                              >
                                Bỏ
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 flex-1 gap-1 px-2.5 text-xs sm:flex-initial"
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
                          className="h-7 flex-1 gap-1 px-2.5 text-xs sm:flex-initial"
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
                      </div>
                    </div>
                  </FieldSectionValue>
                </div>
              ) : null}

              {canImport && !importProgress.active ? (
                <div className="min-w-0 space-y-2">
                  <FieldSectionLabel
                    icon={Upload}
                    className="text-destructive normal-case"
                  >
                    Import
                    <Badge
                      variant="destructive"
                      className="ml-1.5 align-middle text-[10px] font-normal"
                    >
                      Ghi đè
                    </Badge>
                  </FieldSectionLabel>
                  <FieldSectionValue copyable={false} className="p-2 sm:p-2.5">
                    <p className="mb-2 text-[11px] leading-snug text-muted-foreground">
                      Chỉ dùng khi đã sao lưu. File lớn gửi theo lô (~500 bản
                      ghi/lần).
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={jsonFileInputRef}
                        type="file"
                        accept="application/json,.json"
                        className={FILE_INPUT_HIDDEN}
                        onChange={(e) =>
                          void importJsonFile(
                            e.target.files?.[0] ?? null
                          ).finally(() => {
                            e.target.value = ""
                          })
                        }
                      />
                      <input
                        ref={excelFileInputRef}
                        type="file"
                        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        className={FILE_INPUT_HIDDEN}
                        onChange={(e) =>
                          void importExcelFile(
                            e.target.files?.[0] ?? null
                          ).finally(() => {
                            e.target.value = ""
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 px-2.5 text-xs"
                        disabled={importBusy}
                        onClick={() => jsonFileInputRef.current?.click()}
                      >
                        <FileJson className="size-3.5 text-sky-600" />
                        Chọn JSON
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 px-2.5 text-xs"
                        disabled={importBusy}
                        onClick={() => excelFileInputRef.current?.click()}
                      >
                        <FileSpreadsheet className="size-3.5 text-emerald-600" />
                        Chọn Excel
                      </Button>
                    </div>
                  </FieldSectionValue>
                </div>
              ) : null}
            </div>

            {canImport && importProgress.active ? (
              <ImportProgressPanel
                progress={importProgress}
                onReset={resetImportProgress}
              />
            ) : null}
          </FieldSetContent>
        </FieldSet>
      ) : null}

      <EntitySchemaPanel schemaEnabled={!importBusy} />
    </AdminPageSection>
  )
}

export default function DataBackupPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <DataBackupPageInner />
    </AdminPageGuard>
  )
}
