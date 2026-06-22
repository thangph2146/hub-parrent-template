"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { api } from "@/lib/api";

export function PublicPostViewBadge({
  slug,
  initialCount,
}: {
  slug: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await api.public.trackPostView(slug);
        if (cancelled || typeof data.viewCount !== "number") return;
        setCount(data.viewCount);
      } catch {
        // Giữ initialCount khi lỗi mạng
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Eye className="size-3.5" />
      {count} lượt xem
    </span>
  );
}
