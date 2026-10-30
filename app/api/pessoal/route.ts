import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { user } = await getUser();
  if (!user) return NextResponse.json({ erro: "Entre para continuar." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { brief?: unknown; whatsapp?: unknown } | null;
  const brief = typeof body?.brief === "string" ? body.brief.trim().slice(0, 3000) : "";
  const whatsapp = typeof body?.whatsapp === "string" ? body.whatsapp.replace(/\D/g, "").slice(0, 13) : "";
  if (brief.length < 10) return NextResponse.json({ erro: "Conte um pouco mais sobre a vaga ou o objetivo." }, { status: 400 });
  if (whatsapp.length < 10) return NextResponse.json({ erro: "Informe um WhatsApp com DDD." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: pedido } = await admin
    .from("service_orders")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "aguardando_dados")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!pedido) return NextResponse.json({ erro: "Nenhum pedido de revisão pessoal aguardando dados." }, { status: 404 });

  const { error } = await admin
    .from("service_orders")
    .update({ brief, whatsapp, status: "recebido", updated_at: new Date().toISOString() })
    .eq("id", pedido.id);
  if (error) return NextResponse.json({ erro: "Não foi possível salvar. Tente de novo." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
