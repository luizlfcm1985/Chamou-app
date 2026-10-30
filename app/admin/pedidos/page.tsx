import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser, isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { brl } from "@/lib/pricing";
import StatusSelect from "./StatusSelect";

export const metadata = { title: "Pedidos | Chamou", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Pedidos() {
  const { user } = await getUser();
  if (!user || !isAdmin(user.email)) notFound();

  const admin = supabaseAdmin();
  const [{ data: servicos }, { data: pagos }] = await Promise.all([
    admin.from("service_orders").select("id, user_id, status, brief, whatsapp, created_at").order("created_at", { ascending: false }).limit(100),
    admin.from("orders").select("amount_cents, items, created_at").eq("status", "paid").order("created_at", { ascending: false }).limit(500),
  ]);

  const ids = [...new Set((servicos ?? []).map((s) => s.user_id).filter(Boolean))] as string[];
  const emails = new Map<string, string>();
  for (const id of ids) {
    const { data } = await admin.auth.admin.getUserById(id);
    if (data.user?.email) emails.set(id, data.user.email);
  }

  const receita = (pagos ?? []).reduce((s, o) => s + o.amount_cents, 0);

  return (
    <main className="wrap" style={{ padding: "32px 16px" }}>
      <div className="stack-lg">
        <div className="row between">
          <h1 className="t-display" style={{ fontSize: 30 }}>Pedidos</h1>
          <Link href="/app" className="btn btn-secondary btn-sm">Voltar</Link>
        </div>

        <div className="card row" style={{ gap: 32 }}>
          <div>
            <p className="label muted">Pedidos pagos</p>
            <p className="t-title">{pagos?.length ?? 0}</p>
          </div>
          <div>
            <p className="label muted">Receita bruta</p>
            <p className="t-title">{brl(receita)}</p>
          </div>
        </div>

        <div className="card" style={{ overflowX: "auto" }}>
          <h2 className="t-title" style={{ marginBottom: 12 }}>Revisão pessoal</h2>
          <table className="adm">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Pedido</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Currículo</th>
              </tr>
            </thead>
            <tbody>
              {(servicos ?? []).map((s) => {
                const fone = (s.whatsapp ?? "").replace(/\D/g, "");
                const aguardando = s.status === "aguardando_dados";
                return (
                  <tr key={s.id}>
                    <td>{new Date(s.created_at).toLocaleDateString("pt-BR")}</td>
                    <td>{s.user_id ? (emails.get(s.user_id) ?? "—") : "conta apagada"}</td>
                    <td style={{ maxWidth: 320, whiteSpace: "pre-wrap" }}>{s.brief ?? "—"}</td>
                    <td>
                      {fone ? (
                        <a href={`https://wa.me/${fone.startsWith("55") ? fone : `55${fone}`}`} target="_blank" rel="noopener noreferrer">
                          {s.whatsapp}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{aguardando ? <span className="tag tag-aviso">Aguardando dados</span> : <StatusSelect id={s.id} atual={s.status} />}</td>
                    <td>{s.user_id ? <a href={`/api/admin/docx?user=${s.user_id}`}>Baixar Word</a> : "—"}</td>
                  </tr>
                );
              })}
              {(servicos ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">Nenhum pedido ainda.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
