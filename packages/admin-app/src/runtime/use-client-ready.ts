"use client"

import { useSyncExternalStore } from "react"

const noopSubscribe = () => () => {}

/** Tránh flash hydration: server `false`, client `true`. */
export function useClientReady(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
