import type { UseMutationResult } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "@ui/components/sonner";

type RowWithId = { id: string };

function mutationErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export type AdminCrudRowHandlers<T extends RowWithId> = {
  getRecordLabel: (row: T) => string;
  onSoftDelete?: (row: T) => void | Promise<void>;
  onRestore?: (row: T) => void | Promise<void>;
  onPurge?: (row: T) => void | Promise<void>;
};

export function useAdminCrudRowHandlers<T extends RowWithId>(
  options: {
  getRecordLabel: (row: T) => string;
  entityLabel?: string;
  deleteMutation?: UseMutationResult<unknown, Error, string>;
  restoreMutation?: UseMutationResult<unknown, Error, string>;
  purgeMutation?: UseMutationResult<unknown, Error, string>;
  },
): AdminCrudRowHandlers<T> {
  const entity = options.entityLabel ?? "bản ghi";
  const { getRecordLabel, deleteMutation, restoreMutation, purgeMutation } =
    options;

  const onSoftDelete = useCallback(
    async (row: T) => {
      if (!deleteMutation) return;
      const name = getRecordLabel(row);
      try {
        await deleteMutation.mutateAsync(row.id);
        toast.success(`Đã đưa «${name}» vào thùng rác`);
      } catch (err: unknown) {
        toast.error(mutationErrorMessage(err, `Không thể xóa tạm ${entity}`));
        throw err;
      }
    },
    [deleteMutation, entity, getRecordLabel],
  );

  const onRestore = useCallback(
    async (row: T) => {
      if (!restoreMutation) return;
      const name = getRecordLabel(row);
      try {
        await restoreMutation.mutateAsync(row.id);
        toast.success(`Đã khôi phục «${name}»`);
      } catch (err: unknown) {
        toast.error(mutationErrorMessage(err, `Không thể khôi phục ${entity}`));
        throw err;
      }
    },
    [restoreMutation, entity, getRecordLabel],
  );

  const onPurge = useCallback(
    async (row: T) => {
      if (!purgeMutation) return;
      const name = getRecordLabel(row);
      try {
        await purgeMutation.mutateAsync(row.id);
        toast.success(`Đã xóa vĩnh viễn «${name}»`);
      } catch (err: unknown) {
        toast.error(
          mutationErrorMessage(err, `Không thể xóa vĩnh viễn ${entity}`),
        );
        throw err;
      }
    },
    [purgeMutation, entity, getRecordLabel],
  );

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
    ],
  );
}
