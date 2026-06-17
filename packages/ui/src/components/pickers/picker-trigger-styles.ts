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

/** Popover danh sách — khớp chiều rộng trigger (Base UI `--anchor-width`). */
export function pickerListPopoverClassName(className?: string) {
  return cn(
    "w-(--anchor-width) min-w-(--anchor-width) max-w-(--available-width) max-h-(--available-height) overflow-x-hidden p-2",
    className
  )
}

/** Nhãn mục trong danh sách — cho phép xuống dòng khi nội dung dài. */
export const pickerListOptionLabelClassName =
  "min-w-0 flex-1 whitespace-normal break-words text-left"
