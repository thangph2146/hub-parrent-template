"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  Info,
  Mail,
  CircleHelp,
  SlidersHorizontal,
  Type,
  ShoppingCart,
  Package,
} from "lucide-react";
import { Badge } from "@ui/components/badge";
import { useCart } from "@/hooks/use-cart";
import { useOpenCartDrawer } from "@/components/shared/cart-drawer";
import { useSession } from "@/hooks/use-session";
import { Button, buttonVariants } from "@ui/components/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@ui/components/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { useTextSize } from "@ui/components/text-size-provider";
import { cn } from "@ui/lib/utils";
import { getAdminLoginUrl, getAdminRegisterUrl } from "@/features/auth/admin-bridge";
import { Logo } from "../icons/logo";

const primaryLinks = [
  {
    label: "Trang chủ",
    href: "/",
    icon: Home,
  },
  {
    label: "Cửa hàng",
    href: "/catalog",
    icon: ShoppingCart,
  },
  {
    label: "Bài viết",
    href: "/bai-viet",
    icon: FileText,
  },
] as const;

const supportLinks = [
  {
    label: "Giới thiệu",
    href: "/ve-chung-toi",
    icon: Info,
    description: "Thông tin về tổ chức",
  },
  {
    label: "Liên hệ hỗ trợ",
    href: "/lien-he",
    icon: Mail,
    description: "Gửi yêu cầu hỗ trợ trực tiếp",
  },
  {
    label: "Trợ giúp",
    href: "/huong-dan-su-dung",
    icon: CircleHelp,
    description: "Hướng dẫn sử dụng",
  },
];

const isExactOrNestedPath = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function Header() {
  const pathname = usePathname();
  const { size, setSize } = useTextSize();
  const session = useSession();
  const { unitCount } = useCart();
  const openCart = useOpenCartDrawer();
  const adminLoginUrl = getAdminLoginUrl();
  const adminRegisterUrl = getAdminRegisterUrl();
  const isSupportActive = supportLinks.some((link) => isExactOrNestedPath(pathname, link.href));
  const isLoginActive = isExactOrNestedPath(pathname, "/login");
  const isRegisterActive = isExactOrNestedPath(pathname, "/register");
  const isOrdersActive = isExactOrNestedPath(pathname, "/orders");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-6 md:px-12">
        <div className="flex w-full items-center justify-start gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo className="h-8 w-8 sm:h-10 sm:w-10" />
            <div className="hidden leading-tight sm:block">
              <div className="text-xs font-semibold">Trường Đại học Ngân hàng</div>
              <div className="text-[11px] text-muted-foreground">Thành Phố Hồ Chí Minh</div>
            </div>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-1">
              {primaryLinks.map((item) => {
                const isActive = isExactOrNestedPath(pathname, item.href);

                return (
                  <NavigationMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={item.href === "/bai-viet" ? false : undefined}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </NavigationMenuItem>
                );
              })}

              <NavigationMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        className={cn(
                          "inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                          isSupportActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground hover:bg-muted/80"
                        )}
                      />
                    }
                  >
                    Hỗ trợ
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[360px] p-2">
                    <div className="grid grid-cols-2 gap-2">
                      {supportLinks.map((item) => {
                        const isActive = isExactOrNestedPath(pathname, item.href);

                        return (
                          <DropdownMenuItem key={item.href} className="p-0">
                            <Link
                              href={item.href}
                              aria-current={isActive ? "page" : undefined}
                              className={cn(
                                "flex w-full items-start gap-2 rounded-md px-2 py-2 transition-colors",
                                isActive ? "bg-muted" : "hover:bg-muted/70"
                              )}
                            >
                              <span
                                className={cn(
                                  "rounded-md border p-1.5",
                                  isActive
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-border"
                                )}
                              >
                                <item.icon className="size-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium">{item.label}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {session ? (
            <Link
              href="/orders"
              className={cn(
                buttonVariants({
                  variant: isOrdersActive ? "default" : "outline",
                  size: "sm",
                }),
                "hidden sm:inline-flex"
              )}
            >
              <Package className="mr-1.5 size-4" />
              Đơn hàng
            </Link>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative"
            onClick={openCart}
            aria-label={`Giỏ hàng${unitCount > 0 ? `, ${unitCount} món` : ""}`}
          >
            <ShoppingCart className="size-4" />
            {unitCount > 0 ? (
              <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]">
                {unitCount > 99 ? "99+" : unitCount}
              </Badge>
            ) : null}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-medium"
                  aria-label="Mở tùy chọn"
                />
              }
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Tùy chọn</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tùy chỉnh hiển thị
              </div>
              <div className="px-2 pb-2 pt-1">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Type className="size-4 text-muted-foreground" />
                  Cỡ chữ
                </div>
                <DropdownMenuRadioGroup
                  value={size}
                  onValueChange={(value) => setSize(value as "sm" | "base" | "lg")}
                >
                  <div className="grid grid-cols-3 gap-2">
                    <DropdownMenuRadioItem
                      value="sm"
                      className="justify-center rounded-md border border-border px-2 py-2 font-bold"
                    >
                      S
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="base"
                      className="justify-center rounded-md border border-border px-2 py-2 font-bold"
                    >
                      M
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="lg"
                      className="justify-center rounded-md border border-border px-2 py-2 font-bold"
                    >
                      L
                    </DropdownMenuRadioItem>
                  </div>
                </DropdownMenuRadioGroup>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tài khoản
              </div>
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-md px-2 py-2 mb-2",
                  isLoginActive ? "bg-primary/10 text-primary" : undefined
                )}
                onClick={() => {
                  window.location.assign(session ? "/profile" : "/login");
                }}
              >
                {session ? "Hồ sơ cửa hàng" : "Đăng nhập cửa hàng"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md px-2 py-2 mb-2 text-muted-foreground"
                onClick={() => window.location.assign(adminLoginUrl)}
              >
                Cổng quản trị
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-md px-2 py-2 text-muted-foreground",
                  isRegisterActive ? "bg-muted" : undefined
                )}
                onClick={() => window.location.assign(adminRegisterUrl)}
              >
                Đăng ký quản trị
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
