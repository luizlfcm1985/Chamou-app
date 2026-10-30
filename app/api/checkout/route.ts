import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ITEMS, isItemId, totalCents, type ItemId } from "@/lib/pricing";
import { criarPix } from "@/lib/mp";

export const runtime = "nodejs";

function pagamentoDeTeste(): boolean {
  return process.env.DEV_FAKE_PAYMENTS === "1" && process.env.VERCEL_ENV !== "production";
}

export async function POST(req: Request) {
  const { user } = await getUser();
  if (!user || !user.email) return NextResponse.json({ erro: "Entre para continuar." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { items?: unknown } | null;
  let itens: ItemId[] = Array.isArray(body?.items) ? [...new Set(body!.items as unknown[])].filter(isItemId) : [];
  if (itens.length === 0) return NextResponse.json({ erro: "Escolha o que deseja comprar." }, { status: 400 });

  const admin = supabaseAdmin();

  const { data: ent } = await admin.from("entitlements").select("can_download").eq("user_id", user.id).maybeSingle();
  const jaTemBase = ent?.can_download === true;
  if (jaTemBase) itens = itens.filter((i) => i !== "base");
  if (!jaTemBase && !itens.includes("base")) {
    return NextResponse.json({ erro: "Para comprar extras, libere o download do currículo primeiro." }, { status: 400 });
  }
  if (itens.length === 0) return NextResponse.json({ erro: "Você já tem este item." }, { status: 400 });

  // Freio simples contra abuso: no máximo 10 pedidos abertos a cada 10 minutos.
  const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending")
    .gte("created_at", desde);
  if ((count ?? 0) >= 10) return NextResponse.json({ erro: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });

  const cents = totalCents(itens);
  const { data: order, error } = await admin
    .from("orders")
    .insert({ user_id: user.id, items: itens, amount_cents: cents })
    .select("id")
    .single();
  if (error || !order) {
    console.error("checkout: falha ao criar pedido", error);
    return NextResponse.json({ erro: "Não foi possível criar o pedido. Tente de novo." }, { status: 500 });
  }

  if (pagamentoDeTeste()) {
    return NextResponse.json({ orderId: order.id, amountCents: cents, teste: true });
  }

  try {
    const pix = await criarPix({
      orderId: order.id,
      cents,
      email: user.email,
      descricao: `Chamou: ${itens.map((i) => ITEMS[i].nome).join(" + ")}`,
    });
    await admin.from("orders").update({ mp_payment_id: pix.paymentId }).eq("id", order.id);
    return NextResponse.json({
      orderId: order.id,
      amountCents: cents,
      qrCode: pix.qrCode,
      qrBase64: pix.qrBase64,
      ticketUrl: pix.ticketUrl,
    });
  } catch (e) {
    console.error("checkout: Mercado Pago", e);
    return NextResponse.json({ erro: "Não foi possível gerar o Pix agora. Tente de novo em instantes." }, { status: 502 });
  }
}
