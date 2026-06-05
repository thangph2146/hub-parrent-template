"use client"

import type { ComponentType, ReactNode, ReactElement } from "react"
import { cn } from "../../lib/utils"
import type {
  DataTableRowActionGroupId,
  DataTableRowActionItem,
} from "./table-row-actions"

export type RowActionsMenuGroupConfig = {
  label: string
  icon?: ComponentType<{ className?: string }>
  header?: ReactNode
  /** Nhãn nhóm kiểu phụ (11px, không uppercase) */
  sublabel?: boolean
}

export const ROW_ACTIONS_GROUP_ORDER: DataTableRowActionGroupId[] = [
  "primary",
  "status",
  "danger",
]

export const ROW_ACTIONS_DEFAULT_GROUPS: Record<
  DataTableRowActionGroupId,
  RowActionsMenuGroupConfig
> = {
  primary: { label: "Thao tác", sublabel: false },
  status: { label: "Trạng thái", sublabel: true },
  danger: { label: "Xóa / quản lý", sublabel: true },
}

export function defaultRowActionMenuIconStyles(
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

export function groupRowActions(
  actions: DataTableRowActionItem[],
  groupsOverride?: Partial<
    Record<DataTableRowActionGroupId, RowActionsMenuGroupConfig>
  >
) {
  const visible = actions.filter((action) => !action.hidden)
  const groups = { ...ROW_ACTIONS_DEFAULT_GROUPS, ...groupsOverride }
  const byGroup = new Map<DataTableRowActionGroupId, DataTableRowActionItem[]>()

  for (const action of visible) {
    const groupId = action.group ?? "primary"
    const list = byGroup.get(groupId) ?? []
    list.push(action)
    byGroup.set(groupId, list)
  }

  const orderedGroups = ROW_ACTIONS_GROUP_ORDER.filter(
    (id) => (byGroup.get(id)?.length ?? 0) > 0
  )

  return { visible, groups, byGroup, orderedGroups }
}

export function RowActionsMenuGroups({
  orderedGroups,
  groups,
  byGroup,
  renderItem,
  renderSeparator,
  renderGroup,
  renderGroupLabel,
}: {
  orderedGroups: DataTableRowActionGroupId[]
  groups: Record<DataTableRowActionGroupId, RowActionsMenuGroupConfig>
  byGroup: Map<DataTableRowActionGroupId, DataTableRowActionItem[]>
  renderItem: (action: DataTableRowActionItem) => ReactElement
  renderSeparator: () => ReactElement
  renderGroup: (children: ReactNode) => ReactElement
  renderGroupLabel: (config: RowActionsMenuGroupConfig, GroupIcon?: ComponentType<{ className?: string }>) => ReactElement
}) {
  return (
    <>
      {orderedGroups.map((groupId, index) => {
        const config = groups[groupId]
        const items = byGroup.get(groupId) ?? []
        const GroupIcon = config.icon

        return (
          <div key={groupId}>
            {index > 0 ? renderSeparator() : null}
            {renderGroup(
              <>
                {renderGroupLabel(config, GroupIcon)}
                {config.header ? (
                  <div className="mb-1.5 px-1">{config.header}</div>
                ) : null}
                {items.map((action) => renderItem(action))}
              </>
            )}
          </div>
        )
      })}
    </>
  )
}

export function rowActionsGroupLabelClassName(
  config: RowActionsMenuGroupConfig
): string {
  return config.sublabel
    ? "px-1 py-1 text-[11px] font-medium text-muted-foreground"
    : "flex items-center gap-2 px-1 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
}

export function RowActionMenuItemBody({
  action,
}: {
  action: DataTableRowActionItem
}) {
  const styles = defaultRowActionMenuIconStyles(action.key, action.menuVariant)
  const iconBg = action.iconBgClassName ?? styles.iconBgClassName
  const iconColor = action.iconClassName ?? styles.iconClassName

  return (
    <>
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
    </>
  )
}
