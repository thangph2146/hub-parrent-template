"use client"

import { useRef, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "@ui/components/sonner"
import {
  showAdminOperationErrorToast,
  showAdminOperationSuccessToast,
} from "@ui/lib/admin-operation-toast"
import { getStudentCodeAvatarUploadBlockReason } from "@workspace/admin-app/lib/student-code-form"
import { useAdminApi } from "@workspace/admin-app/runtime"

import type { StaffFormValues } from "./staff-form.schema"

type UseStaffAvatarUploadOptions = {
  form: UseFormReturn<StaffFormValues>
  subjectUserId?: string
}

export function useStaffAvatarUpload(options: UseStaffAvatarUploadOptions) {
  const api = useAdminApi()
  const { form, subjectUserId } = options
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const avatarValue = form.watch("avatar")

  const handleUploadAvatar = async (file: File) => {
    if (!subjectUserId) {
      toast.error("Tạo tài khoản trước khi tải ảnh đại diện.")
      return
    }

    const blockReason = getStudentCodeAvatarUploadBlockReason({
      studentCode: form.getValues("studentCode") ?? "",
      studentCodeDirty: Boolean(form.formState.dirtyFields.studentCode),
    })
    if (blockReason) {
      toast.error(blockReason)
      return
    }

    setUploadingAvatar(true)
    try {
      const url = (await api.users.uploadAvatar(subjectUserId, file)).url
      form.setValue("avatar", url, { shouldDirty: true })
      showAdminOperationSuccessToast("Đã tải ảnh đại diện", {
        operationLabel: "users / uploadAvatar",
        variables: { userId: subjectUserId, fileName: file.name },
        data: { url },
      })
    } catch (error) {
      showAdminOperationErrorToast(
        error instanceof Error ? error.message : "Lỗi upload ảnh",
        {
          operationLabel: "users / uploadAvatar",
          variables: { userId: subjectUserId, fileName: file.name },
          error,
        }
      )
    } finally {
      setUploadingAvatar(false)
    }
  }

  return {
    uploadingAvatar,
    avatarInputRef,
    avatarValue,
    handleUploadAvatar,
  }
}
