import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isItemId, type ItemId } from "@/lib/pricing";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "Pagamento | Chamou" };
export const dynamic = "force-dynamic";

export default async function Checkout({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  const { sb, user } = await getUser();
  if (!user) redirect("/entrar?next=/checkout");
  const { add } = await searchParams;

  const { data: ent } = await sb.from("entitlements").select("can_download").eq("user_id", user.id).maybeSingle();
  const jaTemBase = ent?.can_download === true;
  const pre: ItemId[] = isItemId(add) && add !== "base" ? [add] : [];

  return <CheckoutClient jaTemBase={jaTemBase} preSelecionados={pre} testeAtivo={process.env.DEV_FAKE_PAYMENTS === "1" && process.env.VERCEL_ENV !== "production"} />;
}
