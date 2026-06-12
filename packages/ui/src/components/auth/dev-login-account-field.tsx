"use client"

import { useMemo } from "react"
import type { DevLoginOption } from "@workspace/api-client"

import { cn } from "../../lib/utils"
import { Field, FieldDescription, FieldLabel } from "../field"
import { Label } from "../label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select"
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
import {
  formatDevLoginOptionPrimary,
  formatDevLoginOptionSecondary,
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

  const selectItems = useMemo(() => {
    const items: Array<{ value: string; label: string }> = []
    if (allowManual) {
      items.push({ value: manualValue, label: manualLabel })
    }
    for (const option of options) {
      items.push({
        value: String(option.id),
        label: formatDevLoginOptionPrimary(option),
      })
    }
    return items
  }, [allowManual, manualLabel, manualValue, options])

  if (!enabled) return null

  const handleValueChange = (nextValue: string | null) => {
    const resolved = nextValue ?? (allowManual ? manualValue : "")
    onValueChange(resolved, resolveDevLoginOption(options, resolved))
  }

  const selectControl = (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
      disabled={disabled || loading}
      items={selectItems}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "h-11 w-full rounded-lg",
          variant === "highlight" && "h-10 bg-background text-sm",
          triggerClassName,
        )}
      >
        <SelectValue
          placeholder={
            loading
              ? DEV_LOGIN_LOADING_PLACEHOLDER
              : options.length === 0
                ? DEV_LOGIN_EMPTY_PLACEHOLDER
                : DEV_LOGIN_SELECT_PLACEHOLDER
          }
        />
      </SelectTrigger>
      <SelectContent>
        {allowManual ? (
          <SelectItem value={manualValue}>{manualLabel}</SelectItem>
        ) : null}
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {variant === "field" ? (
              <>
                {formatDevLoginOptionPrimary(option)}
                <span className="text-xs text-muted-foreground">
                  {" "}
                  {formatDevLoginOptionSecondary(option)}
                </span>
              </>
            ) : (
              <span className="block">
                <span className="block">{formatDevLoginOptionPrimary(option)}</span>
                <span className="block font-mono text-[11px] text-muted-foreground">
                  {formatDevLoginOptionSecondary(option)}
                </span>
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
      <FieldLabel className="font-medium text-primary">
        {DEV_LOGIN_FIELD_LABEL}
      </FieldLabel>
      {selectControl}
    </Field>
  )
}
