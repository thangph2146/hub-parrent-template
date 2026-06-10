"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Store,
  ShoppingCart,
  Package,
  Headphones,
  Box,
  ShieldCheck,
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import { CartCountBadge } from "@ui/components/product";
import { useCart, cartStore } from "@/hooks/use-cart";
import { resetCartHydration } from "@/lib/cart-sync";
import { ThemeToggle } from "@ui/components/theme-toggle";
import { TextSizeToggle } from "@ui/components/text-size-toggle";
import { Separator } from "@ui/components/separator";
import { Button } from "@ui/components/button";
import { Heading, Text } from "@ui/components/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ui/components/sheet";
import { useSession } from "@/hooks/use-session";
import { useOpenCartDrawer } from "@/components/shared/cart-drawer";

export function Header() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const { itemCount } = useCart();
  const openCart = useOpenCartDrawer();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const nav = useMemo(() => {
    const items: { href: string; label: string; icon: typeof ShoppingCart }[] = [
      { href: "/catalog", label: "Danh mục sỉ", icon: ShoppingCart },
    ];
    items.push({ href: "/support", label: "Hỗ trợ", icon: Headphones });
    if (isDevelopment) {
      items.push({ href: "/graph", label: "Sơ đồ hệ thống", icon: Box });
    }
    return items;
  }, [isDevelopment]);

  const profileHref = "/store/profile";

  const handleLogout = () => {
    resetCartHydration();
    localStorage.removeItem("storesync_session");
    cartStore.clear();
    window.dispatchEvent(new Event("storesync-session"));
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-background text-foreground shadow-level-1 dark:bg-card dark:text-card-foreground">
      <div className="mx-auto flex h-16 max-w-full items-center gap-2 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group min-w-0 shrink">
          <div className="bg-primary/10 p-1.5 rounded-lg transition-colors group-hover:bg-primary/20 shrink-0">
            <Store className="size-6 text-primary" />
          </div>
          <Heading as="span" size="title" className="text-primary tracking-tight truncate max-w-[9rem] sm:max-w-none">Hub B2B</Heading>
        </Link>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={openCart}
            aria-label={`Giỏ hàng${itemCount > 0 ? `, ${itemCount} loại` : ""}`}
            className="relative inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <ShoppingCart className="size-5" />
            <CartCountBadge
              count={itemCount}
              className="-right-0.5 -top-0.5 h-4 min-w-4 text-[9px]"
            />
          </Button>
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground shrink-0"
                  aria-label="Mở menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw,20rem)]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6 px-2">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" &&
                      pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                    >
                      <Icon className="size-4 shrink-0 opacity-80" />
                      {item.label}
                    </Link>
                  );
                })}
                {session ? (
                  <>
                    <div className="my-3 border-t border-border" />
                    <Link
                      href="/store/orders"
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${pathname.startsWith("/store/orders") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                    >
                      <Package className="size-4 shrink-0 opacity-80" />
                      Đơn hàng
                    </Link>
                    <Link
                      href={profileHref}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${pathname.startsWith("/store/profile") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                    >
                      <User className="size-4 shrink-0 opacity-80" />
                      Trang cá nhân
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4 shrink-0 opacity-80" />
                      Đăng xuất
                    </button>
                  </>
                ) : null}
                <div className="my-3 border-t border-border" />
                <div className="flex items-center justify-between gap-2 px-1 py-2">
                  <Text as="span" variant="label" className="text-muted-foreground text-xs">Giao diện</Text>
                  <div className="flex items-center gap-1">
                    <TextSizeToggle />
                    <ThemeToggle />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Nav desktop */}
        <nav className="ml-auto hidden md:flex items-center gap-4">
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "relative flex items-center gap-1.5 px-1 py-1 transition-all duration-200 " +
                  (isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary")
                }
              >
                <Text as="span" variant="label" className="font-bold">{item.label}</Text>
                {isActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}

          <Separator orientation="vertical" className="mx-2 h-6 bg-outline-variant/50" />

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={openCart}
              aria-label={
                itemCount > 0 ? `Giỏ hàng, ${itemCount} loại` : "Giỏ hàng"
              }
              className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              <ShoppingCart className="size-5" />
              <CartCountBadge
                count={itemCount}
                className="-right-1 -top-1 h-5 min-w-5 text-[10px]"
              />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Bell className="size-5" />
            </Button>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
                >
                  {session.role === "admin" ? (
                    <ShieldCheck className="size-5 text-primary" />
                  ) : (
                    <UserCircle className="size-5 text-primary" />
                  )}
                  <span className="text-xs font-semibold text-foreground max-w-28 truncate">
                    {session.displayName}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push("/store/orders")}>
                      <Package className="size-4" />
                      Đơn hàng
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(profileHref)}>
                      <User className="size-4" />
                      Trang cá nhân
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <UserCircle className="size-5" />
                </Button>
              </Link>
            )}
          </div>

          <Separator orientation="vertical" className="mx-2 h-6 bg-outline-variant/50" />

          <div className="flex items-center gap-2">
            <TextSizeToggle />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
