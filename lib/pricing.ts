export type ItemId = "base" | "ia" | "linkedin" | "pessoal";

export type Item = {
  id: ItemId;
  nome: string;
  descricao: string;
  cents: number;
};

// Preços definidos aqui, no servidor. O valor cobrado NUNCA vem do navegador.
export const ITEMS: Record<ItemId, Item> = {
  base: {
    id: "base",
    nome: "Baixar seu currículo em Word",
    descricao: "Pagamento único, sem assinatura. Baixe quantas vezes quiser, nos 4 modelos.",
    cents: 1490,
  },
  ia: {
    id: "ia",
    nome: "Carta de apresentação + 3 usos de IA",
    descricao: "Uma carta curta feita a partir do seu currículo, mais 3 usos de IA para melhorar qualquer trecho.",
    cents: 500,
  },
  linkedin: {
    id: "linkedin",
    nome: "Análise do seu LinkedIn",
    descricao: "Cole seu perfil e receba título, resumo e palavras-chave sugeridos.",
    cents: 700,
  },
  pessoal: {
    id: "pessoal",
    nome: "Revisão pessoal premium",
    descricao:
      "Um especialista reescreve seu currículo, otimiza as palavras-chave do seu LinkedIn e escreve sua carta de apresentação. Entrega em até 48 horas úteis.",
    cents: 5990,
  },
};

export const IA_CREDITS = 3;
export const COVER_CREDITS = 1;
export const LINKEDIN_CREDITS = 1;

export function isItemId(x: unknown): x is ItemId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(ITEMS, x);
}

export function totalCents(ids: ItemId[]): number {
  return ids.reduce((sum, id) => sum + ITEMS[id].cents, 0);
}

export function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
