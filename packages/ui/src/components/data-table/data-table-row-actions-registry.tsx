"use client"

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import type { DataTableRowActionGroupId } from "./table-row-actions"
import type { DataTableRowActionItem } from "./table-row-actions"
import type { RowActionsMenuGroupConfig } from "./row-actions-menu-shared"
import {
  DataTableRowActionConfirmRunnerProvider,
  useRowActionConfirm,
} from "./row-action-confirm"

const DEFAULT_TABLE_SCOPE_ID = "default"

const DataTableScopeContext = createContext<string>(DEFAULT_TABLE_SCOPE_ID)

export function DataTableScopeProvider({
  scopeId,
  children,
}: {
  scopeId: string
  children: ReactNode
}) {
  return (
    <DataTableScopeContext.Provider value={scopeId}>
      {children}
    </DataTableScopeContext.Provider>
  )
}

export function useDataTableScopeId(): string {
  return useContext(DataTableScopeContext)
}

function buildScopedRowKey(scopeId: string, rowId: string): string {
  return `${scopeId}::${rowId}`
}

export type RegisteredDataTableRowActions = {
  actions: DataTableRowActionItem[]
  groups?: Partial<Record<DataTableRowActionGroupId, RowActionsMenuGroupConfig>>
  busy?: boolean
  autoConfirmDangerousActions?: boolean
}

type DataTableRowActionsRegistryValue = {
  registerScoped: (
    scopeId: string,
    rowId: string,
    entry: RegisteredDataTableRowActions | null
  ) => void
  getScoped: (
    scopeId: string,
    rowId: string
  ) => RegisteredDataTableRowActions | null
  hasVisibleActionsScoped: (scopeId: string, rowId: string) => boolean
}

const DataTableRowActionsRegistryContext =
  createContext<DataTableRowActionsRegistryValue | null>(null)

const DataTableRowActionsRowIdContext = createContext<string | null>(null)

function rowHasVisibleActions(entry: RegisteredDataTableRowActions | null): boolean {
  if (!entry) return false
  return entry.actions.some((action) => !action.hidden && !action.disabled)
}

export function DataTableRowActionsRegistryProvider({
  children,
}: {
  children: ReactNode
}) {
  const registryRef = useRef(new Map<string, RegisteredDataTableRowActions>())

  const value = useMemo<DataTableRowActionsRegistryValue>(
    () => ({
      registerScoped: (scopeId, rowId, entry) => {
        const key = buildScopedRowKey(scopeId, rowId)
        if (entry == null) {
          registryRef.current.delete(key)
          return
        }
        registryRef.current.set(key, entry)
      },
      getScoped: (scopeId, rowId) =>
        registryRef.current.get(buildScopedRowKey(scopeId, rowId)) ?? null,
      hasVisibleActionsScoped: (scopeId, rowId) =>
        rowHasVisibleActions(
          registryRef.current.get(buildScopedRowKey(scopeId, rowId)) ?? null
        ),
    }),
    []
  )

  return (
    <DataTableRowActionsRegistryContext.Provider value={value}>
      {children}
    </DataTableRowActionsRegistryContext.Provider>
  )
}

export function DataTableRowActionsRowProvider({
  rowId,
  children,
}: {
  rowId: string
  children: ReactNode
}) {
  const registry = useDataTableRowActionsRegistryOptional()
  const scopeId = useDataTableScopeId()
  const { runAction, confirmDialog } = useRowActionConfirm(false)

  const runRowAction = useCallback(
    (action: DataTableRowActionItem) => {
      const entry = registry?.getScoped(scopeId, rowId)
      const autoConfirm = entry?.autoConfirmDangerousActions ?? false
      runAction(action, autoConfirm)
    },
    [registry, rowId, runAction, scopeId]
  )

  return (
    <DataTableRowActionsRowIdContext.Provider value={rowId}>
      <DataTableRowActionConfirmRunnerProvider
        runAction={runRowAction}
        confirmDialog={confirmDialog}
      >
        {children}
      </DataTableRowActionConfirmRunnerProvider>
    </DataTableRowActionsRowIdContext.Provider>
  )
}

export function useDataTableRowActionsRegistry() {
  const ctx = useContext(DataTableRowActionsRegistryContext)
  if (!ctx) {
    throw new Error(
      "useDataTableRowActionsRegistry phải nằm trong DataTableRowActionsRegistryProvider"
    )
  }
  return ctx
}

export function useDataTableRowActionsRegistryOptional() {
  return useContext(DataTableRowActionsRegistryContext)
}

export function useDataTableRowActionsRowId() {
  return useContext(DataTableRowActionsRowIdContext)
}

export function useRegisterDataTableRowActions(
  entry: RegisteredDataTableRowActions | null
) {
  const rowId = useDataTableRowActionsRowId()
  const scopeId = useDataTableScopeId()
  const registry = useDataTableRowActionsRegistryOptional()

  if (registry && rowId) {
    registry.registerScoped(scopeId, rowId, entry)
  }

  useLayoutEffect(() => {
    if (!registry || !rowId) return
    return () => registry.registerScoped(scopeId, rowId, null)
  }, [registry, rowId, scopeId])
}

/** Chỉ đăng ký thao tác dòng (không render nút ⋯) — dùng khi cell tự quyết định UI. */
export function DataTableRowActionsRegistrar(
  entry: RegisteredDataTableRowActions | null
) {
  useRegisterDataTableRowActions(entry)
  return null
}
