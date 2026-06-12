import type { AuthUser } from "@workspace/api-client";
import type { MockSession } from "@/hooks/use-session";

function mockUserId(sessionId: string): number {
  const parsed = Number(sessionId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/** Map phiên storefront localStorage → shape `AuthUser` cho AdminShell. */
export function mockSessionToAdminUser(session: MockSession): AuthUser {
  const isAdmin = session.role === "admin";
  return {
    id: mockUserId(session.id),
    email: session.username,
    name: session.displayName,
    image: null,
    phone: null,
    address: null,
    roles: isAdmin
      ? [{ id: 1, name: "admin", displayName: "Quản trị cửa hàng" }]
      : [{ id: 2, name: "store", displayName: "Đại lý" }],
    permissions: [],
  };
}
