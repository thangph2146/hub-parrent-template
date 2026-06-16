import { redirect } from "next/navigation"
import { PARENT_ADMIN_LOGIN_PATH } from "@/config/admin/parent-admin-access"

export default function ParentAdminLoginEntryPage() {
  redirect(PARENT_ADMIN_LOGIN_PATH)
}

