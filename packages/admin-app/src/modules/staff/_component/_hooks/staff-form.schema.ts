import { z } from "zod"
import { optionalStudentCodeZodField } from "@workspace/admin-app/lib/student-code-form"

export const staffFormSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  password: z
    .string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
  roleCodes: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một vai trò"),
  avatar: z.string().optional(),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  citizenId: z.string().optional().or(z.literal("")),
  studentCode: optionalStudentCodeZodField(),
})

export type StaffFormValues = z.infer<typeof staffFormSchema>

export const STAFF_FORM_DEFAULT_VALUES: StaffFormValues = {
  email: "",
  fullName: "",
  password: "",
  isActive: true,
  roleCodes: [],
  avatar: "",
  phone: "",
  address: "",
  citizenId: "",
  studentCode: "",
}
