"use client"

import { useState } from "react"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { Plus, AlertCircle } from "lucide-react"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"


export function AddStudentDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const api = useAdminApi()
  const [studentCode, setStudentCode] = useState("")
  const [studentName, setStudentName] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  const mutation = useAdminMutation({
    mutationKey: ["my-students", "create"],
    toast: {
      loading: "Đang gửi yêu cầu liên kết…",
      success: "Đã gửi yêu cầu liên kết sinh viên",
      error: (err) =>
        err instanceof Error ? err.message : "Không gửi được yêu cầu",
    },
    mutationFn: async () => {
      await api.myStudents.add({ studentCode, studentName, note })
    },
    onSuccess: () => {
      setStudentCode("")
      setStudentName("")
      setNote("")
      setError("")
      onSuccess()
      onClose()
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Lỗi hệ thống")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            Thêm liên kết học sinh
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="studentCode">
              Mã sinh viên <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="studentCode"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="VD: SV2024001"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="studentName">Họ tên con</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Nhập họ tên để dễ nhận diện"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Ghi chú</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thông tin thêm cho quản trị viên"
            />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-rose-600">
              <AlertCircle className="size-4" />
              {error}
            </p>
          )}
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            Yêu cầu sẽ chờ xác nhận từ quản trị viên trước khi hiển thị bảng
            điểm.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!studentCode.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Đang gửi…" : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
