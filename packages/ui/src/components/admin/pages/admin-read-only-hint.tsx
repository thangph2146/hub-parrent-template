import type { ReactNode } from "react"

export function AdminReadOnlyHint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-200/90">
      {children}
    </p>
  )
}
