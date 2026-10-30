import type { CSSProperties } from "react";
import { bullets, contatoLinha, periodo, type ResumeData } from "@/lib/resume";
import { getTemplate } from "@/lib/templates";

export default function ResumePreview({ data, templateId }: { data: ResumeData; templateId: string }) {
  const t = getTemplate(templateId);
  const tinta = `#${t.corTitulo}`;
  const acento = `#${t.corAcento}`;
  const base = t.tamCorpo * 1.2;

  const cabecalho = (txt: string): CSSProperties => {
    const comum: CSSProperties = { color: tinta, fontSize: base + 1, margin: "14px 0 6px", letterSpacing: "0.02em" };
    if (t.estiloSecao === "barra") return { ...comum, borderLeft: `4px solid ${acento}`, paddingLeft: 8 };
    if (t.estiloSecao === "caixa-alta") return { ...comum, borderBottom: `2px solid ${acento}`, paddingBottom: 2 };
    return { ...comum, borderBottom: `1px solid ${acento}`, paddingBottom: 2 };
  };

  const Titulo = ({ children }: { children: string }) => <h4 style={cabecalho(children)}>{children}</h4>;

  const exps = data.experiencias.filter((e) => e.cargo.trim() || e.empresa.trim());
  const forms = data.formacao.filter((f) => f.curso.trim() || f.instituicao.trim());
  const cursos = data.cursos.filter((c) => c.nome.trim());
  const idiomas = data.idiomas.filter((i) => i.idioma.trim());
  const contato = contatoLinha(data);
  const centro = t.alinhaCabecalho === "center";

  return (
    <div className="paper" style={{ fontFamily: t.fontePrevia, fontSize: base }}>
      {t.faixa ? (
        <div style={{ background: tinta, color: "#fff", margin: "-28px -30px 8px", padding: "16px 30px" }}>
          <div style={{ fontSize: t.tamNome * 1.2, fontWeight: 800, lineHeight: 1.15 }}>{data.nome || "Seu nome"}</div>
          {data.cargo ? <div style={{ fontSize: base + 1.5 }}>{data.cargo}</div> : null}
          <div style={{ fontSize: base - 0.5, marginTop: 4 }}>{contato || "e-mail  |  telefone  |  cidade"}</div>
        </div>
      ) : (
        <div style={{ textAlign: centro ? "center" : "left" }}>
          <div style={{ fontSize: t.tamNome * 1.2, fontWeight: 800, color: tinta, lineHeight: 1.15 }}>{data.nome || "Seu nome"}</div>
          {data.cargo ? <div style={{ fontSize: base + 1.5, color: "#4b5373" }}>{data.cargo}</div> : null}
          <div style={{ fontSize: base - 0.5, color: "#4b5373", marginTop: 4 }}>{contato || "e-mail  |  telefone  |  cidade"}</div>
        </div>
      )}

      {data.resumo.trim() ? (
        <>
          <Titulo>Resumo profissional</Titulo>
          <p>{data.resumo}</p>
        </>
      ) : null}

      {exps.length ? (
        <>
          <Titulo>Experiência profissional</Titulo>
          {exps.map((e) => (
            <div key={e.id} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, overflow: "hidden" }}>
                <span className="dt" style={{ fontWeight: 400 }}>
                  {periodo(e.inicio, e.fim, e.atual)}
                </span>
                {[e.cargo.trim(), e.empresa.trim()].filter(Boolean).join(", ")}
              </div>
              {bullets(e.atividades).length ? (
                <ul>
                  {bullets(e.atividades).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </>
      ) : null}

      {forms.length ? (
        <>
          <Titulo>Formação acadêmica</Titulo>
          {forms.map((f) => (
            <div key={f.id} style={{ overflow: "hidden", marginBottom: 4 }}>
              <span className="dt">{periodo(f.inicio, f.fim, false)}</span>
              <strong>{f.curso}</strong>
              {f.instituicao ? `, ${f.instituicao}` : ""}
            </div>
          ))}
        </>
      ) : null}

      {cursos.length ? (
        <>
          <Titulo>Cursos e certificações</Titulo>
          <ul>
            {cursos.map((c) => {
              const det = [c.instituicao.trim(), c.ano.trim()].filter(Boolean).join(", ");
              return <li key={c.id}>{det ? `${c.nome} (${det})` : c.nome}</li>;
            })}
          </ul>
        </>
      ) : null}

      {idiomas.length ? (
        <>
          <Titulo>Idiomas</Titulo>
          <p>{idiomas.map((i) => (i.nivel.trim() ? `${i.idioma}: ${i.nivel}` : i.idioma)).join("  |  ")}</p>
        </>
      ) : null}

      {data.habilidades.length ? (
        <>
          <Titulo>Habilidades</Titulo>
          <p>{data.habilidades.join("  |  ")}</p>
        </>
      ) : null}

      {!data.nome && !exps.length && !data.resumo ? (
        <p style={{ color: "#4b5373", marginTop: 24, textAlign: "center" }}>
          A prévia aparece aqui conforme você preenche.
        </p>
      ) : null}
    </div>
  );
}
