"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import Logo from "./Logo";

const TAMANHO = 6;

export default function LoginForm({ destino }: { destino: string }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [digitos, setDigitos] = useState<string[]>(Array(TAMANHO).fill(""));
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [espera, setEspera] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function enviarCodigo(e?: React.FormEvent) {
    e?.preventDefault();
    const limpo = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpo)) {
      setErro("Digite um e-mail válido.");
      return;
    }
    setErro("");
    setCarregando(true);
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: limpo, options: { shouldCreateUser: true } });
    setCarregando(false);
    if (error) {
      setErro(
        /rate|seconds|many/i.test(error.message)
          ? "Você pediu um código há pouco. Aguarde um minuto e tente de novo."
          : "Não foi possível enviar o código. Confira o e-mail e tente de novo.",
      );
      return;
    }
    setEmail(limpo);
    setEtapa("codigo");
    setEspera(45);
    setDigitos(Array(TAMANHO).fill(""));
    setTimeout(() => refs.current[0]?.focus(), 50);
  }

  async function confirmar(lista: string[]) {
    const token = lista.join("");
    if (token.length !== TAMANHO) return;
    setCarregando(true);
    setErro("");
    const { error } = await supabaseBrowser().auth.verifyOtp({ email, token, type: "email" });
    if (error) {
      setCarregando(false);
      setErro("O código não confere ou já venceu. Confira o e-mail e tente de novo.");
      return;
    }
    router.replace(destino);
    router.refresh();
  }

  function mudar(i: number, valor: string) {
    const so = valor.replace(/\D/g, "");
    if (!so) {
      const novo = [...digitos];
      novo[i] = "";
      setDigitos(novo);
      return;
    }
    // colar vários dígitos de uma vez
    const novo = [...digitos];
    so.slice(0, TAMANHO - i)
      .split("")
      .forEach((d, k) => (novo[i + k] = d));
    setDigitos(novo);
    const prox = Math.min(i + so.length, TAMANHO - 1);
    refs.current[prox]?.focus();
    if (novo.every(Boolean)) confirmar(novo);
  }

  function tecla(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digitos[i] && i > 0) refs.current[i - 1]?.focus();
  }

  return (
    <main className="auth">
      <div className="card stack-lg">
        <Logo />
        {etapa === "email" ? (
          <form className="stack-lg" onSubmit={enviarCodigo} noValidate>
            <div className="stack">
              <h1 className="t-display" style={{ fontSize: 30 }}>
                Entre só com o e-mail
              </h1>
              <p className="muted">Sem senha. Enviamos um código de 6 dígitos para você.</p>
            </div>
            <div className="field">
              <label htmlFor="email">Seu e-mail</label>
              <input
                id="email"
                className="input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            {erro ? (
              <p className="alert alert-erro" role="alert">
                {erro}
              </p>
            ) : null}
            <button className="btn btn-primary btn-block" type="submit" disabled={carregando}>
              {carregando ? "Enviando…" : "Receber código"}
            </button>
            <p className="caption muted">
              Ao continuar, você concorda com os <Link href="/termos">Termos de uso</Link> e a{" "}
              <Link href="/privacidade">Política de privacidade</Link>.
            </p>
          </form>
        ) : (
          <div className="stack-lg">
            <div className="stack">
              <h1 className="t-display" style={{ fontSize: 30 }}>
                Digite o código
              </h1>
              <p className="muted">
                Enviamos para <strong style={{ color: "var(--ink)" }}>{email}</strong>. Olhe também a caixa de spam.
              </p>
            </div>
            <div className={`cells${erro ? " err" : ""}`}>
              {digitos.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  value={d}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={TAMANHO}
                  aria-label={`Dígito ${i + 1}`}
                  onChange={(e) => mudar(i, e.target.value)}
                  onKeyDown={(e) => tecla(i, e)}
                  disabled={carregando}
                />
              ))}
            </div>
            {erro ? (
              <p className="alert alert-erro" role="alert">
                {erro}
              </p>
            ) : null}
            {carregando ? <p className="muted" style={{ textAlign: "center" }}>Entrando…</p> : null}
            <div className="row between">
              <button className="btn btn-ghost" type="button" onClick={() => enviarCodigo()} disabled={espera > 0 || carregando}>
                {espera > 0 ? `Reenviar código em ${espera}s` : "Reenviar código"}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setEtapa("email");
                  setErro("");
                }}
              >
                Trocar e-mail
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
