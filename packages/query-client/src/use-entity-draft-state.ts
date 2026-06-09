"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildEntityDraftKey,
  clearEntityDraft,
  loadEntityDraft,
  saveEntityDraft,
} from "./entity-draft";
import { useHydrateOncePerEntity } from "./use-hydrate-once-per-entity";

/**
 * State cục bộ + session draft — giữ chỉnh sửa khi chuyển route rồi quay lại.
 */
export function useEntityDraftState<TData, TState extends object>(
  scope: string,
  entityId: string,
  serverData: TData | undefined,
  toState: (data: TData) => TState,
) {
  const draftKey = buildEntityDraftKey(scope, entityId);
  const [state, setState] = useState<TState | undefined>(undefined);
  const toStateRef = useRef(toState);
  toStateRef.current = toState;

  const hydrate = useCallback(
    (source: TData) => {
      const draft = loadEntityDraft<TState>(draftKey);
      setState(draft ?? toStateRef.current(source));
    },
    [draftKey],
  );

  useHydrateOncePerEntity(entityId, serverData, hydrate);

  useEffect(() => {
    if (state === undefined) return;
    saveEntityDraft(draftKey, state);
  }, [state, draftKey]);

  const clearDraft = useCallback(() => {
    clearEntityDraft(draftKey);
  }, [draftKey]);

  const resetFromServer = useCallback(() => {
    if (serverData === undefined) return;
    clearEntityDraft(draftKey);
    setState(toStateRef.current(serverData));
  }, [draftKey, serverData]);

  return { state, setState, clearDraft, resetFromServer } as const;
}
