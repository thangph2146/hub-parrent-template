"use client"

import {
  useState,
  type ComponentProps,
  type CSSProperties,
  type Ref,
  type ReactNode,
} from "react"
import { flushSync } from "react-dom"
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
  RowActionsMenuGroups,
  rowActionsGroupLabelClassName,
} from "./row-actions-menu-shared"
import {
  useDataTableRowActionsRegistryOptional,
  useDataTableScopeId,
  type RegisteredDataTableRowActions,
} from "./data-table-row-actions-registry"
import type { DataTableRowActionItem } from "./table-row-actions"
import { useDataTableRowActionRunnerOptional } from "./row-action-confirm"

function ContextMenuRowActionItem({
  action,
  onRun,
  busy,
}: {
  action: DataTableRowActionItem
  onRun: (action: DataTableRowActionItem) => void
  busy?: boolean
}) {
  return (
    <ContextMenuItem
      disabled={action.disabled || busy}
      variant={action.menuVariant ?? "default"}
      label={action.label}
      onClick={() => {
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
  entry,
  runAction,
}: {
  entry: RegisteredDataTableRowActions
  runAction: (action: DataTableRowActionItem) => void
}) {
  const { groups, byGroup, orderedGroups } = groupRowActions(
    entry.actions,
    entry.groups
  )

  if (orderedGroups.length === 0) {
    return (
      <ContextMenuContent className="w-64 p-1.5">
        <ContextMenuItem disabled className="text-muted-foreground">
          Không có thao tác khả dụng
        </ContextMenuItem>
      </ContextMenuContent>
    )
  }

  return (
    <ContextMenuContent className="w-64 p-1.5">
      <RowActionsMenuGroups
        orderedGroups={orderedGroups}
        groups={groups}
        byGroup={byGroup}
        renderSeparator={() => <ContextMenuSeparator />}
        renderGroup={(children) => <ContextMenuGroup>{children}</ContextMenuGroup>}
        renderGroupLabel={(config, GroupIcon) =>
          config.sublabel ? (
            <ContextMenuLabel className={rowActionsGroupLabelClassName(config)}>
              {config.label}
            </ContextMenuLabel>
          ) : (
            <ContextMenuLabel className={rowActionsGroupLabelClassName(config)}>
              {GroupIcon ? (
                <GroupIcon className="size-3.5 shrink-0 text-primary" />
              ) : null}
              {config.label}
            </ContextMenuLabel>
          )
        }
        renderItem={(action) => (
          <ContextMenuRowActionItem
            key={action.key}
            action={action}
            onRun={runAction}
            busy={entry.busy}
          />
        )}
      />
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
  const scopeId = useDataTableScopeId()
  const runAction = useDataTableRowActionRunnerOptional()
  const [menuOpen, setMenuOpen] = useState(false)

  const resolveRowActions = () => {
    if (!registry) return null
    const entry = registry.getScoped(scopeId, rowId)
    if (!entry || !registry.hasVisibleActionsScoped(scopeId, rowId)) {
      return null
    }
    return entry
  }

  const openEntry = menuOpen ? resolveRowActions() : null

  if (!enabled || !registry) {
    return (
      <TableRow ref={rowRef} className={className} style={style} {...tableRowProps}>
        {children}
      </TableRow>
    )
  }

  return (
    <ContextMenu
      open={menuOpen}
      onOpenChange={(open) => {
        if (open) {
          if (!resolveRowActions()) {
            setMenuOpen(false)
            return
          }
          flushSync(() => {
            setMenuOpen(true)
          })
          return
        }
        setMenuOpen(false)
      }}
    >
      <ContextMenuTrigger
        render={(triggerProps) => {
          const { ref: triggerRef, className: triggerClassName, style: triggerStyle, ...restTrigger } =
            triggerProps

          return (
            <TableRow
              {...tableRowProps}
              {...restTrigger}
              className={cn(className, triggerClassName)}
              style={{ ...style, ...triggerStyle }}
              onContextMenu={(event) => {
                restTrigger.onContextMenu?.(event)
                if (event.defaultPrevented) return
                if (!resolveRowActions()) {
                  event.preventDefault()
                }
              }}
              ref={(node) => {
                if (typeof triggerRef === "function") {
                  triggerRef(node)
                } else if (triggerRef) {
                  triggerRef.current = node
                }
                if (typeof rowRef === "function") {
                  rowRef(node)
                } else if (rowRef) {
                  rowRef.current = node
                }
              }}
            />
          )
        }}
      >
        {children}
      </ContextMenuTrigger>
      {menuOpen ? (
        runAction && openEntry ? (
          <DataTableRowContextMenuContent
            entry={openEntry}
            runAction={runAction}
          />
        ) : (
          <ContextMenuContent className="w-64 p-1.5">
            <ContextMenuItem disabled className="text-muted-foreground">
              Không có thao tác khả dụng
            </ContextMenuItem>
          </ContextMenuContent>
        )
      ) : null}
    </ContextMenu>
  )
}
