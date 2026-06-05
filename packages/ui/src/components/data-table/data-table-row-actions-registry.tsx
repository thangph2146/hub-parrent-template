"use client"

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import type { DataTableRowActionGroupId } from "./table-row-actions"
import type { DataTableRowActionItem } from "./table-row-actions"
import type { RowActionsMenuGroupConfig } from "./row-actions-menu-shared"

export type RegisteredDataTableRowActions = {
  actions: DataTableRowActionItem[]
  groups?: Partial<Record<DataTableRowActionGroupId, RowActionsMenuGroupConfig>>
  busy?: boolean
  autoConfirmDangerousActions?: boolean
}

type DataTableRowActionsRegistryValue = {
  register: (rowId: string, entry: RegisteredDataTableRowActions | null) => void
  get: (rowId: string) => RegisteredDataTableRowActions | null
}

const DataTableRowActionsRegistryContext =
  createContext<DataTableRowActionsRegistryValue | null>(null)

const DataTableRowActionsRowIdContext = createContext<string | null>(null)

export function DataTableRowActionsRegistryProvider({
  children,
}: {
  children: ReactNode
}) {
  const registryRef = useRef(new Map<string, RegisteredDataTableRowActions>())

  const value = useMemo<DataTableRowActionsRegistryValue>(
    () => ({
      register: (rowId, entry) => {
        if (entry == null) {
          registryRef.current.delete(rowId)
          return
        }
        registryRef.current.set(rowId, entry)
      },
      get: (rowId) => registryRef.current.get(rowId) ?? null,
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
  return (
    <DataTableRowActionsRowIdContext.Provider value={rowId}>
      {children}
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
  const registry = useDataTableRowActionsRegistryOptional()

  if (registry && rowId) {
    registry.register(rowId, entry)
  }

  useLayoutEffect(() => {
    if (!registry || !rowId) return
    return () => registry.register(rowId, null)
  }, [registry, rowId])
}
