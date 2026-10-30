import crypto from "node:crypto";
import { siteUrl } from "./auth";

const MP = "https://api.mercadopago.com";

function headers(extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export type PixCriado = { paymentId: string; qrCode: string; qrBase64: string; ticketUrl: string };

/** Cria uma cobrança Pix. O valor é calculado no servidor; o orderId é a referência externa. */
export async function criarPix(opts: { orderId: string; cents: number; email: string; descricao: string }): Promise<PixCriado> {
  const res = await fetch(`${MP}/v1/payments`, {
    method: "POST",
    headers: headers({ "X-Idempotency-Key": opts.orderId }),
    body: JSON.stringify({
      transaction_amount: Math.round(opts.cents) / 100,
      description: opts.descricao.slice(0, 200),
      payment_method_id: "pix",
      payer: { email: opts.email },
      external_reference: opts.orderId,
      notification_url: `${siteUrl()}/api/mp/webhook`,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, any>;
  if (!res.ok) {
    throw new Error(`Mercado Pago recusou a cobrança (${res.status}): ${JSON.stringify(json).slice(0, 300)}`);
  }
  const td = json.point_of_interaction?.transaction_data ?? {};
  if (!td.qr_code) throw new Error("Mercado Pago não devolveu o código Pix.");
  return {
    paymentId: String(json.id),
    qrCode: String(td.qr_code),
    qrBase64: String(td.qr_code_base64 ?? ""),
    ticketUrl: String(td.ticket_url ?? ""),
  };
}

export type Pagamento = { id: string; status: string; amountCents: number; orderId: string | null };

export async function buscarPagamento(id: string): Promise<Pagamento> {
  const res = await fetch(`${MP}/v1/payments/${encodeURIComponent(id)}`, { headers: headers(), cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as Record<string, any>;
  if (!res.ok) throw new Error(`Falha ao consultar pagamento ${id} (${res.status}).`);
  return {
    id: String(json.id),
    status: String(json.status),
    amountCents: Math.round(Number(json.transaction_amount) * 100),
    orderId: json.external_reference ? String(json.external_reference) : null,
  };
}

/**
 * Confere a assinatura do webhook (cabeçalho x-signature).
 * Modelo do Mercado Pago: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" assinado com HMAC-SHA256.
 */
export function assinaturaValida(opts: { signature: string | null; requestId: string | null; dataId: string | null }): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !opts.signature || !opts.dataId) return false;

  const partes: Record<string, string> = {};
  for (const p of opts.signature.split(",")) {
    const i = p.indexOf("=");
    if (i > 0) partes[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  }
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  const id = /^[a-z0-9]+$/i.test(opts.dataId) ? opts.dataId.toLowerCase() : opts.dataId;
  let manifesto = `id:${id};`;
  if (opts.requestId) manifesto += `request-id:${opts.requestId};`;
  manifesto += `ts:${ts};`;

  const esperado = crypto.createHmac("sha256", secret).update(manifesto).digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
