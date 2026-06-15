"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { AdminAppConfig } from "@workspace/admin-app/config";
import { isPathUnderAdminBase } from "@workspace/admin-app/config/admin-access-paths";
import adminAppConfig from "../../../admin.app.config.json";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

const ADMIN_BASE_PATH = (adminAppConfig as AdminAppConfig).basePath;

/** Header/footer storefront — ẩn khi vào cổng `/store` hoặc admin (`basePath`). */
export function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideStorefrontChrome =
    pathname?.startsWith("/store") ||
    isPathUnderAdminBase(pathname, ADMIN_BASE_PATH);

  if (hideStorefrontChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
