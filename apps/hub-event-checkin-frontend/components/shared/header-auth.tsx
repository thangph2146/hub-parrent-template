"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@ui/components/button";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  buildLoginHref,
  clearEventSession,
  readEventSession,
  subscribeEventSession,
} from "@/lib/event-auth";

function useEventSession() {
  return useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null,
  );
}

export function HeaderAuth() {
  const session = useEventSession();
  const pathname = usePathname();

  if (session) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <span className="max-w-[140px] truncate text-xs text-muted-foreground">
          {session.name || session.email}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-lg"
          onClick={() => {
            clearEventSession();
            window.location.reload();
          }}
        >
          <LogOut className="size-4" />
          Thoát
        </Button>
      </div>
    );
  }

  return (
    <Link href={buildLoginHref(pathname || "/")} className="hidden sm:block">
      <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg">
        <LogIn className="size-4" />
        Đăng nhập
      </Button>
    </Link>
  );
}
