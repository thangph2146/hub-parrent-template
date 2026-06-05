"use client"

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
import {
  DATA_TABLE_ROW_ACTIONS_TRIGGER_CLASS,
  type DataTableRowActionGroupId,
  type DataTableRowActionItem,
} from "./table-row-actions"
import { useRowActionConfirm } from "./row-action-confirm"
import {
  groupRowActions,
  RowActionMenuItemBody,
  type RowActionsMenuGroupConfig,
} from "./row-actions-menu-shared"
import { useRegisterDataTableRowActions } from "./data-table-row-actions-registry"

export type { RowActionsMenuGroupConfig }

function DropdownRowActionItem({
  action,
  onRun,
}: {
  action: DataTableRowActionItem
  onRun: (action: DataTableRowActionItem) => void
}) {
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
      <RowActionMenuItemBody action={action} />
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
  const { visible, groups, byGroup, orderedGroups } = groupRowActions(
    actions,
    groupsOverride
  )

  useRegisterDataTableRowActions(
    visible.length > 0
      ? {
          actions,
          groups: groupsOverride,
          busy,
          autoConfirmDangerousActions,
        }
      : null
  )

  if (visible.length === 0) return null

  return (
    <>
      <div className={cn("flex w-full justify-center", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={DATA_TABLE_ROW_ACTIONS_TRIGGER_CLASS}
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
                      <DropdownRowActionItem
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
