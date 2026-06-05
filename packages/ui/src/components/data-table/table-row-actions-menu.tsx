"use client"

import type { ComponentType, ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "../button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { cn } from "../../lib/utils"
import type {
  DataTableRowActionGroupId,
  DataTableRowActionItem,
} from "./table-row-actions"
import { useRowActionConfirm } from "./row-action-confirm"

export type RowActionsMenuGroupConfig = {
  label: string
  icon?: ComponentType<{ className?: string }>
  header?: ReactNode
  /** Nhãn nhóm kiểu phụ (11px, không uppercase) */
  sublabel?: boolean
}

const GROUP_ORDER: DataTableRowActionGroupId[] = ["primary", "status", "danger"]

const DEFAULT_GROUPS: Record<
  DataTableRowActionGroupId,
  RowActionsMenuGroupConfig
> = {
  primary: { label: "Thao tác", sublabel: false },
  status: { label: "Trạng thái", sublabel: true },
  danger: { label: "Xóa / quản lý", sublabel: true },
}

function defaultMenuIconStyles(
  key: string,
  variant?: "default" | "destructive"
) {
  if (
    variant === "destructive" ||
    key.includes("purge") ||
    key.includes("delete")
  ) {
    return {
      iconBgClassName: "bg-destructive/10",
      iconClassName: "text-destructive",
    }
  }
  if (key === "view") {
    return {
      iconBgClassName: "bg-primary/10",
      iconClassName: "text-primary",
    }
  }
  if (key === "edit") {
    return {
      iconBgClassName: "bg-sky-500/15",
      iconClassName: "text-sky-700 dark:text-sky-400",
    }
  }
  if (key === "toggle-active" || key === "activate") {
    return {
      iconBgClassName: "bg-emerald-500/15",
      iconClassName: "text-emerald-700 dark:text-emerald-400",
    }
  }
  if (key === "toggle-inactive" || key === "deactivate") {
    return {
      iconBgClassName: "bg-amber-500/15",
      iconClassName: "text-amber-700 dark:text-amber-400",
    }
  }
  if (key === "restore") {
    return {
      iconBgClassName: "bg-violet-500/15",
      iconClassName: "text-violet-700 dark:text-violet-400",
    }
  }
  return {
    iconBgClassName: "bg-muted",
    iconClassName: "text-muted-foreground",
  }
}

function RowActionsMenuItem({
  action,
  onRun,
}: {
  action: DataTableRowActionItem
  onRun: (action: DataTableRowActionItem) => void
}) {
  const styles = defaultMenuIconStyles(action.key, action.menuVariant)
  const iconBg = action.iconBgClassName ?? styles.iconBgClassName
  const iconColor = action.iconClassName ?? styles.iconClassName

  return (
    <DropdownMenuItem
      disabled={action.disabled}
      variant={action.menuVariant ?? "default"}
      onClick={(event) => {
        event.preventDefault()
        onRun(action)
      }}
      title={action.title}
      className="items-start gap-2.5 py-2"
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
          iconBg
        )}
      >
        {action.icon ? (
          <span
            className={cn("inline-flex [&>svg]:size-3.5", iconColor)}
            aria-hidden
          >
            {action.icon}
          </span>
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="leading-tight font-medium">{action.label}</span>
        {action.hint ? (
          <span className="text-[11px] leading-snug text-muted-foreground">
            {action.hint}
          </span>
        ) : action.disabled && action.title ? (
          <span className="text-[11px] leading-snug text-muted-foreground">
            {action.title}
          </span>
        ) : null}
      </span>
    </DropdownMenuItem>
  )
}

export type DataTableRowActionsMenuProps = {
  actions: DataTableRowActionItem[]
  groups?: Partial<Record<DataTableRowActionGroupId, RowActionsMenuGroupConfig>>
  busy?: boolean
  triggerLabel?: string
  align?: "start" | "center" | "end"
  className?: string
  /** Mặc định true: xóa/khoá/kích hoạt… tự hiện dialog xác nhận. */
  autoConfirmDangerousActions?: boolean
}

export function DataTableRowActionsMenu({
  actions,
  groups: groupsOverride,
  busy,
  triggerLabel = "Mở menu thao tác",
  align = "end",
  className,
  autoConfirmDangerousActions = true,
}: DataTableRowActionsMenuProps) {
  const { runAction, confirmDialog } = useRowActionConfirm(
    autoConfirmDangerousActions
  )
  const visible = actions.filter((action) => !action.hidden)
  if (visible.length === 0) return null

  const groups = { ...DEFAULT_GROUPS, ...groupsOverride }
  const byGroup = new Map<DataTableRowActionGroupId, DataTableRowActionItem[]>()

  for (const action of visible) {
    const groupId = action.group ?? "primary"
    const list = byGroup.get(groupId) ?? []
    list.push(action)
    byGroup.set(groupId, list)
  }

  const orderedGroups = GROUP_ORDER.filter(
    (id) => (byGroup.get(id)?.length ?? 0) > 0
  )

  return (
    <>
    <div className={cn("flex justify-start", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-8 shrink-0 p-0"
              disabled={busy}
              aria-label={triggerLabel}
            />
          }
        >
          <MoreHorizontal className="size-4" aria-hidden />
          <span className="sr-only">{triggerLabel}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-64 p-1.5">
          {orderedGroups.map((groupId, index) => {
            const config = groups[groupId]
            const items = byGroup.get(groupId) ?? []
            const GroupIcon = config.icon

            return (
              <div key={groupId}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuGroup>
                  {config.sublabel ? (
                    <DropdownMenuLabel className="px-1 py-1 text-[11px] font-medium text-muted-foreground">
                      {config.label}
                    </DropdownMenuLabel>
                  ) : (
                    <DropdownMenuLabel className="flex items-center gap-2 px-1 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {GroupIcon ? (
                        <GroupIcon className="size-3.5 shrink-0 text-primary" />
                      ) : null}
                      {config.label}
                    </DropdownMenuLabel>
                  )}
                  {config.header ? (
                    <div className="mb-1.5 px-1">{config.header}</div>
                  ) : null}
                  {items.map((action) => (
                    <RowActionsMenuItem
                      key={action.key}
                      action={action}
                      onRun={runAction}
                    />
                  ))}
                </DropdownMenuGroup>
              </div>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    {confirmDialog}
    </>
  )
}
