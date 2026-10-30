// Frases-modelo por área. A pessoa escolhe, ajusta e só deixa o que for verdade para ela.
export type AreaFrases = { area: string; frases: string[] };

export const FRASES: AreaFrases[] = [
  {
    area: "Administrativo",
    frases: [
      "Organizei arquivos físicos e digitais, facilitando a localização de documentos.",
      "Atendi telefone e e-mail, encaminhando demandas aos setores responsáveis.",
      "Controlei contas a pagar e a receber em planilhas, conferindo valores e vencimentos.",
      "Elaborei relatórios semanais para a gerência.",
      "Agendei reuniões e compromissos, mantendo a agenda da diretoria atualizada.",
      "Conferi notas fiscais e documentos antes do lançamento no sistema.",
    ],
  },
  {
    area: "Vendas e atendimento",
    frases: [
      "Atendi clientes presencialmente e por WhatsApp, entendendo a necessidade e indicando o produto adequado.",
      "Superei a meta mensal de vendas em ___ meses.",
      "Negociei prazos e condições, fechando vendas com margem de lucro adequada.",
      "Resolvi reclamações com agilidade, mantendo o relacionamento com o cliente.",
      "Organizei a vitrine e a reposição de produtos, deixando a loja pronta para o atendimento.",
      "Registrei vendas e trocas no sistema, conferindo o caixa no fechamento do dia.",
    ],
  },
  {
    area: "Estoque e logística",
    frases: [
      "Recebi e conferi mercadorias, comparando quantidades com a nota fiscal.",
      "Organizei o estoque por endereçamento, agilizando a separação de pedidos.",
      "Realizei inventários periódicos e apontei divergências.",
      "Separei e expedi pedidos dentro do prazo combinado.",
      "Operei empilhadeira e paleteira seguindo as normas de segurança.",
      "Registrei entradas e saídas no sistema, mantendo o estoque atualizado.",
    ],
  },
  {
    area: "Serviços gerais e limpeza",
    frases: [
      "Realizei a limpeza e a higienização de ambientes seguindo o cronograma definido.",
      "Utilizei produtos e equipamentos de limpeza com atenção às normas de segurança.",
      "Organizei materiais e controlei a reposição de insumos.",
      "Mantive os ambientes limpos e organizados durante todo o expediente.",
      "Atendi com educação clientes e colegas, respeitando horários e combinados.",
      "Conferi o estado dos ambientes ao final do turno e avisei sobre necessidades de manutenção.",
    ],
  },
  {
    area: "Tecnologia e suporte",
    frases: [
      "Prestei suporte técnico a usuários, resolvendo chamados de hardware, software e rede.",
      "Instalei e configurei computadores, impressoras e equipamentos de rede.",
      "Documentei procedimentos e soluções para reduzir chamados repetidos.",
      "Monitorei sistemas e redes, comunicando falhas à equipe responsável.",
      "Criei e ajustei consultas SQL para extrair informações de relatórios.",
      "Treinei usuários no uso de sistemas internos.",
    ],
  },
  {
    area: "Saúde e cuidados",
    frases: [
      "Auxiliei no atendimento a pacientes, seguindo os protocolos da unidade.",
      "Verifiquei sinais vitais e registrei as informações em prontuário.",
      "Organizei materiais e mantive os ambientes de atendimento higienizados.",
      "Acompanhei pacientes e familiares, orientando sobre rotinas e horários.",
      "Cumpri normas de biossegurança no manuseio de materiais e resíduos.",
      "Registrei e passei informações do plantão à equipe seguinte.",
    ],
  },
];
