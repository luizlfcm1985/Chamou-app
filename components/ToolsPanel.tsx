"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Area, Campo, Secao } from "./ui";
import type { Ent } from "./Editor";

type Resultado = { texto?: string; erro?: string; creditos?: Partial<Ent> | null };

async function chamarIA(corpo: Record<string, unknown>): Promise<{ ok: boolean; r: Resultado }> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const r = (await res.json().catch(() => ({}))) as Resultado;
    return { ok: res.ok, r };
  } catch {
    return { ok: false, r: { erro: "Sem conexão. Tente de novo." } };
  }
}

function Resposta({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="result stack" role="status">
      <p style={{ whiteSpace: "pre-wrap" }}>{texto}</p>
      <div className="row">
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(texto);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2000);
            } catch {
              // o texto continua visível para copiar à mão
            }
          }}
        >
          {copiado ? "Copiado" : "Copiar texto"}
        </button>
      </div>
      <p className="caption muted">Leia com calma e troque os ___ por informações reais antes de usar.</p>
    </div>
  );
}

export default function ToolsPanel({ ent, onEnt, admin }: { ent: Ent; onEnt: (e: Ent) => void; admin: boolean }) {
  const router = useRouter();

  const [vaga, setVaga] = useState("");
  const [carta, setCarta] = useState("");
  const [cartaErro, setCartaErro] = useState("");
  const [cartaCarregando, setCartaCarregando] = useState(false);

  const [perfil, setPerfil] = useState("");
  const [alvo, setAlvo] = useState("");
  const [analise, setAnalise] = useState("");
  const [analiseErro, setAnaliseErro] = useState("");
  const [analiseCarregando, setAnaliseCarregando] = useState(false);

  const [apagando, setApagando] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [apagarErro, setApagarErro] = useState("");

  const temCarta = ent.cover_letter_credits + ent.ai_credits > 0;
  const temLinkedin = ent.linkedin_credits > 0;

  async function gerarCarta() {
    setCartaErro("");
    setCarta("");
    setCartaCarregando(true);
    const { ok, r } = await chamarIA({ tipo: "carta", vaga });
    setCartaCarregando(false);
    if (!ok) return setCartaErro(r.erro === "sem_creditos" ? "Seus usos acabaram." : (r.erro ?? "Não foi possível agora."));
    setCarta(r.texto ?? "");
    if (r.creditos) onEnt({ ...ent, ...r.creditos });
  }

  async function analisar() {
    setAnaliseErro("");
    setAnalise("");
    setAnaliseCarregando(true);
    const { ok, r } = await chamarIA({ tipo: "linkedin", perfil, alvo });
    setAnaliseCarregando(false);
    if (!ok) return setAnaliseErro(r.erro === "sem_creditos" ? "Seu uso de análise acabou." : (r.erro ?? "Não foi possível agora."));
    setAnalise(r.texto ?? "");
    if (r.creditos) onEnt({ ...ent, ...r.creditos });
  }

  async function sair() {
    await supabaseBrowser().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function apagar() {
    setApagarErro("");
    const res = await fetch("/api/conta/apagar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmacao }),
    });
    const j = (await res.json().catch(() => ({}))) as { erro?: string };
    if (!res.ok) return setApagarErro(j.erro ?? "Não foi possível apagar agora.");
    await supabaseBrowser().auth.signOut().catch(() => undefined);
    window.location.href = "/";
  }

  return (
    <>
      <Secao titulo="Carta de apresentação">
        {!ent.can_download ? (
          <p className="muted">Disponível depois de liberar o download do currículo.</p>
        ) : !temCarta ? (
          <p>
            Uma carta curta e direta, feita a partir do seu currículo. <Link href="/checkout?add=ia">Liberar por R$ 5,00</Link> (inclui 3 usos de IA para melhorar trechos).
          </p>
        ) : (
          <div className="stack">
            <Area
              label="Cole a descrição da vaga (opcional)"
              value={vaga}
              onChange={setVaga}
              rows={5}
              maxLength={4000}
              hint="Com a vaga, a carta fala direto com o que a empresa pede."
            />
            <div className="row">
              <button className="btn btn-primary" type="button" onClick={gerarCarta} disabled={cartaCarregando}>
                {cartaCarregando ? "Escrevendo…" : "Gerar carta"}
              </button>
              <span className="caption muted">Usos restantes: {ent.cover_letter_credits + ent.ai_credits}</span>
            </div>
            {cartaErro ? (
              <p className="alert alert-erro" role="alert">
                {cartaErro}
              </p>
            ) : null}
            {carta ? <Resposta texto={carta} /> : null}
          </div>
        )}
      </Secao>

      <Secao titulo="Análise do LinkedIn">
        {!ent.can_download ? (
          <p className="muted">Disponível depois de liberar o download do currículo.</p>
        ) : !temLinkedin ? (
          <p>
            Cole o texto do seu perfil e receba título, resumo e palavras-chave sugeridos. <Link href="/checkout?add=linkedin">Liberar por R$ 7,00</Link>.
          </p>
        ) : (
          <div className="stack">
            <p className="small muted">No LinkedIn, abra seu perfil, selecione o texto (título, “Sobre” e experiências), copie e cole abaixo. Não precisamos do link nem da sua senha.</p>
            <Campo label="Vaga ou área que você quer (opcional)" value={alvo} onChange={setAlvo} maxLength={100} placeholder="Ex.: Analista administrativo" />
            <Area label="Texto do seu perfil" value={perfil} onChange={setPerfil} rows={9} maxLength={8000} />
            <div className="row">
              <button className="btn btn-primary" type="button" onClick={analisar} disabled={analiseCarregando || perfil.trim().length < 80}>
                {analiseCarregando ? "Analisando…" : "Analisar perfil"}
              </button>
              <span className="caption muted">Análises restantes: {ent.linkedin_credits}</span>
            </div>
            {analiseErro ? (
              <p className="alert alert-erro" role="alert">
                {analiseErro}
              </p>
            ) : null}
            {analise ? <Resposta texto={analise} /> : null}
          </div>
        )}
      </Secao>

      <section className="card card-deep stack">
        <h2 className="t-title">Revisão pessoal premium</h2>
        <p>
          Um especialista reescreve seu currículo, otimiza as palavras-chave do seu LinkedIn para o algoritmo e escreve sua carta de apresentação. Entrega em até 48 horas úteis.
        </p>
        {ent.can_download ? (
          <div className="row">
            <Link className="btn btn-primary" href="/checkout?add=pessoal">
              Contratar por R$ 59,90
            </Link>
            <Link className="btn btn-secondary" href="/pessoal">
              Já contratei
            </Link>
          </div>
        ) : (
          <p className="small">Disponível depois de liberar o download do currículo.</p>
        )}
      </section>

      {admin ? (
        <section className="card card-flat">
          <Link href="/admin/pedidos">Painel de pedidos (admin)</Link>
        </section>
      ) : null}

      <Secao titulo="Sua conta">
        <div className="stack">
          <button className="btn btn-secondary" type="button" onClick={sair}>
            Sair
          </button>
          {!apagando ? (
            <button className="btn btn-ghost" type="button" onClick={() => setApagando(true)}>
              Apagar meus dados
            </button>
          ) : (
            <div className="stack card-tint">
              <p>
                Isso apaga seu currículo e sua conta de forma definitiva. Os créditos que sobraram não podem ser recuperados. Digite <strong>APAGAR</strong> para confirmar.
              </p>
              <Campo label="Confirmação" value={confirmacao} onChange={setConfirmacao} />
              {apagarErro ? (
                <p className="alert alert-erro" role="alert">
                  {apagarErro}
                </p>
              ) : null}
              <div className="row">
                <button className="btn btn-primary" type="button" onClick={apagar} disabled={confirmacao !== "APAGAR"}>
                  Apagar tudo
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setApagando(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </Secao>
    </>
  );
}
