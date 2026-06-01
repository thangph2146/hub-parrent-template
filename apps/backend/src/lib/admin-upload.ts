import { DEFAULT_API_URL } from "@workspace/api-client";
import { readAdminSession } from "@/lib/auth-session";

/** Base API gồm prefix `/api` (giống guides, speakers, posts URL). */
export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

export function adminUploadAuthHeaders(): Record<string, string> {
  const uid = readAdminSession()?.id;
  return uid ? { "X-User-Id": String(uid) } : {};
}

export type AdminUploadOptions = {
  folderPath: string;
  isExistingFolder?: boolean;
};

/**
 * Upload ảnh qua POST /api/admin/uploads — trả URL từ API (host 3002), dùng trực tiếp cho &lt;img src&gt;.
 */
export async function uploadAdminImage(
  file: File,
  options: AdminUploadOptions,
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folderPath", options.folderPath);
  if (options.isExistingFolder) {
    fd.append("isExistingFolder", "true");
  }

  const res = await fetch(`${apiBase()}/admin/uploads`, {
    method: "POST",
    headers: adminUploadAuthHeaders(),
    body: fd,
  });

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    error?: string | null;
    data?: { url?: string };
  } | null;

  if (!res.ok || json?.success === false) {
    throw new Error(
      json?.message || json?.error || `Upload thất bại (${res.status})`,
    );
  }

  const url = json?.data?.url?.trim();
  if (!url) throw new Error("Không nhận được URL ảnh");
  return url;
}
