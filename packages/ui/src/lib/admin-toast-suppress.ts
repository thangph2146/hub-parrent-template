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

/** Mutation key (UI module) → resource metadata socket/API. */
const SUPPRESS_RESOURCE_ALIASES: Record<string, string> = {
  rbac: "roles",
}

function resolveSuppressResource(resource: string | undefined): string | undefined {
  if (!resource) return undefined
  const normalized = resource.toLowerCase().trim()
  return SUPPRESS_RESOURCE_ALIASES[normalized] ?? normalized
}

function inferResourceFromMutationKey(
  key: MutationKey | undefined
): string | undefined {
  if (!key || !Array.isArray(key) || key.length === 0) return undefined
  const head = String(key[0] ?? "").trim()
  return head || undefined
}

function inferActionFromMutationKey(
  key: MutationKey | undefined
): string | undefined {
  if (!key || !Array.isArray(key) || key.length < 2) return undefined
  const action = String(key[1] ?? "").trim()
  return action || undefined
}

function inferActionFromVariables(variables: unknown): string | undefined {
  if (variables == null || typeof variables !== "object") return undefined
  const action = (variables as { action?: unknown }).action
  if (typeof action !== "string") return undefined
  const trimmed = action.trim()
  return trimmed || undefined
}

export function adminToastSuppressMeta(meta: AdminToastSuppressMeta): {
  adminToastSuppress: AdminToastSuppressMeta
} {
  return { adminToastSuppress: meta }
}

/** Sau toast mutation thành công — chặn socket notification:admin trùng trên tab hiện tại. */
export function suppressRealtimeToastAfterMutation(
  mutationKey: MutationKey | undefined,
  suppressMeta: AdminToastSuppressMeta | undefined,
  data: unknown,
  variables: unknown
): void {
  const rawResource =
    suppressMeta?.resource?.trim() || inferResourceFromMutationKey(mutationKey)
  const resource = resolveSuppressResource(rawResource)
  if (!resource) return

  const action =
    suppressMeta?.action?.trim() ||
    inferActionFromVariables(variables) ||
    inferActionFromMutationKey(mutationKey)

  registerLocalMutationFromMeta(resource, {
    action,
    data,
    variables,
  })
}

export function suppressRealtimeToastForEntity(
  resource: string,
  id?: string,
  action?: string
): void {
  registerLocalMutationFromMeta(resource, { id, action })
}

export { buildMutationToastKey }
