import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailLegacyRedirectPage({
  params,
}: PageProps) {
  const { orderId } = await params;
  redirect(`/store/orders/${orderId}`);
}
