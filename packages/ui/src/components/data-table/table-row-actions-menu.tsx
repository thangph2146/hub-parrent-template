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
import {
  useDataTableRowActionRunnerOptional,
  useRowActionConfirm,
} from "./row-action-confirm"
import {
  groupRowActions,
  RowActionMenuItemBody,
  RowActionsMenuGroups,
  rowActionsGroupLabelClassName,
  type RowActionsMenuGroupConfig,
} from "./row-actions-menu-shared"
import { useRegisterDataTableRowActions } from "./data-table-row-actions-registry"

export type { RowActionsMenuGroupConfig }

function DropdownRowActionItem({
  action,
  onRun,
  busy,
}: {
  action: DataTableRowActionItem
  onRun: (action: DataTableRowActionItem) => void
  busy?: boolean
}) {
  return (
    <DropdownMenuItem
      disabled={action.disabled || busy}
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
  /**
   * Tự hiện dialog xác nhận với thao tác danger khi action không khai báo `confirm`.
   * Mặc định `true`; đặt `false` khi mỗi action đã có `confirm` riêng hoặc dùng `pageConfirm`.
   */
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
  const sharedRunAction = useDataTableRowActionRunnerOptional()
  const localConfirm = useRowActionConfirm(autoConfirmDangerousActions)
  const runAction =
    sharedRunAction ??
    ((action: DataTableRowActionItem) => localConfirm.runAction(action))
  const confirmDialog = sharedRunAction ? null : localConfirm.confirmDialog

  const { visible, groups, byGroup, orderedGroups } = groupRowActions(
    actions,
    groupsOverride
  )

  useRegisterDataTableRowActions({
    actions,
    groups: groupsOverride,
    busy,
    autoConfirmDangerousActions,
  })

  if (visible.length === 0) {
    return <span className="block h-8 w-full" aria-hidden />
  }

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
            <RowActionsMenuGroups
              orderedGroups={orderedGroups}
              groups={groups}
              byGroup={byGroup}
              renderSeparator={() => <DropdownMenuSeparator />}
              renderGroup={(children) => (
                <DropdownMenuGroup>{children}</DropdownMenuGroup>
              )}
              renderGroupLabel={(config, GroupIcon) =>
                config.sublabel ? (
                  <DropdownMenuLabel
                    className={rowActionsGroupLabelClassName(config)}
                  >
                    {config.label}
                  </DropdownMenuLabel>
                ) : (
                  <DropdownMenuLabel
                    className={rowActionsGroupLabelClassName(config)}
                  >
                    {GroupIcon ? (
                      <GroupIcon className="size-3.5 shrink-0 text-primary" />
                    ) : null}
                    {config.label}
                  </DropdownMenuLabel>
                )
              }
              renderItem={(action) => (
                <DropdownRowActionItem
                  key={action.key}
                  action={action}
                  onRun={runAction}
                  busy={busy}
                />
              )}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {confirmDialog}
    </>
  )
}
