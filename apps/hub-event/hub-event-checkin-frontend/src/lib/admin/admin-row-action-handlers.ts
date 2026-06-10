import type { UseMutationResult } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

type RowWithId = { id: string | number }

export type AdminCrudRowHandlers<T extends RowWithId> = {
  getRecordLabel: (row: T) => string
  onSoftDelete?: (row: T) => void | Promise<void>
  onRestore?: (row: T) => void | Promise<void>
  onPurge?: (row: T) => void | Promise<void>
}

export function useAdminCrudRowHandlers<T extends RowWithId>(options: {
  getRecordLabel: (row: T) => string
  entityLabel?: string
  deleteMutation?: UseMutationResult<unknown, Error, string>
  restoreMutation?: UseMutationResult<unknown, Error, string>
  purgeMutation?: UseMutationResult<unknown, Error, string>
}): AdminCrudRowHandlers<T> {
  const { getRecordLabel, deleteMutation, restoreMutation, purgeMutation } =
    options

  const onSoftDelete = useCallback(
    async (row: T) => {
      if (!deleteMutation) return
      await deleteMutation.mutateAsync(String(row.id))
    },
    [deleteMutation]
  )

  const onRestore = useCallback(
    async (row: T) => {
      if (!restoreMutation) return
      await restoreMutation.mutateAsync(String(row.id))
    },
    [restoreMutation]
  )

  const onPurge = useCallback(
    async (row: T) => {
      if (!purgeMutation) return
      await purgeMutation.mutateAsync(String(row.id))
    },
    [purgeMutation]
  )

  return useMemo(
    () => ({
      getRecordLabel,
      onSoftDelete: deleteMutation ? onSoftDelete : undefined,
      onRestore: restoreMutation ? onRestore : undefined,
      onPurge: purgeMutation ? onPurge : undefined,
    }),
    [
      deleteMutation,
      getRecordLabel,
      onPurge,
      onRestore,
      onSoftDelete,
      purgeMutation,
      restoreMutation,
    ]
  )
}
