"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildEntityDraftKey,
  clearEntityDraft,
  loadEntityDraft,
  saveEntityDraft,
} from "@workspace/query-client";

export type CheckoutDraftFields = {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  notes: string;
};

export function useCheckoutDraft(sessionId: string, displayName: string) {
  const draftKey = buildEntityDraftKey("store-sync", `checkout:${sessionId}`);

  const [fields, setFields] = useState<CheckoutDraftFields>(() => {
    const draft = loadEntityDraft<CheckoutDraftFields>(draftKey);
    return (
      draft ?? {
        customerName: displayName,
        customerPhone: "",
        shippingAddress: "",
        notes: "",
      }
    );
  });

  useEffect(() => {
    saveEntityDraft(draftKey, fields);
  }, [fields, draftKey]);

  const clearDraft = useCallback(() => {
    clearEntityDraft(draftKey);
  }, [draftKey]);

  const patchField = useCallback(
    <K extends keyof CheckoutDraftFields>(
      key: K,
      value: CheckoutDraftFields[K],
    ) => {
      setFields((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return { fields, patchField, clearDraft }
}
