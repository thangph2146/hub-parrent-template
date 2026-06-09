import { redirect } from "next/navigation";

export default function ProfileLegacyRedirectPage() {
  redirect("/store/profile");
}
