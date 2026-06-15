"use client"

import { ScanFace } from "lucide-react"
import { HanetAvatarsTab } from "../_component/hanet-avatars-tab"
import { HanetModuleShell } from "../_component/hanet-module-shell"

export default function HanetAvatarPage() {
  return (
    <HanetModuleShell
      icon={ScanFace}
      title="Avatar Hub"
      subtitle="Bản sao local từ getListByPlace — bảng face_data, đồng bộ cho check-in sự kiện."
      contentClassName="max-w-full"
    >
      <HanetAvatarsTab />
    </HanetModuleShell>
  )
}
