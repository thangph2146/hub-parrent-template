import { redirect } from "next/navigation"
import { PARENT_ADMIN_REGISTER_PATH } from "@/config/admin/parent-admin-access"

export default function ParentAdminRegisterEntryPage() {
  redirect(PARENT_ADMIN_REGISTER_PATH)
}

