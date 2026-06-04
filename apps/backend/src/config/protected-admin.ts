const RAW = process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAILS ?? "";
const LIST: string[] = RAW.split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isProtectedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return LIST.includes(email.trim().toLowerCase());
}
