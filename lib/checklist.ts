import { bullets, type ResumeData } from "./resume";

export type Aviso = { nivel: "erro" | "aviso" | "ok"; texto: string };

const ABERTURAS_FRACAS = [
  "responsável por",
  "responsavel por",
  "fui responsável",
  "fui responsavel",
  "auxiliava",
  "ajudava",
  "trabalhava com",
  "trabalhei com",
  "função de",
  "funcao de",
];

export const VERBOS_DE_ACAO = [
  "Organizei", "Atendi", "Conduzi", "Implantei", "Reduzi", "Aumentei", "Controlei", "Coordenei",
  "Negociei", "Elaborei", "Treinei", "Planejei", "Resolvi", "Monitorei", "Registrei", "Vendi",
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Verificações por regra, sem IA. Rodam no navegador, na hora, e são grátis. */
export function verificar(d: ResumeData): Aviso[] {
  const r: Aviso[] = [];

  if (!d.nome.trim()) r.push({ nivel: "erro", texto: "Falta o seu nome." });
  if (!d.email.trim()) r.push({ nivel: "erro", texto: "Falta o e-mail." });
  else if (!EMAIL.test(d.email.trim())) r.push({ nivel: "erro", texto: "O e-mail parece estar incompleto." });
  if (!d.telefone.trim()) r.push({ nivel: "erro", texto: "Falta um telefone com DDD (de preferência com WhatsApp)." });
  if (!d.cidade.trim()) r.push({ nivel: "aviso", texto: "Informe cidade e estado: recrutadores filtram por região." });
  if (!d.cargo.trim()) r.push({ nivel: "aviso", texto: "Escreva o cargo que você busca logo abaixo do nome." });

  const n = d.resumo.trim().length;
  if (n === 0) r.push({ nivel: "aviso", texto: "Falta o resumo profissional: 2 a 4 linhas sobre você e o que busca." });
  else if (n < 150) r.push({ nivel: "aviso", texto: "O resumo está curto. Tente de 2 a 4 linhas." });
  else if (n > 700) r.push({ nivel: "aviso", texto: "O resumo está longo. Deixe em até 4 linhas." });

  const exps = d.experiencias.filter((e) => e.cargo.trim() || e.empresa.trim());
  if (exps.length === 0) {
    r.push({ nivel: "aviso", texto: "Sem experiência? Cursos, trabalhos voluntários e estágios entram em Cursos e Resumo." });
  }
  exps.forEach((e, i) => {
    const nome = e.cargo.trim() || e.empresa.trim() || `Experiência ${i + 1}`;
    if (!e.inicio.trim()) r.push({ nivel: "aviso", texto: `${nome}: informe quando começou (ex.: 03/2021).` });
    if (!e.atual && !e.fim.trim()) r.push({ nivel: "aviso", texto: `${nome}: informe quando terminou ou marque "Trabalho aqui atualmente".` });
    const linhas = bullets(e.atividades);
    if (linhas.length === 0) r.push({ nivel: "aviso", texto: `${nome}: descreva o que você fazia, uma atividade por linha.` });
    if (linhas.length > 7) r.push({ nivel: "aviso", texto: `${nome}: muitas atividades. Fique com as 4 a 6 mais importantes.` });
    linhas.forEach((l) => {
      const baixa = l.toLowerCase();
      if (ABERTURAS_FRACAS.some((a) => baixa.startsWith(a))) {
        r.push({ nivel: "aviso", texto: `"${l.slice(0, 40)}…" fica mais forte começando com um verbo de ação (ex.: Organizei, Atendi, Reduzi).` });
      }
      if (l.length > 220) r.push({ nivel: "aviso", texto: `Uma atividade em ${nome} está muito longa. Divida em duas linhas.` });
    });
  });

  if (d.habilidades.length < 5) r.push({ nivel: "aviso", texto: "Liste ao menos 5 habilidades ligadas à vaga." });
  if (d.formacao.filter((f) => f.curso.trim()).length === 0) {
    r.push({ nivel: "aviso", texto: "Informe sua formação, mesmo que seja ensino médio completo." });
  }

  if (r.length === 0) r.push({ nivel: "ok", texto: "Tudo certo por aqui. Releia uma última vez procurando erros de digitação." });
  return r;
}
