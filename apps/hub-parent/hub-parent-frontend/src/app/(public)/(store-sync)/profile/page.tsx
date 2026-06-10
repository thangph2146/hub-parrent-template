"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Container, Page, PageContent } from "@ui/components/layout";
import {
  STORE_CONTAINER_INSET,
  STORE_CONTAINER_MAX_DEFAULT,
  STORE_PAGE_CONTENT_CLASS,
} from "@ui/lib/layout-shell";
import { LogOut, ShieldCheck, Store } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { cartStore } from "@/hooks/use-cart";

const STORAGE_KEY = "storesync_session";

export default function ProfilePage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!session) router.push("/login?next=/profile");
  }, [session, router]);

  if (!session) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    cartStore.clear();
    window.dispatchEvent(new Event("storesync-session"));
    router.push("/login");
  };

  return (
    <Page>
      <PageContent className={STORE_PAGE_CONTENT_CLASS}>
        <Container max={STORE_CONTAINER_MAX_DEFAULT} className={`${STORE_CONTAINER_INSET} space-y-6`}>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <Store className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hồ sơ đại lý</h1>
              <p className="text-muted-foreground">Thông tin phiên đăng nhập cửa hàng</p>
            </div>
          </div>

          <Card className="rounded-3xl border-outline-variant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                {session.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{session.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vai trò</p>
                <Badge variant="secondary">{session.role}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/orders" className={buttonVariants({ variant: "outline" })}>
                  Đơn hàng của tôi
                </Link>
                <Button type="button" variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  Đăng xuất
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </PageContent>
    </Page>
  );
}
