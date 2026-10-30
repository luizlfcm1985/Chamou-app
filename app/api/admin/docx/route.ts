import { NextResponse } from "next/server";
import { getUser, isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildDocx, nomeArquivo } from "@/lib/docx";
import { sanitizeResume } from "@/lib/resume";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Baixa o currículo de um cliente do serviço pessoal para o especialista trabalhar em cima.
export async function GET(req: Request) {
  const { user } = await getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });

  const alvo = new URL(req.url).searchParams.get("user") ?? "";
  if (!UUID.test(alvo)) return NextResponse.json({ erro: "Cliente inválido." }, { status: 400 });

  const { data: r } = await supabaseAdmin().from("resumes").select("data, template").eq("user_id", alvo).maybeSingle();
  if (!r) return NextResponse.json({ erro: "Esse cliente ainda não preencheu o currículo." }, { status: 404 });

  const dados = sanitizeResume(r.data);
  const buf = await buildDocx(dados, r.template ?? "classico");
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${nomeArquivo(dados)}"`,
      "Cache-Control": "no-store",
    },
  });
}
