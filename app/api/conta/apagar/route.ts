import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Apaga o currículo, a conta e os dados pessoais. Registros financeiros ficam sem vínculo com a pessoa.
export async function POST(req: Request) {
  const { sb, user } = await getUser();
  if (!user) return NextResponse.json({ erro: "Entre para continuar." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { confirmacao?: string } | null;
  if (body?.confirmacao !== "APAGAR") {
    return NextResponse.json({ erro: 'Digite APAGAR para confirmar.' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  await admin.from("service_orders").update({ brief: null, whatsapp: null }).eq("user_id", user.id);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("apagar conta", error);
    return NextResponse.json({ erro: "Não foi possível apagar agora. Tente de novo." }, { status: 500 });
  }
  await sb.auth.signOut().catch(() => undefined);
  return NextResponse.json({ ok: true });
}
