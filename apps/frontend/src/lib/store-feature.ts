/**
 * Site phụ huynh (@frontend) mặc định không bật storefront B2B.
 * Bật lại: NEXT_PUBLIC_STORE_ENABLED=true (dùng khi test catalog trên cùng app).
 */
export const STORE_ENABLED =
  process.env.NEXT_PUBLIC_STORE_ENABLED === "true";

const STORE_ROUTE_PREFIXES = [
  "/catalog",
  "/cart",
  "/checkout",
  "/orders",
  "/dashboard",
  "/login",
  "/register",
  "/profile",
  "/help",
  "/support",
  "/terms",
  "/privacy",
] as const;

export function isStoreRoute(pathname: string): boolean {
  return STORE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
