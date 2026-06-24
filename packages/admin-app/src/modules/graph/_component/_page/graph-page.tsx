"use client"

import { GraphifyPage } from "@ui/components/graphify/graphify-page"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { MAIN_ADMIN_GRAPH_CONFIG } from "../_config/graph-page.main-config"
import type { AdminGraphPageConfig } from "../_config/graph-page.types"

export type { AdminGraphPageConfig } from "../_config/graph-page.types"

function AdminGraphPageInner({ config }: { config: AdminGraphPageConfig }) {
  return (
    <AdminPageSection>
      <GraphifyPage
        apiPath={config.graphifyApiPath}
        classes={{
          sidebar:
            "w-72 xl:w-80 shrink-0 border-r border-border/50 bg-card flex flex-col",
          scrollArea: "max-h-[calc(100vh-188px)]",
        }}
      />
    </AdminPageSection>
  )
}

export function AdminGraphPage({
  config = MAIN_ADMIN_GRAPH_CONFIG,
}: {
  config?: AdminGraphPageConfig
}) {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <AdminGraphPageInner config={config} />
    </AdminPageGuard>
  )
}

export default function AdminGraphPageDefault() {
  return <AdminGraphPage />
}
