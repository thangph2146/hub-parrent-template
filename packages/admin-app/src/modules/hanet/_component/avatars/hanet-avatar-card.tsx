"use client"

import { useCallback, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Fingerprint,
  GraduationCap,
  Hash,
  Mail,
  ScanFace,
  UserRound,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { Card, CardContent, CardFooter } from "@ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/components/tooltip"
import type { HanetStoredAvatarRow } from "@workspace/api-client"
import { cn } from "@ui/lib/utils"
import {
  formatHanetAvatarDate,
  hanetAliasFieldLabel,
  hanetAvatarInitials,
  hanetAvatarLabel,
  hanetAvatarSrc,
  truncateMiddleId,
} from "../shared/hanet-avatar-utils"

function CopyIconButton({
  value,
  label,
}: {
  value: string
  label: string
}) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // ignore
    }
  }, [value])

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`Sao chép ${label}`}
            onClick={() => void onCopy()}
          />
        }
      >
        {copied ? (
          <Check className="size-3.5 text-success" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
      </TooltipTrigger>
      <TooltipContent>{copied ? "Đã sao chép" : `Sao chép ${label}`}</TooltipContent>
    </Tooltip>
  )
}

function InfoLine({
  icon: Icon,
  label,
  value,
  displayValue,
  copyLabel,
}: {
  icon: LucideIcon
  label: string
  value: string
  displayValue?: string
  copyLabel: string
}) {
  const shown = displayValue ?? value

  return (
    <div className="flex min-w-0 items-center gap-2 py-2 first:pt-0 last:pb-0">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] leading-none text-muted-foreground">{label}</p>
        <p
          className="mt-0.5 truncate font-mono text-xs font-medium text-foreground"
          title={value}
        >
          {shown}
        </p>
      </div>
      <CopyIconButton value={value} label={copyLabel} />
    </div>
  )
}

function HanetAvatarInlineCard({
  row,
  label,
  src,
  alias,
  personId,
  aliasLabel,
}: {
  row: HanetStoredAvatarRow
  label: string
  src: string
  alias: string
  personId: string
  aliasLabel: string
}) {
  return (
    <div className="flex min-w-0 items-stretch gap-2.5 overflow-hidden rounded-lg border border-border/70 bg-card p-2 shadow-sm transition-colors hover:border-primary/30">
      <div className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {src ? (
          <img
            src={src}
            alt={label}
            className="size-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
            {hanetAvatarInitials(label)}
          </div>
        )}
        {row.userId ? (
          <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-success ring-2 ring-card" title={`User #${row.userId}`} />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-0.5 py-0.5">
        <p className="truncate text-sm font-semibold leading-tight text-foreground" title={label}>
          {label}
        </p>
        {alias ? (
          <p className="truncate text-xs text-muted-foreground" title={alias}>
            <span className="font-medium text-foreground/80">{aliasLabel}:</span> {alias}
          </p>
        ) : null}
        {personId ? (
          <p className="truncate font-mono text-[10px] text-muted-foreground" title={personId}>
            HANET {truncateMiddleId(personId, 8, 4)}
          </p>
        ) : null}
      </div>

      {src ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          nativeButton={false}
          className="size-8 shrink-0 self-center"
          render={
            <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Xem ảnh ${label}`} />
          }
        >
          <ExternalLink className="size-3.5" aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}

export function HanetAvatarCard({
  row,
  compact = false,
}: {
  row: HanetStoredAvatarRow
  compact?: boolean
}) {
  const label = hanetAvatarLabel(row)
  const src = hanetAvatarSrc(row.imagePath)
  const alias = row.hanetAliasId?.trim() ?? ""
  const personId = row.hanetPersonId?.trim() ?? ""
  const updatedLabel = formatHanetAvatarDate(row.updatedAt ?? row.createdAt)
  const hasLocalPlaceholder = row.imagePath.trim().startsWith("hanet:person:")
  const aliasLabel = alias ? hanetAliasFieldLabel(alias) : ""
  const AliasIcon = alias.includes("@") ? Mail : GraduationCap

  if (compact) {
    return (
      <HanetAvatarInlineCard
        row={row}
        label={label}
        src={src}
        alias={alias}
        personId={personId}
        aliasLabel={aliasLabel}
      />
    )
  }

  return (
    <TooltipProvider delay={250}>
      <Card
        size="sm"
        className="gap-0 overflow-hidden border-border/70 py-0 shadow-sm transition-all hover:border-primary/35 hover:shadow-md"
      >
        <div
          className={cn(
            "relative w-full overflow-hidden bg-muted",
            "aspect-[3/4]",
          )}
        >
          {src ? (
            <img
              src={src}
              alt={label}
              className="size-full object-cover object-top transition-transform duration-300 group-hover/card:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-muted/40 to-muted text-muted-foreground">
              <div className="flex size-12 items-center justify-center rounded-full bg-background text-base font-semibold text-foreground shadow-sm">
                {hanetAvatarInitials(label)}
              </div>
              <ScanFace className="size-4 opacity-50" aria-hidden />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pt-10 pb-2.5">
            <p
              className="line-clamp-2 text-sm font-semibold leading-tight text-white"
              title={label}
            >
              {label}
            </p>
            {updatedLabel ? (
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/75">
                <Clock3 className="size-3 shrink-0" aria-hidden />
                {updatedLabel}
              </p>
            ) : null}
          </div>

          {(row.userId || hasLocalPlaceholder) && (
            <div className="absolute top-2 right-2 flex max-w-[calc(100%-1rem)] flex-col items-end gap-1">
              {row.userId ? (
                <Badge
                  variant="success"
                  className="h-5 gap-1 border-0 bg-success/90 px-1.5 text-[10px] text-white shadow-sm"
                >
                  <UserRound className="size-3" aria-hidden />
                  User #{row.userId}
                </Badge>
              ) : null}
              {hasLocalPlaceholder ? (
                <Badge
                  variant="secondary"
                  className="h-5 border-0 bg-background/90 px-1.5 text-[10px] shadow-sm"
                >
                  Chưa có ảnh
                </Badge>
              ) : null}
            </div>
          )}
        </div>

        <CardContent className="space-y-0 px-3 py-2.5">
          <div className="divide-y divide-border/50">
            {alias ? (
              <InfoLine
                icon={AliasIcon}
                label={aliasLabel}
                value={alias}
                copyLabel={aliasLabel}
              />
            ) : null}
            {personId ? (
              <InfoLine
                icon={Fingerprint}
                label="Person ID · HANET"
                value={personId}
                displayValue={truncateMiddleId(personId)}
                copyLabel="Person ID"
              />
            ) : null}
            <InfoLine
              icon={Hash}
              label="Bản ghi local"
              value={String(row.id)}
              copyLabel="ID face_data"
            />
          </div>
        </CardContent>

        {src ? (
          <CardFooter className="gap-2 border-t border-border/50 bg-muted/30 p-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              className="h-8 w-full gap-1.5 text-xs"
              render={
                <a href={src} target="_blank" rel="noopener noreferrer" />
              }
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Xem ảnh gốc
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </TooltipProvider>
  )
}
