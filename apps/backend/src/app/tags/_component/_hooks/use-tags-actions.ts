import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";
import type { TagConfirmAction } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { tagFormSchema, type TagFormValues } from "../types";

const EMPTY_VALUES: TagFormValues = { name: "", slug: "", icon: null };

export function buildTagPayload(values: TagFormValues): Record<string, unknown> {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || values.name.trim().toLowerCase().replace(/\s+/g, "-"),
    icon: values.icon || null,
  };
}

export function useTagForm() {
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: EMPTY_VALUES,
  });
  const resetForm = useCallback(() => { form.reset(EMPTY_VALUES); }, [form]);
  return { form, resetForm };
}

export function useHandleConfirmAction(
  deleteMutation: UseMutationResult<unknown, Error, string>,
  restoreMutation: UseMutationResult<unknown, Error, string>,
  purgeMutation: UseMutationResult<unknown, Error, string>,
  setConfirmAction: React.Dispatch<React.SetStateAction<TagConfirmAction | null>>,
) {
  return useCallback(
    async ({ kind, row }: TagConfirmAction) => {
      try {
        if (kind === "delete") {
          await deleteMutation.mutateAsync(row.id);
} else if (kind === "restore") {
          await restoreMutation.mutateAsync(row.id);
} else if (kind === "purge") {
          await purgeMutation.mutateAsync(row.id);
}
      } catch { /* toast: MutationCache */ } finally {
        setConfirmAction(null);
      }
    },
    [deleteMutation, restoreMutation, purgeMutation, setConfirmAction],
  );
}

export function useConfirmAction() {
  const [confirmAction, setConfirmAction] = useState<TagConfirmAction | null>(null);
  return { confirmAction, setConfirmAction };
}
