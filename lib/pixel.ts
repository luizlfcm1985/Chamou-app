type Fbq = (acao: string, evento: string, dados?: Record<string, unknown>) => void;

/** Dispara um evento do Pixel da Meta, se estiver instalado. Nunca quebra a tela se o pixel falhar. */
export function track(evento: string, dados?: Record<string, unknown>) {
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (fbq) fbq("track", evento, dados);
  } catch {
    // sem pixel, sem problema
  }
}
