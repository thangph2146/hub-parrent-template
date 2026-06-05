import { cn } from "../../lib/utils"

export type PickerSize = "default" | "sm"

export function pickerTriggerClassName(
  size: PickerSize = "default",
  className?: string
) {
  return cn(
    "w-full justify-between",
    size === "sm"
      ? "h-8 min-w-0 gap-1.5 rounded-md text-xs font-normal"
      : "h-9 min-w-[160px] gap-2 rounded-lg text-sm font-normal",
    className
  )
}
