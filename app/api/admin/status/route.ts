import { NextResponse } from "next/server";
import { getUser, isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const STATUS = ["recebido", "em_producao", "entregue"] as const;

export async function POST(req: Request) {
  const { user } = await getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { id?: string; status?: string } | null;
  if (!body?.id || !STATUS.includes(body.status as (typeof STATUS)[number])) {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }
  const { error } = await supabaseAdmin()
    .from("service_orders")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", body.id);
  if (error) return NextResponse.json({ erro: "Falha ao atualizar." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
