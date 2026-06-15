import { redirect } from "next/navigation"
import { STORE_ADMIN_HOME_PATH } from "@/config/admin/store-admin-access"

/** Index admin (`basePath`) → dashboard tổng quan. */
export default function StoreAdminIndexPage() {
  redirect(STORE_ADMIN_HOME_PATH)
}
