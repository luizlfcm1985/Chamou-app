import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });

  const { sb, user } = await getUser();
  if (!user) return NextResponse.json({ erro: "Entre para continuar." }, { status: 401 });

  // O banco só devolve pedidos da própria pessoa (regra RLS).
  const { data } = await sb.from("orders").select("status").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ erro: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json({ status: data.status }, { headers: { "Cache-Control": "no-store" } });
}
