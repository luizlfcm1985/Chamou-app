"use client";

import { useId, type ReactNode } from "react";

type CampoProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url";
  autoComplete?: string;
  maxLength?: number;
};

export function Campo({ label, value, onChange, type = "text", placeholder, hint, inputMode, autoComplete, maxLength }: CampoProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

type AreaProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
};

export function Area({ label, value, onChange, placeholder, hint, rows = 4, maxLength }: AreaProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className="textarea"
        value={value}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function Secao({ titulo, acao, children }: { titulo: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      <div className="sec-title">
        <h2 className="t-title">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}
