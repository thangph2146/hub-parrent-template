"use client"

import { FieldError } from "@ui/components/field"
import { FormFieldCol } from "@ui/components/typing"
import { Input } from "@ui/components/input"
import { Controller } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"

import type { StaffFormValues } from "../_hooks/staff-form.schema"

const MSSV_HINT =
  "Ảnh đại diện lưu theo MSSV; nếu trống dùng ID tài khoản. Lưu MSSV trước khi tải ảnh."

type StaffStudentCodeFieldProps = {
  form: UseFormReturn<StaffFormValues>
}

export function StaffStudentCodeField({ form }: StaffStudentCodeFieldProps) {
  return (
    <Controller
      name="studentCode"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormFieldCol label="Mã số sinh viên">
          <Input
            id="staff-student-code"
            inputMode="numeric"
            placeholder="VD: 21548001"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            className={fieldState.error ? "border-destructive" : ""}
          />
          {fieldState.error ? (
            <FieldError>{fieldState.error.message}</FieldError>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">{MSSV_HINT}</p>
          )}
        </FormFieldCol>
      )}
    />
  )
}
