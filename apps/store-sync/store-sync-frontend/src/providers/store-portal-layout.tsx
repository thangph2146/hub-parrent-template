"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AdminLayoutBridge,
  buildAdminLayoutValue,
} from "@ui/components/admin";
import { cartStore } from "@/hooks/use-cart";
import { useClientReady } from "@/hooks/use-client-ready";
import { useSession } from "@/hooks/use-session";
import { resetCartHydration } from "@/lib/cart-sync";
import { mockSessionToAdminUser } from "@/lib/mock-session-to-admin-user";
import {
  STORE_SESSION_EVENT,
  STORE_SESSION_STORAGE_KEY,
} from "@/lib/store-auth";
import { STORE_PORTAL_LAYOUT_STATIC } from "@/config/store-portal-layout-static";

export function StorePortalLayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const clientReady = useClientReady();
  const session = useSession();

  const user = useMemo(
    () => (session ? mockSessionToAdminUser(session) : null),
    [session],
  );

  const logout = useCallback(() => {
    resetCartHydration();
    localStorage.removeItem(STORE_SESSION_STORAGE_KEY);
    cartStore.clear();
    window.dispatchEvent(new Event(STORE_SESSION_EVENT));
    router.push("/login?next=/store/orders");
  }, [router]);

  const value = useMemo(
    () =>
      buildAdminLayoutValue({
        user,
        clientReady,
        logout,
        branding: {
          siteName: "Hub B2B",
          siteDescription: "Quản lý cửa hàng đại lý",
          isReady: true,
        },
        static: STORE_PORTAL_LAYOUT_STATIC,
      }),
    [clientReady, logout, user],
  );

  return <AdminLayoutBridge value={value}>{children}</AdminLayoutBridge>;
}
