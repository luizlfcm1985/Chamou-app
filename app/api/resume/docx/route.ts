import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { buildDocx, nomeArquivo } from "@/lib/docx";
import { sanitizeResume } from "@/lib/resume";
import { isTemplateId } from "@/lib/templates";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { sb, user } = await getUser();
  if (!user) return NextResponse.json({ erro: "Entre para continuar." }, { status: 401 });

  const { data: ent } = await sb.from("entitlements").select("can_download").eq("user_id", user.id).maybeSingle();
  if (!ent?.can_download) {
    return NextResponse.json({ erro: "Libere o download para baixar o Word." }, { status: 402 });
  }

  const { data: r } = await sb.from("resumes").select("data, template").eq("user_id", user.id).maybeSingle();
  const dados = sanitizeResume(r?.data);
  if (!dados.nome.trim()) return NextResponse.json({ erro: "Preencha ao menos o seu nome." }, { status: 400 });

  const pedido = new URL(req.url).searchParams.get("template");
  const modelo = isTemplateId(pedido) ? pedido : (r?.template ?? "classico");

  const buf = await buildDocx(dados, modelo);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${nomeArquivo(dados)}"`,
      "Cache-Control": "no-store",
    },
  });
}
