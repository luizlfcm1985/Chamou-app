import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import Logo from "@/components/Logo";
import PessoalForm from "./PessoalForm";

export const metadata = { title: "Revisão pessoal | Chamou" };
export const dynamic = "force-dynamic";

const ROTULO: Record<string, string> = {
  aguardando_dados: "Aguardando seus dados",
  recebido: "Recebido",
  em_producao: "Em produção",
  entregue: "Entregue",
};

export default async function Pessoal() {
  const { sb, user } = await getUser();
  if (!user) redirect("/entrar?next=/pessoal");

  const { data: pedidos } = await sb
    .from("service_orders")
    .select("id, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const aguardando = pedidos?.some((p) => p.status === "aguardando_dados") ?? false;
  const wpp = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");

  return (
    <main className="auth">
      <div className="card stack-lg" style={{ maxWidth: 560 }}>
        <Logo href="/app" />
        <h1 className="t-display" style={{ fontSize: 30 }}>
          Revisão pessoal premium
        </h1>

        {!pedidos || pedidos.length === 0 ? (
          <div className="stack">
            <p className="muted">Você ainda não contratou a revisão pessoal.</p>
            <Link className="btn btn-primary" href="/checkout?add=pessoal">
              Contratar por R$ 59,90
            </Link>
          </div>
        ) : (
          <>
            <ul className="status-steps" style={{ padding: 0, margin: 0 }}>
              {pedidos.map((p) => (
                <li key={p.id}>
                  <span className={`tag ${p.status === "entregue" ? "tag-ok" : "tag-aviso"}`}>{ROTULO[p.status] ?? p.status}</span>
                  <span className="small muted">{new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                </li>
              ))}
            </ul>
            {aguardando ? (
              <PessoalForm />
            ) : (
              <p className="muted">
                Recebemos seus dados. O especialista usa o currículo que está salvo na sua conta e entrega em até 48 horas úteis, pelo WhatsApp que você informou.
                {wpp ? (
                  <>
                    {" "}Dúvidas? <a href={`https://wa.me/${wpp}`}>Fale com a gente</a>.
                  </>
                ) : null}
              </p>
            )}
          </>
        )}
        <Link className="btn btn-ghost" href="/app">
          Voltar ao currículo
        </Link>
      </div>
    </main>
  );
}
