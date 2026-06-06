"use client";

import { GraphifyPage } from "@ui/components/graphify/graphify-page";
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin";

function GraphPageInner() {
  return (
    <AdminPageSection>
      <GraphifyPage apiPath="/admin/api/graphify" classes={{
        sidebar: "w-72 xl:w-80 shrink-0 border-r border-border/50 bg-card flex flex-col",
        scrollArea: "max-h-[calc(100vh-188px)]",
      }} />
    </AdminPageSection>
  );
}

export default function GraphPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <GraphPageInner />
    </AdminPageGuard>
  );
}
