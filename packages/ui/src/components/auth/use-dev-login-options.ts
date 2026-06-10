"use client"

import { useEffect, useState } from "react"
import type { DevLoginOption } from "@workspace/api-client"

import { isDevLoginEnabled } from "./dev-login-constants"

export function useDevLoginOptions(
  loadOptions: () => Promise<DevLoginOption[]>,
  deps: readonly unknown[] = [],
) {
  const enabled = isDevLoginEnabled()
  const [options, setOptions] = useState<DevLoginOption[]>([])
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    setLoading(true)

    void loadOptions()
      .then((nextOptions) => {
        if (!cancelled) setOptions(nextOptions)
      })
      .catch(() => {
        if (!cancelled) setOptions([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls refetch via deps
  }, [enabled, ...deps])

  return { options, loading, enabled }
}
