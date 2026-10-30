import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { assinaturaValida, buscarPagamento } from "@/lib/mp";

export const runtime = "nodejs";

// O Mercado Pago avisa aqui quando um pagamento muda de estado.
// Nunca confiamos no corpo da mensagem: conferimos a assinatura e consultamos o pagamento direto na API.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const corpo = (await req.json().catch(() => ({}))) as { type?: string; data?: { id?: string | number } };

  const tipo = url.searchParams.get("type") ?? corpo.type;
  if (tipo && tipo !== "payment") return NextResponse.json({ ok: true });

  const dataId = url.searchParams.get("data.id") ?? (corpo.data?.id != null ? String(corpo.data.id) : null);
  if (!dataId) return NextResponse.json({ ok: true });

  const valida = assinaturaValida({
    signature: req.headers.get("x-signature"),
    requestId: req.headers.get("x-request-id"),
    dataId,
  });
  if (!valida) {
    console.warn("webhook: assinatura inválida");
    return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
  }

  try {
    const pag = await buscarPagamento(dataId);
    if (pag.status !== "approved" || !pag.orderId) return NextResponse.json({ ok: true });

    const admin = supabaseAdmin();
    const { data: pedido } = await admin
      .from("orders")
      .select("id, amount_cents")
      .eq("id", pag.orderId)
      .maybeSingle();
    if (!pedido) return NextResponse.json({ ok: true });

    if (pedido.amount_cents !== pag.amountCents) {
      console.error("webhook: valor pago difere do pedido", { pedido: pedido.id, pago: pag.amountCents });
      return NextResponse.json({ ok: true });
    }

    const { error } = await admin.rpc("fulfill_order", { p_order: pedido.id, p_payment: pag.id });
    if (error) {
      console.error("webhook: fulfill_order", error);
      return NextResponse.json({ erro: "falha ao liberar" }, { status: 500 }); // o Mercado Pago tenta de novo
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook", e);
    return NextResponse.json({ erro: "falha" }, { status: 500 });
  }
}
