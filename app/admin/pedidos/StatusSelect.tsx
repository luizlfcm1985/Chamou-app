"use client";

import { useState } from "react";

const OPCOES = [
  ["recebido", "Recebido"],
  ["em_producao", "Em produção"],
  ["entregue", "Entregue"],
] as const;

export default function StatusSelect({ id, atual }: { id: string; atual: string }) {
  const [valor, setValor] = useState(atual);
  const [erro, setErro] = useState(false);

  async function mudar(novo: string) {
    const antigo = valor;
    setValor(novo);
    setErro(false);
    const res = await fetch("/api/admin/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: novo }),
    });
    if (!res.ok) {
      setValor(antigo);
      setErro(true);
    }
  }

  return (
    <>
      <select className="select" aria-label="Status do pedido" value={valor} onChange={(e) => mudar(e.target.value)}>
        {OPCOES.map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
      {erro ? <span role="alert" className="small" style={{ color: "var(--danger)" }}> Falhou</span> : null}
    </>
  );
}
