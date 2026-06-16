import { AdminProfilePage } from "@workspace/admin-app/modules/profile/_component/admin-profile-page"

const PARENT_ADMIN_PROFILE_CONFIG = {
  subtitle: "Cap nhat thong tin tai khoan quan tri HUB Parent.",
} as const

export default function ParentAdminProfilePage() {
  return <AdminProfilePage config={PARENT_ADMIN_PROFILE_CONFIG} />
}

