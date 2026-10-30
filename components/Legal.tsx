import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "./Logo";

export function empresa(): string {
  const nome = process.env.NEXT_PUBLIC_EMPRESA_NOME?.trim();
  const cnpj = process.env.NEXT_PUBLIC_EMPRESA_CNPJ?.trim();
  if (nome && cnpj) return `${nome}, CNPJ ${cnpj}`;
  if (nome) return nome;
  return "Chamou";
}

export function contato(): ReactNode {
  const w = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");
  const email = process.env.NEXT_PUBLIC_CONTATO_EMAIL?.trim();
  return (
    <>
      {w ? <a href={`https://wa.me/${w}`}>WhatsApp</a> : null}
      {w && email ? " ou " : null}
      {email ? <a href={`mailto:${email}`}>{email}</a> : null}
      {!w && !email ? "os canais de contato indicados no site" : null}
    </>
  );
}

export default function Legal({ titulo, atualizado, children }: { titulo: string; atualizado: string; children: ReactNode }) {
  return (
    <main className="wrap" style={{ maxWidth: 720, padding: "32px 16px 64px" }}>
      <div className="stack-lg">
        <Logo />
        <div className="stack">
          <h1 className="t-display" style={{ fontSize: 34 }}>{titulo}</h1>
          <p className="small muted">Atualizado em {atualizado}</p>
        </div>
        <div className="stack">{children}</div>
        <Link href="/" className="btn btn-secondary">Voltar ao início</Link>
      </div>
    </main>
  );
}
