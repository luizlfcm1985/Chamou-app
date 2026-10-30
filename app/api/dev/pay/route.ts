import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Só para testar o fluxo sem pagar. Fica desligado em produção, mesmo que a variável seja ligada por engano.
export async function POST(req: Request) {
  if (process.env.DEV_FAKE_PAYMENTS !== "1" || process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ erro: "Não encontrado." }, { status: 404 });
  }
  const { user } = await getUser();
  if (!user) return NextResponse.json({ erro: "Entre para continuar." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { orderId?: string } | null;
  if (!body?.orderId) return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: pedido } = await admin.from("orders").select("id, user_id").eq("id", body.orderId).maybeSingle();
  if (!pedido || pedido.user_id !== user.id) return NextResponse.json({ erro: "Pedido não encontrado." }, { status: 404 });

  const { error } = await admin.rpc("fulfill_order", { p_order: pedido.id, p_payment: `teste-${pedido.id}` });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
