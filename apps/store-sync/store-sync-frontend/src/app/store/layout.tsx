import type { Metadata } from "next";
import { StorePortalLayoutProvider } from "@/providers/store-portal-layout";

export const metadata: Metadata = {
  title: {
    template: "%s · Cửa hàng",
    default: "Quản lý cửa hàng",
  },
};

export default function StorePortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StorePortalLayoutProvider>{children}</StorePortalLayoutProvider>;
}
