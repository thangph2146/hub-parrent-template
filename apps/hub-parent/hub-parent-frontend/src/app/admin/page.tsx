import { redirect } from "next/navigation"
import { PARENT_ADMIN_HOME_PATH } from "@/config/admin/parent-admin-access"

export default function ParentAdminIndexPage() {
  redirect(PARENT_ADMIN_HOME_PATH)
}

