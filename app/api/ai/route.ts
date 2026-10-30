import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sanitizeResume } from "@/lib/resume";
import { IaRecusou, analisarLinkedin, escreverCarta, melhorarTrecho } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

type Tipo = "melhorar" | "carta" | "linkedin";

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const { sb, user } = await getUser();
  if (!user) return NextResponse.json({ erro: "Entre para continuar." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const tipo = body?.tipo as Tipo | undefined;
  if (tipo !== "melhorar" && tipo !== "carta" && tipo !== "linkedin") {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  // 1) Valida tudo ANTES de gastar crédito.
  let executar: () => Promise<string>;
  let tiposDeCredito: string[];

  if (tipo === "melhorar") {
    const campo = txt(body?.campo, 60) || "Texto";
    const texto = txt(body?.texto, 2000);
    if (texto.length < 10) return NextResponse.json({ erro: "Escreva um pouco mais antes de pedir a melhoria." }, { status: 400 });
    tiposDeCredito = ["ai"];
    executar = () => melhorarTrecho(campo, texto);
  } else if (tipo === "carta") {
    const { data: r } = await sb.from("resumes").select("data").eq("user_id", user.id).maybeSingle();
    const dados = sanitizeResume(r?.data);
    if (!dados.nome.trim() || (!dados.resumo.trim() && dados.experiencias.length === 0)) {
      return NextResponse.json({ erro: "Preencha o nome e o resumo ou uma experiência antes de gerar a carta." }, { status: 400 });
    }
    const vaga = txt(body?.vaga, 4000);
    tiposDeCredito = ["cover", "ai"];
    executar = () => escreverCarta(dados, vaga);
  } else {
    const perfil = txt(body?.perfil, 8000);
    if (perfil.length < 80) return NextResponse.json({ erro: "Cole o texto do seu perfil (título, sobre e experiências)." }, { status: 400 });
    const alvo = txt(body?.alvo, 100);
    tiposDeCredito = ["linkedin"];
    executar = () => analisarLinkedin(perfil, alvo);
  }

  // 2) Gasta 1 crédito de forma atômica no banco.
  const admin = supabaseAdmin();
  let gasto: string | null = null;
  for (const k of tiposDeCredito) {
    const { data } = await admin.rpc("consume_credit", { p_user: user.id, p_kind: k });
    if (data === true) {
      gasto = k;
      break;
    }
  }
  if (!gasto) return NextResponse.json({ erro: "sem_creditos" }, { status: 402 });

  // 3) Chama a IA. Se falhar, devolve o crédito.
  try {
    const texto = await executar();
    const { data: ent } = await sb
      .from("entitlements")
      .select("ai_credits, cover_letter_credits, linkedin_credits")
      .eq("user_id", user.id)
      .maybeSingle();
    return NextResponse.json({ texto, creditos: ent ?? null });
  } catch (e) {
    await admin.rpc("refund_credit", { p_user: user.id, p_kind: gasto });
    console.error("ia", e);
    const msg =
      e instanceof IaRecusou
        ? "A IA não conseguiu processar este texto. Seu crédito foi devolvido."
        : "Não foi possível gerar agora. Seu crédito foi devolvido; tente de novo em instantes.";
    return NextResponse.json({ erro: msg }, { status: 502 });
  }
}
