"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/** Header/footer storefront — ẩn khi vào cổng quản lý `/store`. */
export function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStorePortal = pathname?.startsWith("/store");

  if (isStorePortal) {
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
