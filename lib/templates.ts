export type TemplateId = "classico" | "moderno" | "executivo" | "compacto";

export type TemplateCfg = {
  id: TemplateId;
  nome: string;
  descricao: string;
  fonte: string; // fonte do Word
  fontePrevia: string; // pilha CSS da prévia
  corTitulo: string; // hex sem #
  corAcento: string; // hex sem #
  tamNome: number; // pt
  tamCorpo: number; // pt
  alinhaCabecalho: "center" | "left";
  estiloSecao: "regua" | "barra" | "caixa-alta";
  faixa: boolean; // cabeçalho em faixa colorida
  margemTwip: number;
  espaco: number; // espaço entre blocos, em twips
};

// Todos os modelos são de uma coluna, sem tabelas nem imagens: leem bem em sistemas de seleção.
export const TEMPLATES: TemplateCfg[] = [
  {
    id: "classico",
    nome: "Clássico",
    descricao: "Sóbrio, com fonte serifada e linhas finas. Serve para qualquer área.",
    fonte: "Georgia",
    fontePrevia: "Georgia, 'Times New Roman', serif",
    corTitulo: "12172B",
    corAcento: "12172B",
    tamNome: 24,
    tamCorpo: 10.5,
    alinhaCabecalho: "center",
    estiloSecao: "regua",
    faixa: false,
    margemTwip: 1000,
    espaco: 220,
  },
  {
    id: "moderno",
    nome: "Moderno",
    descricao: "Limpo e leve, com uma barra coral nos títulos. Bom para atendimento, vendas e tecnologia.",
    fonte: "Calibri",
    fontePrevia: "Calibri, Carlito, 'Segoe UI', Arial, sans-serif",
    corTitulo: "12172B",
    corAcento: "FF5B2E",
    tamNome: 26,
    tamCorpo: 10.5,
    alinhaCabecalho: "left",
    estiloSecao: "barra",
    faixa: false,
    margemTwip: 1000,
    espaco: 240,
  },
  {
    id: "executivo",
    nome: "Executivo",
    descricao: "Cabeçalho em faixa azul-noite. Passa seriedade para cargos de liderança e gestão.",
    fonte: "Cambria",
    fontePrevia: "Cambria, Caladea, Georgia, serif",
    corTitulo: "12172B",
    corAcento: "12172B",
    tamNome: 24,
    tamCorpo: 10.5,
    alinhaCabecalho: "left",
    estiloSecao: "caixa-alta",
    faixa: true,
    margemTwip: 1000,
    espaco: 220,
  },
  {
    id: "compacto",
    nome: "Compacto",
    descricao: "Mais texto por página. Ideal quando há muita experiência para caber em uma folha.",
    fonte: "Arial",
    fontePrevia: "Arial, 'Liberation Sans', Helvetica, sans-serif",
    corTitulo: "12172B",
    corAcento: "4B5373",
    tamNome: 20,
    tamCorpo: 9.5,
    alinhaCabecalho: "left",
    estiloSecao: "regua",
    faixa: false,
    margemTwip: 800,
    espaco: 160,
  },
];

export function getTemplate(id: string | undefined | null): TemplateCfg {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function isTemplateId(id: unknown): id is TemplateId {
  return typeof id === "string" && TEMPLATES.some((t) => t.id === id);
}
