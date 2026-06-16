"use client"

import { Database, FolderOpen, ScanFace } from "lucide-react"
import { Tabs, TabsContent } from "@ui/components/tabs"
import { AdminListTabsList, AdminListTabsTrigger } from "@ui/components/admin"
import { HANET_PAGE_ENDPOINTS } from "@workspace/admin-app/lib/hanet-postman"
import { HanetAvatarsTab } from "../_component/hanet-avatars-tab"
import { HanetDiskAvatarsTab } from "../_component/hanet-disk-avatars-tab"
import { HanetModuleShell } from "../_component/hanet-module-shell"
import { HanetStoredAvatarsTab } from "../_component/hanet-stored-avatars-tab"

export default function HanetAvatarPage() {
  return (
    <HanetModuleShell
      icon={ScanFace}
      title="Avatar HANET"
      subtitle="getListByPlace · sync face_data · kho disk avatars · đủ Face API Partner (URL, image, takePicture, registerByUrl)."
      endpoints={HANET_PAGE_ENDPOINTS.avatar}
      contentClassName="max-w-full"
    >
      <Tabs defaultValue="hanet" className="space-y-3">
        <AdminListTabsList fullWidth className="max-w-2xl">
          <AdminListTabsTrigger value="hanet" stretch>
            <ScanFace className="size-3.5 shrink-0" />
            HANET (live)
          </AdminListTabsTrigger>
          <AdminListTabsTrigger value="stored" stretch>
            <Database className="size-3.5 shrink-0" />
            face_data (DB)
          </AdminListTabsTrigger>
          <AdminListTabsTrigger value="disk" stretch>
            <FolderOpen className="size-3.5 shrink-0" />
            Kho disk
          </AdminListTabsTrigger>
        </AdminListTabsList>
        <TabsContent value="hanet" className="mt-0">
          <HanetAvatarsTab />
        </TabsContent>
        <TabsContent value="stored" className="mt-0">
          <HanetStoredAvatarsTab />
        </TabsContent>
        <TabsContent value="disk" className="mt-0">
          <HanetDiskAvatarsTab />
        </TabsContent>
      </Tabs>
    </HanetModuleShell>
  )
}
