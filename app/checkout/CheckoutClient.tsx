"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { ITEMS, brl, totalCents, type ItemId } from "@/lib/pricing";
import { track } from "@/lib/pixel";

type Pix = { orderId: string; amountCents: number; qrCode?: string; qrBase64?: string; ticketUrl?: string; teste?: boolean };

const EXTRAS: ItemId[] = ["ia", "linkedin", "pessoal"];

export default function CheckoutClient({
  jaTemBase,
  preSelecionados,
  testeAtivo,
}: {
  jaTemBase: boolean;
  preSelecionados: ItemId[];
  testeAtivo: boolean;
}) {
  const [extras, setExtras] = useState<ItemId[]>(preSelecionados);
  const [pix, setPix] = useState<Pix | null>(null);
  const [itensDoPedido, setItensDoPedido] = useState<ItemId[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [pago, setPago] = useState(false);
  const parar = useRef(false);

  const itens = useMemo<ItemId[]>(() => (jaTemBase ? extras : ["base", ...extras]), [jaTemBase, extras]);
  const total = totalCents(itens);

  function alternar(id: ItemId) {
    setExtras((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  }

  async function gerar() {
    if (itens.length === 0) {
      setErro("Escolha ao menos um item.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itens }),
      });
      const j = (await res.json().catch(() => ({}))) as Pix & { erro?: string };
      if (!res.ok) {
        setErro(j.erro ?? "Não foi possível gerar o Pix. Tente de novo.");
        return;
      }
      setItensDoPedido(itens);
      setPix(j);
      track("InitiateCheckout", { value: j.amountCents / 100, currency: "BRL" });
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  // Confere o pagamento a cada 3 segundos enquanto o Pix está na tela.
  useEffect(() => {
    if (!pix || pago) return;
    parar.current = false;
    const id = pix.orderId;
    const valor = pix.amountCents / 100;
    const destino = itensDoPedido.includes("pessoal") ? "/pessoal" : "/app?pago=1";
    const timer = setInterval(async () => {
      if (parar.current) return;
      try {
        const res = await fetch(`/api/order/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as { status?: string };
        if (j.status === "paid") {
          parar.current = true;
          setPago(true);
          track("Purchase", { value: valor, currency: "BRL" });
          setTimeout(() => {
            window.location.href = destino;
          }, 1800);
        }
      } catch {
        // tenta de novo no próximo ciclo
      }
    }, 3000);
    return () => {
      parar.current = true;
      clearInterval(timer);
    };
  }, [pix, pago, itensDoPedido]);

  async function simular() {
    if (!pix) return;
    await fetch("/api/dev/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: pix.orderId }),
    });
  }

  async function copiar() {
    if (!pix?.qrCode) return;
    try {
      await navigator.clipboard.writeText(pix.qrCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErro("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  }

  return (
    <main className="auth">
      <div className="card stack-lg" style={{ maxWidth: 560 }}>
        <Logo href="/app" />

        {pago ? (
          <div className="stack" role="status">
            <h1 className="t-display" style={{ fontSize: 30 }}>
              Pagamento confirmado
            </h1>
            <p className="muted">Estamos liberando tudo. Você será levado de volta em instantes.</p>
          </div>
        ) : pix ? (
          <div className="stack-lg">
            <div className="stack">
              <h1 className="t-display" style={{ fontSize: 30 }}>
                Pague {brl(pix.amountCents)} no Pix
              </h1>
              <p className="muted">Abra o app do seu banco, escolha Pix e pague com o QR Code ou com o código copia e cola. A liberação é automática.</p>
            </div>

            {pix.teste ? (
              <div className="alert alert-erro" role="status">
                <p>Modo de teste: nenhum Pix real foi gerado.</p>
                {testeAtivo ? (
                  <button className="btn btn-secondary btn-sm" type="button" onClick={simular} style={{ marginTop: 8 }}>
                    Simular pagamento
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                {pix.qrBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="qr" alt="QR Code do Pix" src={`data:image/png;base64,${pix.qrBase64}`} />
                ) : null}
                <div className="stack">
                  <p className="label">Pix copia e cola</p>
                  <p className="code" tabIndex={0}>
                    {pix.qrCode}
                  </p>
                  <button className="btn btn-primary btn-block" type="button" onClick={copiar}>
                    {copiado ? "Código copiado" : "Copiar código Pix"}
                  </button>
                </div>
              </>
            )}

            {erro ? (
              <p className="alert alert-erro" role="alert">
                {erro}
              </p>
            ) : null}

            <ul className="status-steps" style={{ padding: 0, margin: 0 }} aria-live="polite">
              <li>
                <span className="tag tag-aviso">Aguardando</span> Esperando o pagamento
              </li>
            </ul>
            <p className="caption muted">
              Já pagou e nada mudou? Aguarde até 1 minuto. Se continuar, fale com a gente pelo WhatsApp no rodapé do site.
            </p>
            <button className="btn btn-ghost" type="button" onClick={() => setPix(null)}>
              Voltar e alterar itens
            </button>
          </div>
        ) : (
          <div className="stack-lg">
            <div className="stack">
              <h1 className="t-display" style={{ fontSize: 30 }}>
                {jaTemBase ? "Adicionar extras" : "Liberar seu currículo"}
              </h1>
              <p className="muted">Pagamento único por Pix. Sem assinatura e sem renovação.</p>
            </div>

            {!jaTemBase ? (
              <div className="bump fixed">
                <span aria-hidden="true" style={{ fontSize: 22 }}>✓</span>
                <div className="stack" style={{ gap: 4 }}>
                  <strong>{ITEMS.base.nome}</strong>
                  <span className="small muted">{ITEMS.base.descricao}</span>
                </div>
                <span className="p">{brl(ITEMS.base.cents)}</span>
              </div>
            ) : null}

            <p className="label">Quer turbinar? (opcional)</p>
            {EXTRAS.map((id) => (
              <label className="bump" key={id}>
                <input type="checkbox" checked={extras.includes(id)} onChange={() => alternar(id)} />
                <div className="stack" style={{ gap: 4 }}>
                  <strong>{ITEMS[id].nome}</strong>
                  <span className="small muted">{ITEMS[id].descricao}</span>
                </div>
                <span className="p">{brl(ITEMS[id].cents)}</span>
              </label>
            ))}

            <div className="row between" style={{ borderTop: "2px solid var(--line)", paddingTop: 16 }}>
              <span className="t-title">Total</span>
              <span className="t-title">{brl(total)}</span>
            </div>

            {erro ? (
              <p className="alert alert-erro" role="alert">
                {erro}
              </p>
            ) : null}

            <button className="btn btn-primary btn-block" type="button" onClick={gerar} disabled={carregando || itens.length === 0}>
              {carregando ? "Gerando Pix…" : `Gerar Pix de ${brl(total)}`}
            </button>
            <p className="caption muted">
              Devolvemos seu dinheiro em até 7 dias se o download não funcionar. Leia os <Link href="/termos">Termos</Link>.
            </p>
            <Link href="/app" className="btn btn-ghost">
              Voltar ao currículo
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
