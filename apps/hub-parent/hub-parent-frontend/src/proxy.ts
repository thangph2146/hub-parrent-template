import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isStoreRoute, STORE_ENABLED } from "@/lib/store-feature";

export function proxy(request: NextRequest) {
  if (!STORE_ENABLED && isStoreRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (process.env.NODE_ENV === "development") {
    const { pathname, search } = request.nextUrl;
    console.log(
      `[frontend] ${request.method} ${pathname}${search ? search : ""}`,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
