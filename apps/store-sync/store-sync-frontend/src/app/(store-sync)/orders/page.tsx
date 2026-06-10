import { redirect } from "next/navigation";
import { STORE_PORTAL_HOME } from "@/config/store-portal-layout-static";

export default function OrdersLegacyRedirectPage() {
  redirect(STORE_PORTAL_HOME);
}
