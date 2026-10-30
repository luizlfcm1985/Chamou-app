"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Area, Campo } from "@/components/ui";

export default function PessoalForm() {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/pessoal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, whatsapp }),
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) return setErro(j.erro ?? "Não foi possível enviar.");
      router.refresh();
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="stack-lg" onSubmit={enviar}>
      <p className="muted">
        Antes de começar, preencha o currículo no app (o especialista parte dele) e conte aqui o que você busca.
      </p>
      <Area
        label="Qual vaga ou área você quer? Alguma vaga específica?"
        value={brief}
        onChange={setBrief}
        rows={6}
        maxLength={3000}
        hint="Se tiver o link ou o texto de uma vaga, cole aqui."
      />
      <Campo label="WhatsApp para a entrega" value={whatsapp} onChange={setWhatsapp} type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 91234-5678" />
      {erro ? (
        <p className="alert alert-erro" role="alert">
          {erro}
        </p>
      ) : null}
      <button className="btn btn-primary btn-block" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar para o especialista"}
      </button>
    </form>
  );
}
