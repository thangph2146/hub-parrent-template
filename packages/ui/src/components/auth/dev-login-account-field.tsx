"use client"

import { useMemo } from "react"
import type { DevLoginOption } from "@workspace/api-client"

import { cn } from "../../lib/utils"
import { Field, FieldLabel } from "../field"
import { Label } from "../label"
import {
  SelectPicker,
  type SelectPickerOption,
} from "../pickers"
import {
  DEV_LOGIN_EMPTY_PLACEHOLDER,
  DEV_LOGIN_FIELD_DESCRIPTION,
  DEV_LOGIN_FIELD_LABEL,
  DEV_LOGIN_LOADING_PLACEHOLDER,
  DEV_LOGIN_MANUAL_OPTION_LABEL,
  DEV_LOGIN_MANUAL_VALUE,
  DEV_LOGIN_SELECT_PLACEHOLDER,
  isDevLoginEnabled,
} from "./dev-login-constants"
import { DevLoginOptionRow } from "./dev-login-option-row"
import {
  formatDevLoginOptionTriggerLabel,
  resolveDevLoginOption,
} from "./dev-login-utils"

export type DevLoginAccountFieldProps = {
  value: string
  onValueChange: (value: string, option: DevLoginOption | null) => void
  options: DevLoginOption[]
  loading?: boolean
  disabled?: boolean
  /** `field` — form admin/check-in; `highlight` — card store login */
  variant?: "field" | "highlight"
  allowManual?: boolean
  manualValue?: string
  manualLabel?: string
  id?: string
  className?: string
  triggerClassName?: string
  showSelectedDescription?: boolean
}

export function DevLoginAccountField({
  value,
  onValueChange,
  options,
  loading = false,
  disabled = false,
  variant = "field",
  allowManual = false,
  manualValue = DEV_LOGIN_MANUAL_VALUE,
  manualLabel = DEV_LOGIN_MANUAL_OPTION_LABEL,
  id = "dev-login-account",
  className,
  triggerClassName,
  showSelectedDescription = false,
}: DevLoginAccountFieldProps) {
  const enabled = isDevLoginEnabled()
  const selectedOption = resolveDevLoginOption(options, value)
  const selectValue = value || (allowManual ? manualValue : "")

  const pickerOptions = useMemo((): SelectPickerOption[] => {
    const items: SelectPickerOption[] = []
    if (allowManual) {
      items.push({ value: manualValue, label: manualLabel })
    }
    for (const option of options) {
      items.push({
        value: String(option.id),
        label: formatDevLoginOptionTriggerLabel(option),
        render: () => <DevLoginOptionRow option={option} />,
      })
    }
    return items
  }, [allowManual, manualLabel, manualValue, options])

  const placeholder = loading
    ? DEV_LOGIN_LOADING_PLACEHOLDER
    : options.length === 0
      ? DEV_LOGIN_EMPTY_PLACEHOLDER
      : DEV_LOGIN_SELECT_PLACEHOLDER

  if (!enabled) return null

  const handleValueChange = (nextValue: unknown) => {
    const resolved =
      typeof nextValue === "string"
        ? nextValue
        : allowManual
          ? manualValue
          : ""
    onValueChange(resolved, resolveDevLoginOption(options, resolved))
  }

  const selectControl = (
    <SelectPicker
      id={id}
      value={selectValue || undefined}
      onChange={handleValueChange}
      options={pickerOptions}
      placeholder={placeholder}
      disabled={disabled || loading}
      allowClear={false}
      className={cn(
        "h-11 w-full rounded-lg",
        variant === "highlight" && "h-10 bg-background text-sm",
        triggerClassName,
      )}
    />
  )

  if (variant === "highlight") {
    return (
      <div
        className={cn(
          "space-y-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-3 dark:bg-amber-950/30",
          className,
        )}
      >
        <p className="text-xs font-bold text-amber-950 dark:text-amber-100/90">
          {DEV_LOGIN_FIELD_LABEL}
        </p>
        <p className="text-[11px] leading-snug text-amber-900/80 dark:text-amber-100/70">
          {DEV_LOGIN_FIELD_DESCRIPTION}
        </p>
        <div className="space-y-1.5">
          <Label htmlFor={id} className="text-xs font-medium">
            {DEV_LOGIN_FIELD_LABEL}
          </Label>
          {selectControl}
          {showSelectedDescription && selectedOption ? (
            <p className="text-[11px] leading-snug text-muted-foreground">
              {selectedOption.description}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <Field className={className}>
      <FieldLabel className="text-sm font-medium">
        {DEV_LOGIN_FIELD_LABEL}
      </FieldLabel>
      {selectControl}
    </Field>
  )
}
