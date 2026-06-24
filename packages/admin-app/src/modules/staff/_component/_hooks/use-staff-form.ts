"use client"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import type { StaffRow } from "../shared/types"
import {
  buildStaffSubmitPayload,
  type StaffSubmitPayload,
} from "../_form/staff-form.types"
import {
  STAFF_FORM_DEFAULT_VALUES,
  staffFormSchema,
  type StaffFormValues,
} from "./staff-form.schema"

export {
  staffFormSchema,
  STAFF_FORM_DEFAULT_VALUES,
  type StaffFormValues,
} from "./staff-form.schema"

interface UseStaffFormOptions {
  editingId?: string | null
}

export function mapStaffUserToFormValues(user: StaffRow): StaffFormValues {
  return {
    email: user.email,
    fullName: user.fullName,
    password: "",
    isActive: user.isActive,
    roleCodes: user.roles.map((role) => role.code),
    avatar: user.avatar ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
    citizenId: user.citizenId ?? "",
    studentCode: user.studentCode ?? "",
  }
}

export function useStaffForm(options: UseStaffFormOptions = {}) {
  const { editingId } = options

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: STAFF_FORM_DEFAULT_VALUES,
    mode: "onChange",
  })

  const resetForm = useCallback(() => {
    form.reset(STAFF_FORM_DEFAULT_VALUES)
  }, [form])

  const populateForm = useCallback(
    (user: StaffRow) => {
      form.reset(mapStaffUserToFormValues(user))
    },
    [form],
  )

  const toggleRole = useCallback(
    (code: string, checked: boolean) => {
      const currentRoles = form.getValues("roleCodes")
      if (checked) {
        form.setValue("roleCodes", [...new Set([...currentRoles, code])], {
          shouldDirty: true,
        })
      } else {
        form.setValue(
          "roleCodes",
          currentRoles.filter((roleCode) => roleCode !== code),
          { shouldDirty: true },
        )
      }
    },
    [form],
  )

  const getPayload = useCallback((): StaffSubmitPayload => {
    return buildStaffSubmitPayload(form.getValues(), editingId)
  }, [form, editingId])

  return {
    form,
    resetForm,
    populateForm,
    toggleRole,
    getPayload,
  }
}
