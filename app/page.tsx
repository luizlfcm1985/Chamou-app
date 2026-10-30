import Link from "next/link";
import Logo from "@/components/Logo";
import { ITEMS, brl } from "@/lib/pricing";
import { TEMPLATES } from "@/lib/templates";

const FAQ = [
  {
    p: "Tem assinatura ou cobrança recorrente?",
    r: "Não. Você paga uma vez e pronto. Não pedimos cartão, não renovamos nada e não existe cobrança surpresa.",
  },
  {
    p: "Preciso pagar para montar o currículo?",
    r: "Não. Você preenche, escolhe o modelo e vê a prévia de graça. O pagamento só é pedido na hora de baixar o Word.",
  },
  {
    p: "Consigo editar o Word depois?",
    r: "Sim. O arquivo é um Word comum, que você abre e edita no celular ou no computador. E seus dados ficam salvos no Chamou para baixar de novo.",
  },
  {
    p: "Os modelos funcionam em sistemas de seleção?",
    r: "Todos têm uma coluna só, sem tabelas nem imagens, que é o formato que esses sistemas costumam ler melhor. Nenhum modelo garante entrevista ou vaga.",
  },
  {
    p: "O que acontece com meus dados?",
    r: "Seu currículo é só seu. Você pode apagar tudo a qualquer momento, dentro do app, e seus textos não são usados para treinar IA.",
  },
  {
    p: "E se eu não gostar?",
    r: "Você tem 7 dias para pedir o dinheiro de volta, sem perguntas.",
  },
];

function Mini({ id }: { id: string }) {
  return (
    <div className="mini" aria-hidden="true">
      {id === "executivo" ? <div className="band" /> : <i className="h" style={id === "classico" ? { margin: "0 auto" } : undefined} />}
      {id === "moderno" ? <i className="b" /> : null}
      <i />
      <i style={{ width: "85%" }} />
      <i className="h" style={{ width: "35%", marginTop: 6 }} />
      <i />
      <i style={{ width: "90%" }} />
      <i style={{ width: "70%" }} />
      <i className="h" style={{ width: "30%", marginTop: 6 }} />
      <i style={{ width: "80%" }} />
    </div>
  );
}

export default function Home() {
  const whats = process.env.NEXT_PUBLIC_WHATSAPP;
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <Logo />
          <Link href="/entrar" className="btn btn-secondary btn-sm">
            Entrar
          </Link>
        </div>
      </header>

      <main>
        <section className="hero wrap">
          <div className="stack-lg">
            <h1 className="t-display-xl">
              Seu currículo, pronto pra ser <span style={{ color: "var(--brand-text)" }}>chamado.</span>
            </h1>
            <p className="lead">
              Preencha pelo celular, uma linha por vez, escolha um modelo e baixe em Word. Pagamento único de{" "}
              <strong>{brl(ITEMS.base.cents)}</strong>, sem assinatura.
            </p>
            <div className="row">
              <Link href="/entrar" className="btn btn-primary">
                Criar meu currículo grátis
              </Link>
              <span className="small muted">Você só paga para baixar. Entra só com e-mail.</span>
            </div>
          </div>
        </section>

        <section className="section wrap">
          <h2 className="t-display">Três passos, sem complicação</h2>
          <div className="steps" style={{ marginTop: 24 }}>
            {[
              ["1", "Preencha", "Seus dados, experiências e cursos, linha por linha. Tem frases prontas por área para ajudar."],
              ["2", "Escolha o modelo", "Quatro modelos profissionais. Veja a prévia na hora e troque quando quiser."],
              ["3", "Baixe em Word", "Receba o arquivo diagramado, pronto para enviar ou editar no celular."],
            ].map(([n, t, d]) => (
              <div key={n} className="card stack">
                <span className="step-n">{n}</span>
                <h3 className="t-title">{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section wrap">
          <h2 className="t-display">Quatro modelos, um só objetivo</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>
            Todos em uma coluna, sem tabelas nem imagens, para ler bem em sistemas de seleção e no celular.
          </p>
          <div className="models" style={{ marginTop: 24 }}>
            {TEMPLATES.map((t) => (
              <div key={t.id} className="stack">
                <Mini id={t.id} />
                <div>
                  <p className="t-subtitle">{t.nome}</p>
                  <p className="small muted">{t.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section wrap">
          <div className="card-deep stack-lg">
            <p className="label" style={{ color: "var(--brand)" }}>
              Pagamento único
            </p>
            <p className="price">{brl(ITEMS.base.cents)}</p>
            <ul className="ul-ok">
              <li>Os 4 modelos de currículo em Word</li>
              <li>Baixe quantas vezes quiser, edite no celular</li>
              <li>Frases prontas por área e conferência de erros comuns</li>
              <li>Sem assinatura, sem renovação, sem cobrança surpresa</li>
              <li>7 dias para pedir o dinheiro de volta</li>
            </ul>
            <Link href="/entrar" className="btn btn-primary btn-block">
              Começar agora
            </Link>
          </div>
        </section>

        <section className="section wrap">
          <h2 className="t-display">Quer ir além? Escolha só o que precisa</h2>
          <div className="steps" style={{ marginTop: 24 }}>
            {(["ia", "linkedin", "pessoal"] as const).map((id) => (
              <div key={id} className="card-flat stack">
                <h3 className="t-title">{ITEMS[id].nome}</h3>
                <p className="muted small">{ITEMS[id].descricao}</p>
                <p className="t-subtitle">{brl(ITEMS[id].cents)}</p>
              </div>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Os extras são opcionais e aparecem na hora do pagamento ou dentro do app.
          </p>
        </section>

        <section className="section wrap" style={{ maxWidth: 720 }}>
          <h2 className="t-display" style={{ marginBottom: 16 }}>
            Perguntas frequentes
          </h2>
          {FAQ.map((f) => (
            <details key={f.p} className="faq">
              <summary>{f.p}</summary>
              <p>{f.r}</p>
            </details>
          ))}
        </section>

        <section className="section wrap" style={{ textAlign: "center" }}>
          <h2 className="t-display">Pronto pra ser chamado?</h2>
          <div style={{ marginTop: 24 }}>
            <Link href="/entrar" className="btn btn-primary">
              Criar meu currículo grátis
            </Link>
          </div>
        </section>
      </main>

      <footer className="site">
        <div className="wrap row between">
          <span className="muted">Chamou</span>
          <nav className="row" aria-label="Rodapé">
            <Link href="/termos">Termos de uso</Link>
            <Link href="/privacidade">Privacidade</Link>
            {whats ? (
              <a href={`https://wa.me/${whats}`} target="_blank" rel="noopener noreferrer">
                Fale conosco
              </a>
            ) : null}
          </nav>
        </div>
      </footer>
    </>
  );
}
