"use client";

import { useEffect, useRef } from "react";

/**
 * Gọi `hydrate` đúng một lần cho mỗi `entityId` khi có `data`.
 * Tránh reset form/state khi React Query refetch cùng entity (tab focus, invalidate, …).
 */
export function useHydrateOncePerEntity<TData>(
  entityId: string,
  data: TData | undefined,
  hydrate: (data: TData) => void,
): void {
  const hydratedForIdRef = useRef<string | null>(null);
  const hydrateRef = useRef(hydrate);
  hydrateRef.current = hydrate;

  useEffect(() => {
    hydratedForIdRef.current = null;
  }, [entityId]);

  useEffect(() => {
    if (data === undefined) return;
    if (hydratedForIdRef.current === entityId) return;
    hydrateRef.current(data);
    hydratedForIdRef.current = entityId;
  }, [data, entityId]);
}
