"use client"

import {
  buildMutationToastKey,
  registerLocalMutationFromMeta,
} from "@workspace/api-client/realtime"
import type { MutationKey } from "@tanstack/react-query"

export type AdminToastSuppressMeta = {
  resource?: string
  action?: string
}

function inferResourceFromMutationKey(key: MutationKey | undefined): string | undefined {
  if (!key || !Array.isArray(key) || key.length === 0) return undefined
  const head = String(key[0] ?? "").trim()
  return head || undefined
}

function inferActionFromMutationKey(key: MutationKey | undefined): string | undefined {
  if (!key || !Array.isArray(key) || key.length < 2) return undefined
  const action = String(key[1] ?? "").trim()
  return action || undefined
}

export function adminToastSuppressMeta(
  meta: AdminToastSuppressMeta,
): { adminToastSuppress: AdminToastSuppressMeta } {
  return { adminToastSuppress: meta }
}

/** Sau toast mutation thành công — chặn socket notification:admin trùng trên tab hiện tại. */
export function suppressRealtimeToastAfterMutation(
  mutationKey: MutationKey | undefined,
  suppressMeta: AdminToastSuppressMeta | undefined,
  data: unknown,
  variables: unknown,
): void {
  const resource =
    suppressMeta?.resource?.trim() ||
    inferResourceFromMutationKey(mutationKey)
  if (!resource) return

  registerLocalMutationFromMeta(resource, {
    action: suppressMeta?.action ?? inferActionFromMutationKey(mutationKey),
    data,
    variables,
  })
}

export function suppressRealtimeToastForEntity(
  resource: string,
  id?: string,
  action?: string,
): void {
  registerLocalMutationFromMeta(resource, { id, action })
}

export { buildMutationToastKey }
