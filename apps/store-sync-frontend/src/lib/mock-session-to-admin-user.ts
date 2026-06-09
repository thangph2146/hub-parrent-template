import type { AuthUser } from "@workspace/api-client";
import type { MockSession } from "@/hooks/use-session";

/** Map phiên storefront localStorage → shape `AuthUser` cho AdminShell. */
export function mockSessionToAdminUser(session: MockSession): AuthUser {
  const isAdmin = session.role === "admin";
  return {
    id: session.id,
    email: session.username,
    name: session.displayName,
    image: null,
    phone: null,
    address: null,
    roles: isAdmin
      ? [{ id: "store-admin", name: "admin", displayName: "Quản trị cửa hàng" }]
      : [{ id: "store-dealer", name: "store", displayName: "Đại lý" }],
    permissions: [],
  };
}
