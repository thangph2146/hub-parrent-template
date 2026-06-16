"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Loader2, Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/components/collapsible"
import { DataTableToolbarField } from "@ui/components/data-table"
import {
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import {
  SelectPicker,
  type SelectPickerOption,
} from "@ui/components/pickers"
import { cn } from "@ui/lib/utils"
import { api } from "@workspace/admin-app/lib/api"
import {
  getHanetPersonActionMeta,
  HANET_PERSON_LOOKUP_ACTIONS,
  type HanetPersonActionId,
} from "@workspace/admin-app/lib/hanet-person-api-actions"
import {
  parseHanetPersonLookupResult,
  type HanetPersonParsedRow,
} from "@workspace/admin-app/lib/hanet-person-parse"
import { HanetPlaceSelect } from "@workspace/admin-app/modules/hanet-avatars/_component/hanet-place-select"
import { HanetJsonPreview } from "./hanet-json-preview"
import { HanetPersonsTable } from "./hanet-persons-table"

type LookupMode = HanetPersonActionId

function lookupQueryKey(
  mode: LookupMode,
  placeId: string,
  aliasId: string,
  personId: string,
) {
  return ["hanet", "person-lookup", mode, placeId, aliasId, personId] as const
}

async function fetchPersonLookup(
  mode: LookupMode,
  placeId: string,
  aliasId: string,
  personId: string,
): Promise<unknown> {
  const alias = aliasId.trim()
  const pid = personId.trim()
  switch (mode) {
    case "lookup-by-alias-all":
      return api.hanet.listPersonByAliasAll(alias)
    case "lookup-by-alias":
      return api.hanet.listPersonByAlias({
        aliasId: alias,
        placeId: placeId || undefined,
      })
    case "lookup-user-by-alias":
      return api.hanet.getPersonUserByAlias({
        aliasId: alias,
        placeId: placeId || undefined,
      })
    case "lookup-user-by-id":
      return api.hanet.getPersonUserById({
        personId: pid,
        placeId: placeId || undefined,
      })
    default:
      throw new Error("Loại tra cứu không hỗ trợ")
  }
}

function validateLookup(
  mode: LookupMode,
  placeId: string,
  aliasId: string,
  personId: string,
): string | null {
  const meta = getHanetPersonActionMeta(mode)
  if (meta.needsPlace && !placeId.trim()) {
    return "Chọn địa điểm HANET trước khi tra cứu."
  }
  if (meta.needsAliasId && !aliasId.trim()) {
    return "Nhập aliasID (email hoặc mã định danh)."
  }
  if (meta.needsPersonId && !personId.trim()) {
    return "Nhập personID."
  }
  return null
}

export function HanetPersonLookupPanel({
  placeId,
  selectedPlaceId,
  onPlaceChange,
  defaultPlaceId,
}: {
  placeId: string
  selectedPlaceId: string
  onPlaceChange: (placeId: string) => void
  defaultPlaceId?: string | null
}) {
  const [mode, setMode] = useState<LookupMode>("lookup-by-alias")
  const [aliasId, setAliasId] = useState("")
  const [personId, setPersonId] = useState("")
  const [fetchEnabled, setFetchEnabled] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [rawOpen, setRawOpen] = useState(false)

  const modeMeta = getHanetPersonActionMeta(mode)

  const lookupOptions = useMemo<SelectPickerOption[]>(
    () =>
      HANET_PERSON_LOOKUP_ACTIONS.map((action) => ({
        value: action.id,
        label: action.label,
        render: () => (
          <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
            <span className="font-medium">{action.label}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {action.hint}
            </span>
          </span>
        ),
      })),
    [],
  )

  const lookupQuery = useQuery({
    queryKey: lookupQueryKey(mode, placeId, aliasId, personId),
    queryFn: () => fetchPersonLookup(mode, placeId, aliasId, personId),
    enabled:
      fetchEnabled &&
      !validateLookup(mode, placeId, aliasId, personId),
  })

  const parsed = useMemo(
    () =>
      lookupQuery.data != null
        ? parseHanetPersonLookupResult(lookupQuery.data)
        : { items: [] as HanetPersonParsedRow[], total: undefined },
    [lookupQuery.data],
  )

  const runLookup = () => {
    const err = validateLookup(mode, placeId, aliasId, personId)
    setValidationError(err)
    if (err) return
    setFetchEnabled(true)
    if (fetchEnabled) {
      void lookupQuery.refetch()
    }
  }

  const summaryLine =
    fetchEnabled && lookupQuery.isSuccess && !lookupQuery.isFetching
      ? parsed.items.length > 0
        ? `Tìm thấy ${parsed.total ?? parsed.items.length} kết quả · ${modeMeta.label} · placeID ${placeId || "—"}`
        : `Không có person khớp · ${modeMeta.label}`
      : null

  const emptyLabel = !fetchEnabled
    ? "Chọn loại tra cứu, nhập thông tin và bấm Tra cứu."
    : lookupQuery.error
      ? "Không tra cứu được dữ liệu."
      : parsed.items.length === 0
        ? "Không tìm thấy person phù hợp."
        : ""

  return (
    <div className="space-y-3">
      {lookupQuery.error ? (
        <Alert variant="destructive">
          <AlertTitle>Tra cứu thất bại</AlertTitle>
          <AlertDescription>
            {lookupQuery.error instanceof Error
              ? lookupQuery.error.message
              : "Gọi API person HANET thất bại"}
          </AlertDescription>
        </Alert>
      ) : null}

      {validationError ? (
        <Alert variant="destructive">
          <AlertTitle>Thiếu thông tin tra cứu</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldSet variant="section">
        <FieldSectionLegend
          title="Tra cứu person"
          description={modeMeta.hint}
        />
        <FieldSetContent className="space-y-2 p-3">
          <div className="flex flex-wrap items-end gap-2">
            <DataTableToolbarField
              label="Loại tra cứu"
              className="w-full min-w-[10rem] flex-1 sm:max-w-[11rem]"
            >
              <SelectPicker
                value={mode}
                onChange={(next) => {
                  if (typeof next !== "string" || !next) return
                  setMode(next as LookupMode)
                  setFetchEnabled(false)
                  setValidationError(null)
                }}
                options={lookupOptions}
                placeholder="Chọn loại"
                size="sm"
                className="w-full"
              />
            </DataTableToolbarField>

            {modeMeta.needsPlace ? (
              <HanetPlaceSelect
                layout="stacked"
                compact
                value={selectedPlaceId}
                onChange={onPlaceChange}
                defaultPlaceId={defaultPlaceId}
                className="w-full min-w-[10rem] flex-1 sm:max-w-[11rem]"
              />
            ) : null}

            {modeMeta.needsAliasId ? (
              <DataTableToolbarField
                label="aliasID"
                className="w-full min-w-[10rem] flex-1 sm:max-w-xs"
              >
                <Input
                  value={aliasId}
                  onChange={(e) => setAliasId(e.target.value)}
                  placeholder="email@…"
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runLookup()
                  }}
                />
              </DataTableToolbarField>
            ) : null}

            {modeMeta.needsPersonId ? (
              <DataTableToolbarField
                label="personID"
                className="w-full min-w-[9rem] flex-1 sm:max-w-[10rem]"
              >
                <Input
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  placeholder="ID HANET"
                  className="h-8 font-mono text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runLookup()
                  }}
                />
              </DataTableToolbarField>
            ) : null}

            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0 gap-1.5"
              disabled={lookupQuery.isFetching}
              onClick={runLookup}
            >
              {lookupQuery.isFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Tra cứu
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono text-[10px]">
              {modeMeta.hubMethod}
            </Badge>
            <code className="truncate text-[11px]">{modeMeta.hubPath}</code>
            <span className="hidden text-border sm:inline">·</span>
            <code className="truncate text-[11px] text-muted-foreground/80">
              Partner {modeMeta.partnerPath}
            </code>
          </div>
        </FieldSetContent>
      </FieldSet>

      {summaryLine ? (
        <p className="text-sm text-muted-foreground">{summaryLine}</p>
      ) : null}

      {fetchEnabled ? (
        <HanetPersonsTable
          data={parsed.items}
          isLoading={lookupQuery.isFetching}
          emptyLabel={emptyLabel}
          pageIndex={0}
          pageSize={parsed.items.length || 20}
          total={parsed.total ?? parsed.items.length}
          onPageIndexChange={() => {}}
          onPageSizeChange={() => {}}
          compact
        />
      ) : null}

      {fetchEnabled && lookupQuery.isSuccess && lookupQuery.data != null ? (
        <Collapsible open={rawOpen} onOpenChange={setRawOpen}>
          <CollapsibleTrigger
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
              rawOpen && "text-foreground",
            )}
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                rawOpen && "rotate-180",
              )}
            />
            Phản hồi thô từ HANET
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <HanetJsonPreview data={lookupQuery.data} />
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  )
}
