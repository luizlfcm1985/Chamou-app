export type Experiencia = {
  id: string;
  empresa: string;
  cargo: string;
  inicio: string;
  fim: string;
  atual: boolean;
  atividades: string; // uma atividade por linha
};
export type Formacao = { id: string; curso: string; instituicao: string; inicio: string; fim: string };
export type Curso = { id: string; nome: string; instituicao: string; ano: string };
export type Idioma = { id: string; idioma: string; nivel: string };

export type ResumeData = {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  cidade: string;
  linkedin: string;
  resumo: string;
  experiencias: Experiencia[];
  formacao: Formacao[];
  cursos: Curso[];
  idiomas: Idioma[];
  habilidades: string[];
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyResume(): ResumeData {
  return {
    nome: "",
    cargo: "",
    email: "",
    telefone: "",
    cidade: "",
    linkedin: "",
    resumo: "",
    experiencias: [],
    formacao: [],
    cursos: [],
    idiomas: [],
    habilidades: [],
  };
}

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.slice(0, max) : "");
const arr = (v: unknown, max: number): unknown[] => (Array.isArray(v) ? v.slice(0, max) : []);
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/** Limpa e limita qualquer dado vindo do navegador antes de salvar ou gerar Word. */
export function sanitizeResume(input: unknown): ResumeData {
  const d = obj(input);
  return {
    nome: str(d.nome, 80),
    cargo: str(d.cargo, 80),
    email: str(d.email, 120),
    telefone: str(d.telefone, 30),
    cidade: str(d.cidade, 80),
    linkedin: str(d.linkedin, 120),
    resumo: str(d.resumo, 1200),
    experiencias: arr(d.experiencias, 15).map((raw) => {
      const e = obj(raw);
      return {
        id: str(e.id, 20) || uid(),
        empresa: str(e.empresa, 100),
        cargo: str(e.cargo, 100),
        inicio: str(e.inicio, 20),
        fim: str(e.fim, 20),
        atual: e.atual === true,
        atividades: str(e.atividades, 1500),
      };
    }),
    formacao: arr(d.formacao, 10).map((raw) => {
      const e = obj(raw);
      return {
        id: str(e.id, 20) || uid(),
        curso: str(e.curso, 120),
        instituicao: str(e.instituicao, 120),
        inicio: str(e.inicio, 20),
        fim: str(e.fim, 20),
      };
    }),
    cursos: arr(d.cursos, 15).map((raw) => {
      const e = obj(raw);
      return { id: str(e.id, 20) || uid(), nome: str(e.nome, 120), instituicao: str(e.instituicao, 120), ano: str(e.ano, 10) };
    }),
    idiomas: arr(d.idiomas, 8).map((raw) => {
      const e = obj(raw);
      return { id: str(e.id, 20) || uid(), idioma: str(e.idioma, 40), nivel: str(e.nivel, 40) };
    }),
    habilidades: arr(d.habilidades, 25)
      .map((h) => str(h, 40).trim())
      .filter(Boolean),
  };
}

/** Quebra o texto de atividades em linhas limpas, sem marcadores digitados à mão. */
export function bullets(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-–—•*·]+/, "").trim())
    .filter(Boolean);
}

export function periodo(inicio: string, fim: string, atual: boolean): string {
  const i = inicio.trim();
  const f = atual ? "Atual" : fim.trim();
  if (i && f) return `${i} – ${f}`;
  return i || f;
}

export function contatoLinha(d: ResumeData): string {
  return [d.email, d.telefone, d.cidade, d.linkedin].map((s) => s.trim()).filter(Boolean).join("  |  ");
}
