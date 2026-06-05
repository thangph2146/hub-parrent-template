"use client"

import {
  useState,
  type ComponentProps,
  type CSSProperties,
  type Ref,
  type ReactNode,
} from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../context-menu"
import { TableRow } from "../table"
import { cn } from "../../lib/utils"
import {
  groupRowActions,
  RowActionMenuItemBody,
} from "./row-actions-menu-shared"
import {
  useDataTableRowActionsRegistryOptional,
  useDataTableScopeId,
} from "./data-table-row-actions-registry"
import type { DataTableRowActionItem } from "./table-row-actions"
import { useDataTableRowActionRunnerOptional } from "./row-action-confirm"

function ContextMenuRowActionItem({
  action,
  onRun,
}: {
  action: DataTableRowActionItem
  onRun: (action: DataTableRowActionItem) => void
}) {
  return (
    <ContextMenuItem
      disabled={action.disabled}
      variant={action.menuVariant ?? "default"}
      onClick={(event) => {
        event.preventDefault()
        onRun(action)
      }}
      title={action.title}
      className="items-start gap-2.5 py-2"
    >
      <RowActionMenuItemBody action={action} />
    </ContextMenuItem>
  )
}

function DataTableRowContextMenuContent({
  rowId,
  refreshKey,
}: {
  rowId: string
  refreshKey: number
}) {
  const registry = useDataTableRowActionsRegistryOptional()
  const scopeId = useDataTableScopeId()
  const runAction = useDataTableRowActionRunnerOptional()
  void refreshKey
  const entry = registry?.getScoped(scopeId, rowId)

  if (!entry || !runAction) return null

  const { groups, byGroup, orderedGroups } = groupRowActions(
    entry.actions,
    entry.groups
  )

  if (orderedGroups.length === 0) return null

  return (
    <ContextMenuContent className="w-64 p-1.5">
      {orderedGroups.map((groupId, index) => {
        const config = groups[groupId]
        const items = byGroup.get(groupId) ?? []
        const GroupIcon = config.icon

        return (
          <div key={groupId}>
            {index > 0 ? <ContextMenuSeparator /> : null}
            <ContextMenuGroup>
              {config.sublabel ? (
                <ContextMenuLabel className="px-1 py-1 text-[11px] font-medium text-muted-foreground">
                  {config.label}
                </ContextMenuLabel>
              ) : (
                <ContextMenuLabel className="flex items-center gap-2 px-1 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {GroupIcon ? (
                    <GroupIcon className="size-3.5 shrink-0 text-primary" />
                  ) : null}
                  {config.label}
                </ContextMenuLabel>
              )}
              {config.header ? (
                <div className="mb-1.5 px-1">{config.header}</div>
              ) : null}
              {items.map((action) => (
                <ContextMenuRowActionItem
                  key={action.key}
                  action={action}
                  onRun={runAction}
                />
              ))}
            </ContextMenuGroup>
          </div>
        )
      })}
    </ContextMenuContent>
  )
}

export type DataTableRowContextMenuProps = {
  rowId: string
  enabled?: boolean
  rowRef?: Ref<HTMLTableRowElement>
  className?: string
  style?: CSSProperties
  children: ReactNode
} & Omit<ComponentProps<typeof TableRow>, "children" | "className" | "style">

export function DataTableRowContextMenu({
  rowId,
  enabled = true,
  rowRef,
  className,
  style,
  children,
  ...tableRowProps
}: DataTableRowContextMenuProps) {
  const registry = useDataTableRowActionsRegistryOptional()
  const [refreshKey, setRefreshKey] = useState(0)

  if (!enabled || !registry) {
    return (
      <TableRow ref={rowRef} className={className} style={style} {...tableRowProps}>
        {children}
      </TableRow>
    )
  }

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) setRefreshKey((key) => key + 1)
      }}
    >
      <ContextMenuTrigger
        render={
          <TableRow
            className={cn(className)}
            style={style}
            ref={rowRef}
            {...tableRowProps}
          />
        }
      >
        {children}
      </ContextMenuTrigger>
      <DataTableRowContextMenuContent rowId={rowId} refreshKey={refreshKey} />
    </ContextMenu>
  )
}
