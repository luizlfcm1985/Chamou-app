"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { emptyResume, uid, type ResumeData } from "@/lib/resume";
import { TEMPLATES, type TemplateId } from "@/lib/templates";
import { verificar } from "@/lib/checklist";
import { FRASES } from "@/lib/frases";
import { Marca } from "./Logo";
import { Area, Campo, Secao } from "./ui";
import ResumePreview from "./ResumePreview";
import ToolsPanel from "./ToolsPanel";

export type Ent = { can_download: boolean; ai_credits: number; cover_letter_credits: number; linkedin_credits: number };

type Props = {
  userId: string;
  initial: ResumeData;
  initialTemplate: TemplateId;
  ent: Ent;
  pago: boolean;
  admin: boolean;
};

function atualizar<T extends { id: string }>(lista: T[], id: string, patch: Partial<T>): T[] {
  return lista.map((x) => (x.id === id ? { ...x, ...patch } : x));
}

export default function Editor({ userId, initial, initialTemplate, ent: entInicial, pago, admin }: Props) {
  const router = useRouter();
  const sb = useMemo(() => supabaseBrowser(), []);
  const [data, setData] = useState<ResumeData>(initial);
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [ent, setEnt] = useState<Ent>(entInicial);
  const [aba, setAba] = useState<"editar" | "previa" | "ferramentas">("editar");
  const [status, setStatus] = useState<"salvo" | "salvando" | "erro">("salvo");
  const [aviso, setAviso] = useState("");
  const primeira = useRef(true);

  // Salva sozinho, 1 segundo depois da última digitação.
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    setStatus("salvando");
    const t = setTimeout(async () => {
      const { error } = await sb
        .from("resumes")
        .upsert({ user_id: userId, data, template, updated_at: new Date().toISOString() });
      setStatus(error ? "erro" : "salvo");
    }, 900);
    return () => clearTimeout(t);
  }, [data, template, sb, userId]);

  const set = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) => setData((d) => ({ ...d, [k]: v }));
  const avisos = useMemo(() => verificar(data), [data]);

  function baixar() {
    if (!ent.can_download) {
      router.push("/checkout");
      return;
    }
    if (!data.nome.trim()) {
      setAviso("Preencha ao menos o seu nome antes de baixar.");
      setAba("editar");
      return;
    }
    setAviso("");
    window.location.href = `/api/resume/docx?template=${template}`;
  }

  const textoStatus = status === "salvando" ? "Salvando…" : status === "erro" ? "Não foi possível salvar" : "Salvo";

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <Link href="/app" className="logo" aria-label="Chamou">
            <Marca />
            <span>Chamou</span>
          </Link>
          <div className="row" style={{ gap: 12 }}>
            <span className={`small ${status === "erro" ? "" : "muted"}`} style={status === "erro" ? { color: "var(--danger)", fontWeight: 600 } : undefined} role="status">
              {textoStatus}
            </span>
            <button className="btn btn-primary btn-sm" type="button" onClick={baixar}>
              {ent.can_download ? "Baixar Word" : "Baixar Word (R$ 14,90)"}
            </button>
          </div>
        </div>
      </header>

      <main className="wrap">
        {pago ? (
          <p className="alert alert-ok" role="status" style={{ marginTop: 16 }}>
            Pagamento confirmado. Seu download está liberado.
          </p>
        ) : null}
        {aviso ? (
          <p className="alert alert-erro" role="alert" style={{ marginTop: 16 }}>
            {aviso}
          </p>
        ) : null}

        <div className="tabs" role="tablist" aria-label="Áreas do app">
          <button className="tab" role="tab" aria-selected={aba === "editar"} onClick={() => setAba("editar")}>
            Preencher
          </button>
          <button className="tab tab-previa" role="tab" aria-selected={aba === "previa"} onClick={() => setAba("previa")}>
            Prévia
          </button>
          <button className="tab" role="tab" aria-selected={aba === "ferramentas"} onClick={() => setAba("ferramentas")}>
            Extras
          </button>
        </div>

        <div className="layout" data-tab={aba}>
          <div className="col-editor stack-lg">
            {aba === "ferramentas" ? (
              <ToolsPanel ent={ent} onEnt={setEnt} admin={admin} />
            ) : (
              <>
                <Secao titulo="Modelo">
                  <div className="tpls">
                    {TEMPLATES.map((t) => (
                      <button key={t.id} type="button" className="tpl" aria-pressed={template === t.id} onClick={() => setTemplate(t.id)}>
                        {t.nome}
                        <span>{t.descricao}</span>
                      </button>
                    ))}
                  </div>
                </Secao>

                <Secao titulo="Seus dados">
                  <div className="stack">
                    <Campo label="Nome completo" value={data.nome} onChange={(v) => set("nome", v)} autoComplete="name" maxLength={80} />
                    <Campo
                      label="Cargo que você busca"
                      value={data.cargo}
                      onChange={(v) => set("cargo", v)}
                      placeholder="Ex.: Assistente Administrativo"
                      hint="Aparece logo abaixo do seu nome."
                      maxLength={80}
                    />
                    <div className="grid2">
                      <Campo label="E-mail" type="email" inputMode="email" autoComplete="email" value={data.email} onChange={(v) => set("email", v)} />
                      <Campo label="Telefone / WhatsApp" type="tel" inputMode="tel" autoComplete="tel" value={data.telefone} onChange={(v) => set("telefone", v)} placeholder="(11) 91234-5678" />
                    </div>
                    <div className="grid2">
                      <Campo label="Cidade e estado" value={data.cidade} onChange={(v) => set("cidade", v)} placeholder="São Paulo, SP" autoComplete="address-level2" />
                      <Campo label="LinkedIn (opcional)" value={data.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/seunome" inputMode="url" />
                    </div>
                  </div>
                </Secao>

                <Secao titulo="Resumo profissional">
                  <div className="stack">
                    <Area
                      label="Fale de você em 2 a 4 linhas"
                      value={data.resumo}
                      onChange={(v) => set("resumo", v)}
                      rows={5}
                      maxLength={1200}
                      hint="Quanto tempo de experiência, em que área e o que você busca."
                    />
                    <MelhorarIA campo="Resumo profissional" texto={data.resumo} ent={ent} onEnt={setEnt} onUsar={(t) => set("resumo", t)} />
                  </div>
                </Secao>

                <Secao
                  titulo="Experiência"
                  acao={
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() =>
                        set("experiencias", [...data.experiencias, { id: uid(), empresa: "", cargo: "", inicio: "", fim: "", atual: false, atividades: "" }])
                      }
                    >
                      Adicionar
                    </button>
                  }
                >
                  {data.experiencias.length === 0 ? <p className="muted">Nenhuma experiência ainda. Adicione a primeira, a mais recente.</p> : null}
                  {data.experiencias.map((e) => (
                    <div className="item stack" key={e.id}>
                      <div className="grid2">
                        <Campo label="Cargo" value={e.cargo} onChange={(v) => set("experiencias", atualizar(data.experiencias, e.id, { cargo: v }))} maxLength={100} />
                        <Campo label="Empresa" value={e.empresa} onChange={(v) => set("experiencias", atualizar(data.experiencias, e.id, { empresa: v }))} maxLength={100} />
                      </div>
                      <div className="grid2">
                        <Campo label="Início" value={e.inicio} placeholder="03/2021" inputMode="numeric" onChange={(v) => set("experiencias", atualizar(data.experiencias, e.id, { inicio: v }))} />
                        <Campo label="Fim" value={e.atual ? "" : e.fim} placeholder={e.atual ? "Atual" : "02/2024"} inputMode="numeric" onChange={(v) => set("experiencias", atualizar(data.experiencias, e.id, { fim: v }))} />
                      </div>
                      <label className="check">
                        <input type="checkbox" checked={e.atual} onChange={(ev) => set("experiencias", atualizar(data.experiencias, e.id, { atual: ev.target.checked }))} />
                        Trabalho aqui atualmente
                      </label>
                      <Area
                        label="O que você fazia (uma atividade por linha)"
                        value={e.atividades}
                        rows={5}
                        maxLength={1500}
                        onChange={(v) => set("experiencias", atualizar(data.experiencias, e.id, { atividades: v }))}
                        hint="Comece cada linha com um verbo: Atendi, Organizei, Controlei…"
                      />
                      <Frases onEscolher={(f) => set("experiencias", atualizar(data.experiencias, e.id, { atividades: e.atividades.trim() ? `${e.atividades.trim()}\n${f}` : f }))} />
                      <MelhorarIA
                        campo={`Atividades de ${e.cargo || "experiência"}`}
                        texto={e.atividades}
                        ent={ent}
                        onEnt={setEnt}
                        onUsar={(t) => set("experiencias", atualizar(data.experiencias, e.id, { atividades: t }))}
                      />
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => set("experiencias", data.experiencias.filter((x) => x.id !== e.id))}>
                        Remover esta experiência
                      </button>
                    </div>
                  ))}
                </Secao>

                <Secao
                  titulo="Formação"
                  acao={
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => set("formacao", [...data.formacao, { id: uid(), curso: "", instituicao: "", inicio: "", fim: "" }])}>
                      Adicionar
                    </button>
                  }
                >
                  {data.formacao.length === 0 ? <p className="muted">Inclua até o ensino médio, se for o caso.</p> : null}
                  {data.formacao.map((f) => (
                    <div className="item stack" key={f.id}>
                      <div className="grid2">
                        <Campo label="Curso ou nível" value={f.curso} placeholder="Ensino Médio Completo" onChange={(v) => set("formacao", atualizar(data.formacao, f.id, { curso: v }))} />
                        <Campo label="Instituição" value={f.instituicao} onChange={(v) => set("formacao", atualizar(data.formacao, f.id, { instituicao: v }))} />
                      </div>
                      <div className="grid2">
                        <Campo label="Início (ano)" value={f.inicio} inputMode="numeric" onChange={(v) => set("formacao", atualizar(data.formacao, f.id, { inicio: v }))} />
                        <Campo label="Fim (ano ou previsão)" value={f.fim} inputMode="numeric" onChange={(v) => set("formacao", atualizar(data.formacao, f.id, { fim: v }))} />
                      </div>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => set("formacao", data.formacao.filter((x) => x.id !== f.id))}>
                        Remover
                      </button>
                    </div>
                  ))}
                </Secao>

                <Secao
                  titulo="Cursos e certificações"
                  acao={
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => set("cursos", [...data.cursos, { id: uid(), nome: "", instituicao: "", ano: "" }])}>
                      Adicionar
                    </button>
                  }
                >
                  {data.cursos.map((c) => (
                    <div className="item stack" key={c.id}>
                      <Campo label="Nome do curso" value={c.nome} onChange={(v) => set("cursos", atualizar(data.cursos, c.id, { nome: v }))} />
                      <div className="grid2">
                        <Campo label="Instituição" value={c.instituicao} onChange={(v) => set("cursos", atualizar(data.cursos, c.id, { instituicao: v }))} />
                        <Campo label="Ano" value={c.ano} inputMode="numeric" onChange={(v) => set("cursos", atualizar(data.cursos, c.id, { ano: v }))} />
                      </div>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => set("cursos", data.cursos.filter((x) => x.id !== c.id))}>
                        Remover
                      </button>
                    </div>
                  ))}
                  {data.cursos.length === 0 ? <p className="muted">Opcional, mas ajuda muito quem tem pouca experiência.</p> : null}
                </Secao>

                <Secao
                  titulo="Idiomas"
                  acao={
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => set("idiomas", [...data.idiomas, { id: uid(), idioma: "", nivel: "" }])}>
                      Adicionar
                    </button>
                  }
                >
                  {data.idiomas.map((i) => (
                    <div className="item stack" key={i.id}>
                      <div className="grid2">
                        <Campo label="Idioma" value={i.idioma} onChange={(v) => set("idiomas", atualizar(data.idiomas, i.id, { idioma: v }))} />
                        <div className="field">
                          <label htmlFor={`n-${i.id}`}>Nível</label>
                          <select id={`n-${i.id}`} className="select" value={i.nivel} onChange={(ev) => set("idiomas", atualizar(data.idiomas, i.id, { nivel: ev.target.value }))}>
                            <option value="">Escolha</option>
                            <option>Básico</option>
                            <option>Intermediário</option>
                            <option>Avançado</option>
                            <option>Fluente</option>
                            <option>Nativo</option>
                          </select>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => set("idiomas", data.idiomas.filter((x) => x.id !== i.id))}>
                        Remover
                      </button>
                    </div>
                  ))}
                  {data.idiomas.length === 0 ? <p className="muted">Opcional.</p> : null}
                </Secao>

                <Secao titulo="Habilidades">
                  <Habilidades valor={data.habilidades} onChange={(v) => set("habilidades", v)} />
                </Secao>

                <Secao titulo="Conferência rápida">
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="stack">
                    {avisos.map((a, i) => (
                      <li key={i} className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                        <span className={`tag tag-${a.nivel}`}>{a.nivel === "erro" ? "Corrigir" : a.nivel === "aviso" ? "Atenção" : "Ok"}</span>
                        <span>{a.texto}</span>
                      </li>
                    ))}
                  </ul>
                </Secao>

                <button className="btn btn-primary btn-block" type="button" onClick={baixar}>
                  {ent.can_download ? "Baixar meu currículo em Word" : "Baixar em Word por R$ 14,90"}
                </button>
                {!ent.can_download ? <p className="small muted" style={{ textAlign: "center" }}>Pagamento único por Pix. Sem assinatura.</p> : null}
              </>
            )}
          </div>

          <div className="col-preview stack">
            <p className="label muted">Prévia do modelo {TEMPLATES.find((t) => t.id === template)?.nome}</p>
            <ResumePreview data={data} templateId={template} />
            <p className="caption muted">A prévia é aproximada. O Word segue o mesmo modelo, mas a quebra de página pode variar.</p>
          </div>
        </div>
      </main>
    </>
  );
}

function Habilidades({ valor, onChange }: { valor: string[]; onChange: (v: string[]) => void }) {
  const [texto, setTexto] = useState("");
  function adicionar() {
    const novos = texto
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !valor.some((v) => v.toLowerCase() === s.toLowerCase()));
    if (novos.length) onChange([...valor, ...novos].slice(0, 25));
    setTexto("");
  }
  return (
    <div className="stack">
      <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="hab">Digite uma habilidade e toque em Adicionar</label>
          <input
            id="hab"
            className="input"
            value={texto}
            placeholder="Ex.: Excel, Atendimento ao cliente"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionar();
              }
            }}
          />
        </div>
        <button className="btn btn-secondary" type="button" onClick={adicionar}>
          Adicionar
        </button>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {valor.map((h) => (
          <span className="chip" key={h}>
            {h}
            <button className="chip-x" type="button" aria-label={`Remover ${h}`} onClick={() => onChange(valor.filter((x) => x !== h))}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function Frases({ onEscolher }: { onEscolher: (f: string) => void }) {
  const [aberto, setAberto] = useState(false);
  const [area, setArea] = useState(FRASES[0].area);
  const lista = FRASES.find((f) => f.area === area)?.frases ?? [];
  return (
    <div className="stack">
      <button className="btn btn-secondary btn-sm" type="button" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
        {aberto ? "Fechar frases prontas" : "Ver frases prontas"}
      </button>
      {aberto ? (
        <div className="card-tint stack">
          <div className="row" style={{ gap: 8 }}>
            {FRASES.map((f) => (
              <button key={f.area} className="chip" type="button" aria-pressed={area === f.area} onClick={() => setArea(f.area)}>
                {f.area}
              </button>
            ))}
          </div>
          <p className="small">Toque numa frase para adicionar. Ajuste para o que é verdade no seu caso e troque os ___ por números reais.</p>
          {lista.map((f) => (
            <button key={f} className="btn btn-secondary btn-sm" type="button" style={{ textAlign: "left", justifyContent: "flex-start", height: "auto", padding: "10px 14px" }} onClick={() => onEscolher(f)}>
              {f}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MelhorarIA({
  campo,
  texto,
  ent,
  onEnt,
  onUsar,
}: {
  campo: string;
  texto: string;
  ent: Ent;
  onEnt: (e: Ent) => void;
  onUsar: (t: string) => void;
}) {
  const [carregando, setCarregando] = useState(false);
  const [sugestao, setSugestao] = useState("");
  const [erro, setErro] = useState("");

  async function pedir() {
    setErro("");
    setSugestao("");
    setCarregando(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "melhorar", campo, texto }),
      });
      const j = (await r.json()) as { texto?: string; erro?: string; creditos?: Partial<Ent> | null };
      if (!r.ok) {
        setErro(j.erro === "sem_creditos" ? "Seus usos de IA acabaram." : (j.erro ?? "Não foi possível agora."));
        return;
      }
      setSugestao(j.texto ?? "");
      if (j.creditos) onEnt({ ...ent, ...j.creditos });
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  if (ent.ai_credits <= 0) {
    return (
      <p className="small muted">
        Quer ajuda da IA para reescrever? <Link href="/checkout?add=ia">Liberar por R$ 5,00</Link> (inclui a carta de apresentação).
      </p>
    );
  }

  return (
    <div className="stack">
      <div className="row">
        <button className="btn btn-secondary btn-sm" type="button" onClick={pedir} disabled={carregando || texto.trim().length < 10}>
          {carregando ? "Pensando…" : "Melhorar com IA"}
        </button>
        <span className="caption muted">{ent.ai_credits} {ent.ai_credits === 1 ? "uso restante" : "usos restantes"}</span>
      </div>
      {erro ? (
        <p className="alert alert-erro" role="alert">
          {erro}
        </p>
      ) : null}
      {sugestao ? (
        <div className="sugestao stack" role="status">
          <p className="label">Sugestão da IA</p>
          <p style={{ whiteSpace: "pre-wrap" }}>{sugestao}</p>
          <div className="row">
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                onUsar(sugestao);
                setSugestao("");
              }}
            >
              Usar este texto
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSugestao("")}>
              Descartar
            </button>
          </div>
          <p className="caption muted">Confira se tudo é verdade para você antes de usar.</p>
        </div>
      ) : null}
    </div>
  );
}

export { emptyResume };
