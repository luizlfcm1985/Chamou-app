import {
  AlignmentType,
  BorderStyle,
  Document,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Tab,
  TabStopType,
  TextRun,
} from "docx";
import { bullets, contatoLinha, periodo, type ResumeData } from "./resume";
import { getTemplate } from "./templates";

const A4_WIDTH = 11906;
const A4_HEIGHT = 16838;
const BRANCO = "FFFFFF";

export async function buildDocx(d: ResumeData, templateId: string): Promise<Buffer> {
  const t = getTemplate(templateId);
  const larguraUtil = A4_WIDTH - t.margemTwip * 2;
  const half = (pt: number) => Math.round(pt * 2);

  const run = (
    text: string,
    o: { bold?: boolean; italics?: boolean; size?: number; color?: string; caps?: boolean } = {},
  ) =>
    new TextRun({
      text,
      font: t.fonte,
      size: half(o.size ?? t.tamCorpo),
      bold: o.bold,
      italics: o.italics,
      color: o.color,
      allCaps: o.caps,
    });

  const out: Paragraph[] = [];

  // ---------- Cabeçalho ----------
  const alin = t.alinhaCabecalho === "center" ? AlignmentType.CENTER : AlignmentType.LEFT;
  const contato = contatoLinha(d);
  const nome = d.nome.trim() || "Seu nome";

  if (t.faixa) {
    const shading = { type: ShadingType.CLEAR, fill: t.corTitulo, color: "auto" } as const;
    // A borda na mesma cor da faixa cria o respiro interno; o recuo compensa para a faixa ficar alinhada às margens.
    const lado = { style: BorderStyle.SINGLE, size: 4, color: t.corTitulo, space: 10 } as const;
    const lados = { left: 210, right: 210 };
    const moldura = { left: lado, right: lado } as const;
    const folga = () =>
      new Paragraph({ shading, border: moldura, indent: lados, spacing: { before: 0, after: 0 }, run: { size: 12 }, children: [] });
    out.push(folga());
    out.push(
      new Paragraph({
        shading,
        border: moldura,
        indent: lados,
        spacing: { before: 0, after: 0 },
        children: [run(nome, { bold: true, size: t.tamNome, color: BRANCO })],
      }),
    );
    if (d.cargo.trim()) {
      out.push(
        new Paragraph({
          shading,
          border: moldura,
          indent: lados,
          spacing: { before: 0, after: 0 },
          children: [run(d.cargo, { size: t.tamCorpo + 1.5, color: BRANCO })],
        }),
      );
    }
    out.push(
      new Paragraph({
        shading,
        border: moldura,
        indent: lados,
        spacing: { before: 40, after: 0 },
        children: [run(contato, { size: t.tamCorpo - 0.5, color: BRANCO })],
      }),
    );
    out.push(folga());
  } else {
    out.push(
      new Paragraph({
        alignment: alin,
        spacing: { before: 0, after: 40 },
        children: [run(nome, { bold: true, size: t.tamNome, color: t.corTitulo })],
      }),
    );
    if (d.cargo.trim()) {
      out.push(
        new Paragraph({
          alignment: alin,
          spacing: { before: 0, after: 40 },
          children: [run(d.cargo, { size: t.tamCorpo + 1.5, color: t.corAcento === "FF5B2E" ? "4B5373" : t.corAcento })],
        }),
      );
    }
    out.push(
      new Paragraph({
        alignment: alin,
        spacing: { before: 0, after: t.espaco },
        children: [run(contato, { size: t.tamCorpo - 0.5, color: "4B5373" })],
      }),
    );
  }

  // ---------- Títulos de seção ----------
  const secao = (titulo: string) => {
    const base = { spacing: { before: t.espaco, after: 80 }, keepNext: true } as const;
    if (t.estiloSecao === "barra") {
      return new Paragraph({
        ...base,
        border: { left: { style: BorderStyle.SINGLE, size: 24, color: t.corAcento, space: 8 } },
        children: [run(titulo, { bold: true, size: t.tamCorpo + 2, color: t.corTitulo, caps: true })],
      });
    }
    if (t.estiloSecao === "caixa-alta") {
      return new Paragraph({
        ...base,
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: t.corAcento, space: 2 } },
        children: [run(titulo, { bold: true, size: t.tamCorpo + 1, color: t.corTitulo, caps: true })],
      });
    }
    return new Paragraph({
      ...base,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: t.corAcento, space: 2 } },
      children: [run(titulo, { bold: true, size: t.tamCorpo + 1, color: t.corTitulo, caps: true })],
    });
  };

  const linhaComData = (esquerda: TextRun[], data: string) =>
    new Paragraph({
      spacing: { before: 100, after: 20 },
      keepNext: true,
      tabStops: [{ type: TabStopType.RIGHT, position: larguraUtil }],
      children: data ? [...esquerda, new TextRun({ children: [new Tab(), data], font: t.fonte, size: half(t.tamCorpo), color: "4B5373" })] : esquerda,
    });

  const marcador = (texto: string) =>
    new Paragraph({
      numbering: { reference: "marcadores", level: 0 },
      spacing: { before: 0, after: 20 },
      children: [run(texto)],
    });

  // ---------- Resumo ----------
  if (d.resumo.trim()) {
    out.push(secao("Resumo profissional"));
    out.push(new Paragraph({ spacing: { before: 0, after: 0, line: 276 }, children: [run(d.resumo.trim())] }));
  }

  // ---------- Experiência ----------
  const exps = d.experiencias.filter((e) => e.cargo.trim() || e.empresa.trim());
  if (exps.length) {
    out.push(secao("Experiência profissional"));
    for (const e of exps) {
      const titulo = [e.cargo.trim(), e.empresa.trim()].filter(Boolean).join(", ");
      out.push(linhaComData([run(titulo, { bold: true })], periodo(e.inicio, e.fim, e.atual)));
      for (const b of bullets(e.atividades)) out.push(marcador(b));
    }
  }

  // ---------- Formação ----------
  const forms = d.formacao.filter((f) => f.curso.trim() || f.instituicao.trim());
  if (forms.length) {
    out.push(secao("Formação acadêmica"));
    for (const f of forms) {
      out.push(
        linhaComData(
          [run(f.curso.trim(), { bold: true }), ...(f.instituicao.trim() ? [run(`, ${f.instituicao.trim()}`)] : [])],
          periodo(f.inicio, f.fim, false),
        ),
      );
    }
  }

  // ---------- Cursos ----------
  const cursos = d.cursos.filter((c) => c.nome.trim());
  if (cursos.length) {
    out.push(secao("Cursos e certificações"));
    for (const c of cursos) {
      const detalhe = [c.instituicao.trim(), c.ano.trim()].filter(Boolean).join(", ");
      out.push(marcador(detalhe ? `${c.nome.trim()} (${detalhe})` : c.nome.trim()));
    }
  }

  // ---------- Idiomas ----------
  const idiomas = d.idiomas.filter((i) => i.idioma.trim());
  if (idiomas.length) {
    out.push(secao("Idiomas"));
    out.push(
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [run(idiomas.map((i) => (i.nivel.trim() ? `${i.idioma.trim()}: ${i.nivel.trim()}` : i.idioma.trim())).join("  |  "))],
      }),
    );
  }

  // ---------- Habilidades ----------
  if (d.habilidades.length) {
    out.push(secao("Habilidades"));
    out.push(new Paragraph({ spacing: { before: 0, after: 0, line: 276 }, children: [run(d.habilidades.join("  |  "))] }));
  }

  const doc = new Document({
    creator: "Chamou",
    title: `Currículo ${nome}`,
    description: "Currículo gerado no Chamou",
    numbering: {
      config: [
        {
          reference: "marcadores",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 240 } } },
            },
          ],
        },
      ],
    },
    styles: { default: { document: { run: { font: t.fonte, size: half(t.tamCorpo) } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_WIDTH, height: A4_HEIGHT },
            margin: { top: t.margemTwip - 100, right: t.margemTwip, bottom: t.margemTwip - 100, left: t.margemTwip },
          },
        },
        children: out,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function nomeArquivo(d: ResumeData): string {
  const base = (d.nome || "curriculo")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `curriculo-${base || "chamou"}.docx`;
}
