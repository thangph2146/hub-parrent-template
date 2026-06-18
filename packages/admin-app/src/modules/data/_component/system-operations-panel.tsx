"use client"

import { useMemo, useState } from "react"
import { toast } from "@ui/components/sonner"
import { Button } from "@ui/components/button"
import { Badge } from "@ui/components/badge"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import {
  FieldDescription,
  FieldSectionLegend,
  FieldSectionValue,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import { api } from "@workspace/admin-app/lib/api"
import type {
  DatabaseSchemaResponse,
  SystemBootstrapResult,
} from "@workspace/api-client"
import {
  Check,
  ClipboardCheck,
  Copy,
  DatabaseZap,
  Loader2,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react"
import {
  buildDatabaseVerificationReport,
  buildSeedBootstrapReport,
  copyTextToClipboard,
  toastSystemOperationResult,
} from "./system-operation-result"
import { formatEntityRowCount } from "./utils"

type OperationStatus = "idle" | "running" | "done" | "error"

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Thao tác hệ thống thất bại."
}

function buildFullOperationReport(options: {
  seedResult?: SystemBootstrapResult
  schema?: DatabaseSchemaResponse
  error?: string
}): string {
  const parts: string[] = []
  if (options.seedResult) {
    parts.push(buildSeedBootstrapReport(options.seedResult))
  }
  if (options.schema) {
    if (parts.length) parts.push("")
    parts.push(buildDatabaseVerificationReport(options.schema))
  }
  if (options.error) {
    if (parts.length) parts.push("")
    parts.push("=== Lỗi thao tác ===", options.error)
  }
  return parts.join("\n")
}

export function SystemOperationsPanel() {
  const [status, setStatus] = useState<OperationStatus>("idle")
  const [seedResult, setSeedResult] = useState<SystemBootstrapResult | null>(
    null
  )
  const [verifiedSchema, setVerifiedSchema] =
    useState<DatabaseSchemaResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const reportText = useMemo(
    () =>
      buildFullOperationReport({
        seedResult: seedResult ?? undefined,
        schema: verifiedSchema ?? undefined,
        error: status === "error" ? (message ?? undefined) : undefined,
      }),
    [message, seedResult, status, verifiedSchema]
  )

  const runSeedAndVerify = async () => {
    setStatus("running")
    setMessage("Đang chạy seed hệ thống…")
    setSeedResult(null)
    setVerifiedSchema(null)
    try {
      const result = await api.system.runSeedBootstrap()
      setSeedResult(result)
      toastSystemOperationResult({
        success: true,
        title: "Seed hệ thống hoàn tất",
        description: "Đang kiểm tra lại cơ sở dữ liệu sau seed.",
      })

      setMessage("Đang kiểm tra cơ sở dữ liệu sau seed…")
      const schema = await api.system.getDatabaseSchema()
      setVerifiedSchema(schema)
      setStatus("done")
      const isComplete = schema.verification?.isComplete
      const summary =
        schema.verification == null
          ? `${schema.tables.length} bảng, ${formatEntityRowCount(schema.totalActiveRows)} bản ghi active.`
          : isComplete
            ? `Khớp manifest: ${schema.verification.matchedModels} bảng.`
            : `Chưa khớp manifest: ${schema.verification.mismatchedModels} bảng lệch.`
      setMessage(summary)
      toastSystemOperationResult({
        success: schema.verification?.isComplete !== false,
        title:
          schema.verification?.isComplete === false
            ? "Seed xong nhưng dữ liệu chưa khớp"
            : "Seed xong và DB đã được kiểm tra",
        description: summary,
      })
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setStatus("error")
      setMessage(errorMessage)
      toastSystemOperationResult({
        success: false,
        title: "Thao tác hệ thống thất bại",
        description: errorMessage,
      })
    }
  }

  const copyReport = async () => {
    if (!reportText.trim()) {
      toast.error("Chưa có kết quả thao tác để copy.")
      return
    }
    const ok = await copyTextToClipboard(reportText)
    if (!ok) {
      toast.error("Không copy được — thử chọn và copy thủ công.")
      return
    }
    setCopied(true)
    toast.success("Đã copy kết quả chi tiết.")
    window.setTimeout(() => setCopied(false), 2000)
  }

  const busy = status === "running"
  const hasResult = Boolean(reportText.trim())
  const verification = verifiedSchema?.verification

  return (
    <FieldSet variant="section">
      <FieldSectionLegend
        icon={DatabaseZap}
        title="Thao tác hệ thống"
        description="Chạy seed bootstrap, kiểm tra DB sau thao tác và copy báo cáo chi tiết."
        badge={
          status === "done" ? (
            <Badge variant="outline" className="text-xs font-normal">
              Đã kiểm tra DB
            </Badge>
          ) : status === "error" ? (
            <Badge variant="destructive" className="text-xs font-normal">
              Có lỗi
            </Badge>
          ) : undefined
        }
      />
      <FieldSetContent
        variant="section"
        className="space-y-3 px-4 pt-0 pb-4 sm:px-5"
      >
        <FieldDescription className="text-xs">
          Dùng sau deploy hoặc sau `db:fresh`: chạy lại superadmin/role/page
          contents seed, sau đó đọc `/database-schema` để xác nhận dữ liệu thật
          trong database.
        </FieldDescription>

        <FieldSectionValue className="flex flex-wrap items-center gap-2 px-4 py-3">
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5"
            disabled={busy}
            onClick={() => void runSeedAndVerify()}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="size-3.5" />
            )}
            Chạy seed + kiểm tra DB
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            disabled={busy || !hasResult}
            onClick={() => void copyReport()}
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Đã copy" : "Copy kết quả chi tiết"}
          </Button>
          {verifiedSchema ? (
            <Badge variant="secondary" className="text-xs font-normal">
              {verifiedSchema.tables.length} bảng ·{" "}
              {formatEntityRowCount(verifiedSchema.totalActiveRows)} bản ghi
            </Badge>
          ) : null}
        </FieldSectionValue>

        {message ? (
          <Alert
            variant={status === "error" ? "destructive" : "default"}
            className="py-3"
          >
            <AlertTitle className="flex items-center gap-2 text-sm">
              {status === "running" ? (
                <RefreshCcw className="size-4 animate-spin" />
              ) : status === "done" ? (
                <ClipboardCheck className="size-4" />
              ) : null}
              {status === "running"
                ? "Đang xử lý"
                : status === "error"
                  ? "Thao tác lỗi"
                  : "Kết quả thao tác"}
            </AlertTitle>
            <AlertDescription className="text-xs">{message}</AlertDescription>
          </Alert>
        ) : null}

        {seedResult ? (
          <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Roles", seedResult.rolesInserted, seedResult.rolesUpdated],
              ["Users", seedResult.usersInserted, seedResult.usersUpdated],
              [
                "User roles",
                seedResult.userRolesInserted,
                seedResult.userRolesSkipped,
              ],
              [
                "Page contents",
                seedResult.pageContentsInserted,
                seedResult.pageContentsSkipped,
              ],
            ].map(([label, primary, secondary]) => (
              <div
                key={label}
                className="rounded-md border bg-background/60 px-3 py-2"
              >
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground">
                  +{primary} · {secondary}{" "}
                  {label === "User roles" || label === "Page contents"
                    ? "đã có"
                    : "cập nhật"}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {verification ? (
          <div
            className={cn(
              "rounded-md border px-3 py-2 text-xs",
              verification.isComplete
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300"
                : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300"
            )}
          >
            <p className="font-medium">
              {verification.isComplete
                ? "DB khớp manifest import"
                : "DB chưa khớp manifest import"}
            </p>
            <p>
              {verification.matchedModels}/
              {verification.matchedModels + verification.mismatchedModels} bảng
              khớp ·{" "}
              {formatEntityRowCount(verification.actualBusinessTotalRows)} /{" "}
              {formatEntityRowCount(verification.expectedBusinessTotalRows)} bản
              ghi nghiệp vụ.
            </p>
          </div>
        ) : null}
      </FieldSetContent>
    </FieldSet>
  )
}
