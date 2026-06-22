"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  Info,
  Mail,
  CircleHelp,
  Settings2,
  Type,
  ShoppingCart,
  Package,
  ShieldCheck,
  UserPlus,
  Store,
  ChevronDown,
  ExternalLink,
  Menu,
  LogOut,
  UserRound,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Badge } from "@ui/components/badge";
import { cartStore, useCart } from "@/hooks/use-cart";
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
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ui/components/sheet";
import { useTextSize } from "@ui/components/text-size-provider";
import { useTheme } from "@ui/components/theme-provider";
import { cn } from "@ui/lib/utils";
import { STORE_ENABLED } from "@/lib/store-feature";
import {
  ADMIN_SESSION_EVENT,
  ADMIN_SESSION_KEY,
  clearAdminSession,
  readAdminSession,
} from "@/lib/admin/auth-session";
import { Logo } from "../icons/logo";

const basePrimaryLinks = [
  {
    label: "Trang chủ",
    href: "/",
    icon: Home,
  },
  {
    label: "Cửa hàng",
    href: "/catalog",
    icon: ShoppingCart,
    storeOnly: true,
  },
  {
    label: "Bài viết",
    href: "/bai-viet",
    icon: FileText,
  },
] as const;

const primaryLinks = basePrimaryLinks.filter(
  (item) => STORE_ENABLED || !("storeOnly" in item && item.storeOnly),
);

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

const STORE_SESSION_KEY = "storesync_session";
const STORE_SESSION_EVENT = "storesync-session";

function subscribeAdminSession(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ADMIN_SESSION_KEY) callback();
  };
  const onCustom = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener(ADMIN_SESSION_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ADMIN_SESSION_EVENT, onCustom);
  };
}

function useAdminHeaderSession() {
  return useSyncExternalStore(subscribeAdminSession, readAdminSession, () => null);
}

/** Chỉ mount khi STORE_ENABLED — phải nằm trong CartDrawerHost. */
function HeaderStoreChrome({ pathname }: { pathname: string }) {
  const session = useSession();
  const { unitCount } = useCart();
  const openCart = useOpenCartDrawer();
  const isOrdersActive = isExactOrNestedPath(pathname, "/orders");

  return (
    <>
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
    </>
  );
}

const TEXT_SIZE_OPTIONS = [
  { value: "sm", label: "Nhỏ", sampleClass: "text-[11px]" },
  { value: "base", label: "Vừa", sampleClass: "text-sm" },
  { value: "lg", label: "Lớn", sampleClass: "text-base" },
] as const;

type TextSizeValue = (typeof TEXT_SIZE_OPTIONS)[number]["value"];

const THEME_OPTIONS = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Hệ thống", icon: Monitor },
] as const;

type ThemeValue = (typeof THEME_OPTIONS)[number]["value"];

function HeaderOptionsMenu({
  size,
  setSize,
  adminPortalPath,
  adminRegisterPath,
  adminProfilePath,
  pathname,
  isStoreAuthActive,
  isAdminPortalActive,
  isAdminRegisterActive,
  isAdminProfileActive,
}: {
  size: TextSizeValue;
  setSize: (value: TextSizeValue) => void;
  adminPortalPath: string;
  adminRegisterPath: string;
  adminProfilePath: string;
  pathname: string;
  isStoreAuthActive: boolean;
  isAdminPortalActive: boolean;
  isAdminRegisterActive: boolean;
  isAdminProfileActive: boolean;
}) {
  const storeSession = useSession();
  const adminSession = useAdminHeaderSession();
  const { theme, resolved, setTheme } = useTheme();
  const adminRoleLabel =
    adminSession?.roles?.[0]?.displayName ?? adminSession?.roles?.[0]?.name ?? "Quản trị";
  const hasSignedInSession = Boolean(adminSession || storeSession);
  const TriggerIcon = adminSession ? ShieldCheck : storeSession ? Store : Settings2;
  const triggerLabel = adminSession
    ? (adminSession.name ?? adminSession.email)
    : storeSession
      ? storeSession.displayName
      : "Cài đặt";
  const triggerDescription = adminSession
    ? `${adminRoleLabel} · ${adminSession.email}`
    : storeSession
      ? `Đại lý · ${storeSession.username}`
      : "Hiển thị · Tài khoản";

  const handleStoreLogout = () => {
    localStorage.removeItem(STORE_SESSION_KEY);
    cartStore.clear();
    window.dispatchEvent(new Event(STORE_SESSION_EVENT));
    window.location.assign("/login");
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
    window.location.assign("/admin/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "group/settings inline-flex h-10 shrink-0 cursor-pointer items-stretch overflow-hidden rounded-xl border bg-card text-left shadow-sm outline-none transition-all duration-200",
              hasSignedInSession ? "border-primary/25 bg-primary/[0.04]" : "border-border/80",
              "hover:-translate-y-px hover:border-primary/35 hover:shadow-md",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "data-popup-open:border-primary/45 data-popup-open:bg-primary/[0.04] data-popup-open:shadow-md data-popup-open:ring-2 data-popup-open:ring-primary/15"
            )}
            aria-label="Mở tùy chọn hiển thị và tài khoản"
          />
        }
      >
        <span className="relative flex w-10 shrink-0 items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
          <span
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_55%)]"
            aria-hidden
          />
          <TriggerIcon className="relative size-4" aria-hidden />
        </span>
        <span className="hidden min-w-0 max-w-[12rem] items-center justify-between gap-2 border-l border-border/70 px-3 sm:flex xl:max-w-[16rem]">
          <span className="min-w-0 flex-1 leading-none">
            <span className="block truncate text-sm font-semibold text-foreground">
              {triggerLabel}
            </span>
            <span
              className={cn(
                "mt-0.5 block truncate text-[10px] font-medium",
                hasSignedInSession ? "text-primary" : "text-muted-foreground"
              )}
            >
              {triggerDescription}
            </span>
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open/settings:rotate-180"
            aria-hidden
          />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-1.5rem,21rem)] overflow-hidden rounded-xl p-0 shadow-lg ring-1 ring-border/60"
      >
        <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-3.5 py-3">
          <p className="text-sm font-semibold text-foreground">Cấu hình nhanh</p>
          <p className="text-xs text-muted-foreground">
            Hiển thị, cửa hàng và quản trị
          </p>
        </div>

        <div className="space-y-2 p-2">
          <section className="rounded-lg border border-border/60 bg-muted/20 p-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background text-primary">
                {resolved === "dark" ? (
                  <Moon className="size-4" aria-hidden />
                ) : (
                  <Sun className="size-4" aria-hidden />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Giao diện</p>
                <p className="truncate text-xs text-muted-foreground">
                  Chọn sáng, tối hoặc theo hệ thống
                </p>
              </div>
            </div>
            <div
              role="radiogroup"
              aria-label="Giao diện"
              className="grid grid-cols-3 gap-2"
            >
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setTheme(option.value as ThemeValue)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/70 bg-background text-foreground hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-border/60 bg-muted/20 p-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background text-primary">
                <Type className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Cỡ chữ</p>
                <p className="truncate text-xs text-muted-foreground">Chọn kích thước dễ đọc</p>
              </div>
            </div>
            <div
              role="radiogroup"
              aria-label="Cỡ chữ"
              className="grid grid-cols-3 gap-2"
            >
              {TEXT_SIZE_OPTIONS.map((option) => {
                const isActive = size === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSize(option.value)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 transition-all",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/70 bg-background text-foreground hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "font-bold leading-none",
                        option.sampleClass,
                        isActive ? "text-primary-foreground" : "text-foreground"
                      )}
                    >
                      Aa
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {STORE_ENABLED ? (
            <section>
              <HeaderMenuSectionTitle>Cửa hàng</HeaderMenuSectionTitle>
              {storeSession ? (
                <div className="mb-1 rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {storeSession.displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {storeSession.username}
                  </p>
                </div>
              ) : null}
              <div className="space-y-0.5">
                <HeaderAccountLink
                  label={storeSession ? "Hồ sơ cửa hàng" : "Đăng nhập cửa hàng"}
                  description={storeSession ? "Thông tin đại lý" : "Truy cập tài khoản đại lý"}
                  icon={Store}
                  href={storeSession ? "/profile" : "/login"}
                  active={isStoreAuthActive || isExactOrNestedPath(pathname, "/profile")}
                />
                {storeSession ? (
                  <>
                    <HeaderAccountLink
                      label="Đơn hàng"
                      description="Theo dõi đơn đã đặt"
                      icon={Package}
                      href="/orders"
                      active={isExactOrNestedPath(pathname, "/orders")}
                    />
                    <HeaderAccountLink
                      label="Đăng xuất cửa hàng"
                      description="Kết thúc phiên đại lý"
                      icon={LogOut}
                      onClick={handleStoreLogout}
                      destructive
                    />
                  </>
                ) : null}
              </div>
            </section>
          ) : null}

          <section>
            <HeaderMenuSectionTitle>Quản trị</HeaderMenuSectionTitle>
            {adminSession ? (
              <div className="mb-1 rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {adminSession.name ?? adminSession.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {adminRoleLabel} · {adminSession.email}
                </p>
              </div>
            ) : null}
            <div className="space-y-1">
              <HeaderAccountLink
                label={adminSession ? "Bảng điều khiển" : "Đăng nhập quản trị"}
                description={adminSession ? "Vào khu vực vận hành" : "Truy cập tài khoản quản trị"}
                icon={ShieldCheck}
                href={adminSession ? adminPortalPath : "/admin/login"}
                active={isAdminPortalActive}
              />
              {adminSession ? (
                <>
                  <HeaderAccountLink
                    label="Hồ sơ quản trị"
                    description="Cập nhật thông tin cá nhân"
                    icon={UserRound}
                    href={adminProfilePath}
                    active={isAdminProfileActive}
                  />
                  <HeaderAccountLink
                    label="Đăng xuất quản trị"
                    description="Kết thúc phiên quản trị"
                    icon={LogOut}
                    onClick={handleAdminLogout}
                    destructive
                  />
                </>
              ) : (
                <HeaderAccountLink
                  label="Đăng ký quản trị"
                  description="Tạo tài khoản quản trị mới"
                  icon={UserPlus}
                  href={adminRegisterPath}
                  active={isAdminRegisterActive}
                />
              )}
            </div>
          </section>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderMenuSectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function HeaderAccountLink({
  label,
  description,
  icon: Icon,
  href,
  external = false,
  active = false,
  onClick,
  destructive = false,
}: {
  label: string;
  description: string;
  icon: typeof ShieldCheck;
  href?: string;
  external?: boolean;
  active?: boolean;
  onClick?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border",
          active
            ? "border-primary/30 bg-primary/10 text-primary"
            : destructive
              ? "border-destructive/20 bg-destructive/5 text-destructive"
              : "border-border/70 bg-background text-muted-foreground"
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {label}
          {external ? <ExternalLink className="size-3 text-muted-foreground" /> : null}
        </span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </>
  );

  const className = cn(
    "flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors",
    active
      ? "bg-primary/5"
      : destructive
        ? "text-destructive hover:border-destructive/20 hover:bg-destructive/5"
        : "hover:border-border/60 hover:bg-muted/40"
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

function HeaderMobileMenu({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
}) {
  const session = useSession();
  const closeMenu = () => onOpenChange(false);
  const storeQuickLinks = STORE_ENABLED
    ? [
        {
          label: "Giỏ hàng",
          href: "/cart",
          icon: ShoppingCart,
          description: "Kiểm tra sản phẩm đã chọn",
        },
        ...(session
          ? [
              {
                label: "Đơn hàng",
                href: "/orders",
                icon: Package,
                description: "Theo dõi trạng thái đơn đã đặt",
              },
              {
                label: "Hồ sơ cửa hàng",
                href: "/profile",
                icon: Store,
                description: "Quản lý thông tin đại lý",
              },
            ]
          : [
              {
                label: "Đăng nhập cửa hàng",
                href: "/login",
                icon: Store,
                description: "Truy cập tài khoản đại lý",
              },
            ]),
      ]
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted md:hidden"
        aria-label="Mở menu điều hướng"
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100vw-1.5rem,340px)] overflow-y-auto">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Trường Đại học Ngân hàng</SheetTitle>
          <p className="text-xs text-muted-foreground">Thành Phố Hồ Chí Minh</p>
        </SheetHeader>

        <nav className="flex flex-col gap-4 px-4" aria-label="Menu di động">
          <section className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Điều hướng
            </p>
            {[...primaryLinks, ...storeQuickLinks].map((item) => {
              const isActive = isExactOrNestedPath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={item.href === "/bai-viet" ? false : undefined}
                  onClick={closeMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-3 transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <item.icon className="mt-0.5 size-5 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block font-semibold">{item.label}</span>
                    {"description" in item && item.description ? (
                      <span className="block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </section>

          <section className="space-y-1 border-t border-border/70 pt-4">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Hỗ trợ
            </p>
            {supportLinks.map((item) => {
              const isActive = isExactOrNestedPath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-3 transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <item.icon className="mt-0.5 size-5 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block font-semibold">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </section>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { size, setSize } = useTextSize();
  const adminPortalPath = "/admin"
  const adminRegisterPath = "/admin/register"
  const adminProfilePath = "/admin/profile"
  const isSupportActive = supportLinks.some((link) => isExactOrNestedPath(pathname, link.href));
  const isStoreAuthActive = isExactOrNestedPath(pathname, "/login");
  const isAdminPortalActive =
    pathname === adminPortalPath || pathname === "/admin/login"
  const isAdminRegisterActive = isExactOrNestedPath(pathname, adminRegisterPath)
  const isAdminProfileActive = isExactOrNestedPath(pathname, adminProfilePath)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 md:px-12">
        <div className="flex min-w-0 flex-1 items-center justify-start gap-3">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
            <Logo className="h-8 w-8 sm:h-10 sm:w-10" />
            <div className="hidden min-w-0 max-w-[13rem] leading-tight min-[430px]:block lg:max-w-none">
              <div className="truncate text-xs font-semibold">Trường Đại học Ngân hàng</div>
              <div className="truncate text-[11px] text-muted-foreground">Thành Phố Hồ Chí Minh</div>
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {STORE_ENABLED ? <HeaderStoreChrome pathname={pathname} /> : null}
          <HeaderOptionsMenu
            size={size}
            setSize={setSize}
            adminPortalPath={adminPortalPath}
            adminRegisterPath={adminRegisterPath}
            adminProfilePath={adminProfilePath}
            pathname={pathname}
            isStoreAuthActive={isStoreAuthActive}
            isAdminPortalActive={isAdminPortalActive}
            isAdminRegisterActive={isAdminRegisterActive}
            isAdminProfileActive={isAdminProfileActive}
          />
          <HeaderMobileMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            pathname={pathname}
          />
        </div>
      </div>
    </header>
  );
}
