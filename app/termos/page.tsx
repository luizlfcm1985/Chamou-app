import Legal, { contato, empresa } from "@/components/Legal";

export const metadata = { title: "Termos de uso | Chamou" };

export default function Termos() {
  return (
    <Legal titulo="Termos de uso" atualizado="30 de outubro de 2026">
      <p>
        O Chamou é oferecido por {empresa()}. Ao criar sua conta e usar o serviço, você concorda com estes termos.
      </p>

      <h2 className="t-title">O que o Chamou faz</h2>
      <p>
        Você preenche seus dados, escolhe um modelo e baixa o currículo em Word (.docx). O preenchimento e a prévia são gratuitos. O download do arquivo é liberado após um pagamento único, sem assinatura e sem renovação automática.
      </p>

      <h2 className="t-title">Extras opcionais</h2>
      <p>
        Carta de apresentação e usos de IA, análise de LinkedIn e revisão pessoal por um especialista são vendidos à parte. Os usos de IA são limitados à quantidade informada na compra. Se a IA falhar, o uso é devolvido automaticamente.
      </p>

      <h2 className="t-title">Conteúdo gerado por IA</h2>
      <p>
        A IA pode errar. Ela é instruída a não inventar fatos, mas você é responsável por ler, corrigir e confirmar que tudo o que consta no seu currículo e na sua carta é verdadeiro antes de enviar a qualquer empresa. O Chamou não garante entrevistas, contratação ou resultado em processos seletivos.
      </p>

      <h2 className="t-title">Pagamento e devolução</h2>
      <p>
        O pagamento é feito por Pix, processado pelo Mercado Pago. A liberação é automática após a confirmação. Se o download não funcionar ou o serviço não entregar o que foi vendido, devolvemos o valor em até 7 dias após a compra, mediante pedido por {contato()}. Para a revisão pessoal, o pedido de devolução pode ser feito antes do início da produção.
      </p>

      <h2 className="t-title">Sua conta e seu conteúdo</h2>
      <p>
        Você é o dono do conteúdo que escreve. Pode apagar sua conta e seus dados a qualquer momento dentro do app (aba “Extras”). Usos de IA e extras não utilizados não são reembolsados depois da exclusão da conta.
      </p>

      <h2 className="t-title">Uso adequado</h2>
      <p>
        Não use o serviço para criar documentos com informações falsas, para enganar terceiros, nem para tentar burlar a cobrança ou o limite de usos. Podemos suspender contas que façam isso.
      </p>

      <h2 className="t-title">Mudanças</h2>
      <p>Podemos atualizar estes termos. Mudanças relevantes serão avisadas no site. Dúvidas: {contato()}.</p>
    </Legal>
  );
}
