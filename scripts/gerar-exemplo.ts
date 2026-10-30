// Gera um Word de exemplo em cada modelo, para conferir o visual: npx tsx scripts/gerar-exemplo.ts
import { writeFileSync, mkdirSync } from "node:fs";
import { buildDocx } from "../lib/docx";
import { TEMPLATES } from "../lib/templates";
import type { ResumeData } from "../lib/resume";

const exemplo: ResumeData = {
  nome: "Maria Aparecida da Silva",
  cargo: "Assistente Administrativo",
  email: "maria.silva@email.com",
  telefone: "(11) 91234-5678",
  cidade: "São Paulo, SP",
  linkedin: "linkedin.com/in/mariasilva",
  resumo:
    "Assistente administrativa com 6 anos de experiência em rotinas de escritório, atendimento e controle financeiro. Busco uma oportunidade para contribuir com organização e comprometimento em uma equipe dinâmica.",
  experiencias: [
    {
      id: "a1", empresa: "Comercial Horizonte Ltda", cargo: "Assistente Administrativa", inicio: "03/2021", fim: "", atual: true,
      atividades: "Controlei contas a pagar e a receber em planilhas, conferindo valores e vencimentos.\nAtendi telefone e e-mail, encaminhando demandas aos setores responsáveis.\nElaborei relatórios semanais para a gerência.\nOrganizei arquivos físicos e digitais, facilitando a localização de documentos.",
    },
    {
      id: "a2", empresa: "Loja Primavera", cargo: "Atendente de Loja", inicio: "06/2018", fim: "02/2021", atual: false,
      atividades: "Atendi clientes presencialmente e por WhatsApp, indicando o produto adequado.\nRegistrei vendas e trocas no sistema, conferindo o caixa no fechamento do dia.",
    },
  ],
  formacao: [{ id: "f1", curso: "Ensino Médio Completo", instituicao: "E.E. Prof. João Mendes", inicio: "2014", fim: "2016" }],
  cursos: [
    { id: "c1", nome: "Excel Intermediário", instituicao: "Senac", ano: "2022" },
    { id: "c2", nome: "Atendimento ao Cliente", instituicao: "Fundação Bradesco", ano: "2020" },
  ],
  idiomas: [{ id: "i1", idioma: "Inglês", nivel: "Básico" }, { id: "i2", idioma: "Espanhol", nivel: "Básico" }],
  habilidades: ["Excel", "Atendimento ao cliente", "Organização", "Controle financeiro", "Pacote Office", "Comunicação"],
};

async function main() {
  mkdirSync("/tmp/chamou-amostras", { recursive: true });
  for (const t of TEMPLATES) {
    const buf = await buildDocx(exemplo, t.id);
    writeFileSync(`/tmp/chamou-amostras/${t.id}.docx`, buf);
    console.log("ok", t.id, buf.length, "bytes");
  }
}
main();
