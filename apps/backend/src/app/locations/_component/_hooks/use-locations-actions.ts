import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";
import type { LocationConfirmAction, LocationFormValues } from "../types";
import { locationFormSchema } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";

const EMPTY_VALUES: LocationFormValues = {
  mapUrl: "",
  name: "",
  address: "",
  status: 1,
};

export function buildLocationPayload(values: LocationFormValues): Record<string, unknown> {
  return {
    mapUrl: values.mapUrl.trim(),
    name: values.name?.trim() || null,
    address: values.address?.trim() || null,
    status: values.status,
  };
}

export function useLocationForm() {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: EMPTY_VALUES,
  });
  const resetForm = useCallback(() => { form.reset(EMPTY_VALUES); }, [form]);
  return { form, resetForm };
}

export function useHandleConfirmAction(
  deleteMutation: UseMutationResult<unknown, Error, string>,
  restoreMutation: UseMutationResult<unknown, Error, string>,
  purgeMutation: UseMutationResult<unknown, Error, string>,
  setConfirmAction: React.Dispatch<React.SetStateAction<LocationConfirmAction | null>>,
) {
  return useCallback(
    async ({ kind, row }: LocationConfirmAction) => {
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
  const [confirmAction, setConfirmAction] = useState<LocationConfirmAction | null>(null);
  return { confirmAction, setConfirmAction };
}
