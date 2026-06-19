"use client";

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
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { useTextSize } from "@ui/components/text-size-provider";
import { cn } from "@ui/lib/utils";
import { STORE_ENABLED } from "@/lib/store-feature";
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

function HeaderOptionsMenu({
  size,
  setSize,
  adminPortalPath,
  adminRegisterPath,
  isStoreAuthActive,
  isAdminPortalActive,
  isAdminRegisterActive,
}: {
  size: TextSizeValue;
  setSize: (value: TextSizeValue) => void;
  adminPortalPath: string;
  adminRegisterPath: string;
  isStoreAuthActive: boolean;
  isAdminPortalActive: boolean;
  isAdminRegisterActive: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "group/settings inline-flex h-9 shrink-0 cursor-pointer items-stretch overflow-hidden rounded-xl border border-border/80 bg-card text-left shadow-sm outline-none transition-all duration-200",
              "hover:-translate-y-px hover:border-primary/35 hover:shadow-md",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "data-popup-open:border-primary/45 data-popup-open:bg-primary/[0.04] data-popup-open:shadow-md data-popup-open:ring-2 data-popup-open:ring-primary/15"
            )}
            aria-label="Mở tùy chọn hiển thị và tài khoản"
          />
        }
      >
        <span className="relative flex w-9 shrink-0 items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
          <span
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_55%)]"
            aria-hidden
          />
          <Settings2 className="relative size-4" aria-hidden />
        </span>
        <span className="hidden min-w-[5.5rem] items-center justify-between gap-2 border-l border-border/70 px-3 sm:flex">
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-foreground">Cài đặt</span>
            <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
              Hiển thị · Tài khoản
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
        className="w-[min(100vw-1.5rem,20rem)] overflow-hidden rounded-xl p-0 shadow-lg ring-1 ring-border/60"
      >
        <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Tùy chọn</p>
          <p className="text-xs text-muted-foreground">
            Cỡ chữ và truy cập hệ thống
          </p>
        </div>

        <div className="space-y-3 p-2.5">
          <section className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
                <Type className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Cỡ chữ</p>
                <p className="text-xs text-muted-foreground">
                  Chọn kích thước dễ đọc
                </p>
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
                      "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 transition-all",
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
                    <span className="text-[10px] font-medium uppercase tracking-wide opacity-90">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="mb-1.5 px-1 text-xs font-semibold text-muted-foreground">
              Tài khoản
            </p>
            <div className="space-y-1">
              {STORE_ENABLED ? (
                <HeaderStoreAccountMenuItem isStoreAuthActive={isStoreAuthActive} />
              ) : null}
              <HeaderAccountLink
                label="Cổng quản trị"
                description="Truy cập khu vực quản trị"
                icon={ShieldCheck}
                href={adminPortalPath}
                active={isAdminPortalActive}
              />
              <HeaderAccountLink
                label="Đăng ký quản trị"
                description="Tạo tài khoản quản trị mới"
                icon={UserPlus}
                href={adminRegisterPath}
                active={isAdminRegisterActive}
              />
            </div>
          </section>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
}: {
  label: string;
  description: string;
  icon: typeof ShieldCheck;
  href?: string;
  external?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border",
          active
            ? "border-primary/30 bg-primary/10 text-primary"
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
    active ? "bg-primary/5" : "hover:border-border/60 hover:bg-muted/40"
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

function HeaderStoreAccountMenuItem({
  isStoreAuthActive,
}: {
  isStoreAuthActive: boolean;
}) {
  const session = useSession();

  return (
    <HeaderAccountLink
      label={session ? "Hồ sơ cửa hàng" : "Đăng nhập cửa hàng"}
      description={
        session ? "Quản lý thông tin đại lý" : "Truy cập tài khoản cửa hàng"
      }
      icon={Store}
      active={isStoreAuthActive}
      onClick={() => {
        window.location.assign(session ? "/profile" : "/login");
      }}
    />
  );
}

export function Header() {
  const pathname = usePathname();
  const { size, setSize } = useTextSize();
  const adminPortalPath = "/admin"
  const adminRegisterPath = "/admin/register"
  const isSupportActive = supportLinks.some((link) => isExactOrNestedPath(pathname, link.href));
  const isStoreAuthActive = isExactOrNestedPath(pathname, "/login");
  const isAdminPortalActive =
    pathname === adminPortalPath || pathname === "/admin/login"
  const isAdminRegisterActive = isExactOrNestedPath(pathname, adminRegisterPath)

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
          {STORE_ENABLED ? <HeaderStoreChrome pathname={pathname} /> : null}
          <HeaderOptionsMenu
            size={size}
            setSize={setSize}
            adminPortalPath={adminPortalPath}
            adminRegisterPath={adminRegisterPath}
            isStoreAuthActive={isStoreAuthActive}
            isAdminPortalActive={isAdminPortalActive}
            isAdminRegisterActive={isAdminRegisterActive}
          />
        </div>
      </div>
    </header>
  );
}
