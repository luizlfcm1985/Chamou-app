import Legal, { contato, empresa } from "@/components/Legal";

export const metadata = { title: "Política de privacidade | Chamou" };

export default function Privacidade() {
  return (
    <Legal titulo="Política de privacidade" atualizado="30 de outubro de 2026">
      <p>
        Esta política explica como {empresa()} (controlador dos dados) trata suas informações, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
      </p>

      <h2 className="t-title">Dados que coletamos</h2>
      <ul>
        <li>E-mail, para o login por código e para identificar sua compra.</li>
        <li>O conteúdo do seu currículo (nome, contatos, experiências, formação etc.), que você mesmo digita.</li>
        <li>Textos que você cola para a análise de LinkedIn ou para a carta (descrição de vaga).</li>
        <li>Dados da compra: itens, valor, status e identificador do pagamento. Não recebemos nem guardamos dados de banco ou cartão.</li>
        <li>No serviço de revisão pessoal: o objetivo que você descreve e o seu WhatsApp.</li>
      </ul>

      <h2 className="t-title">Para que usamos</h2>
      <p>
        Para gerar o seu currículo, liberar o que você comprou, prestar o suporte e cumprir obrigações legais e fiscais. Não vendemos seus dados.
      </p>

      <h2 className="t-title">Com quem compartilhamos</h2>
      <ul>
        <li>Supabase: armazenamento da conta e do currículo.</li>
        <li>Vercel: hospedagem do site.</li>
        <li>Mercado Pago: processamento do Pix.</li>
        <li>Anthropic: apenas quando você usa um recurso de IA, enviamos o trecho necessário para gerar a resposta.</li>
        <li>Meta (Facebook/Instagram): se o site usar o Pixel de anúncios, eventos de navegação e compra (sem o conteúdo do seu currículo) podem ser enviados para medir os anúncios.</li>
      </ul>
      <p>Alguns desses provedores ficam fora do Brasil, o que pode envolver transferência internacional de dados com as garantias previstas na LGPD.</p>

      <h2 className="t-title">Por quanto tempo guardamos</h2>
      <p>
        Seu currículo e sua conta ficam guardados até você apagá-los. Registros de pagamento são mantidos pelo prazo exigido pela legislação fiscal, sem vínculo com a sua conta depois da exclusão.
      </p>

      <h2 className="t-title">Seus direitos</h2>
      <p>
        Você pode acessar, corrigir e apagar seus dados. A exclusão da conta e do currículo é feita por você no app. Para os demais pedidos (acesso, portabilidade, informação sobre compartilhamento), fale com a gente por {contato()}.
      </p>

      <h2 className="t-title">Segurança</h2>
      <p>
        O acesso aos dados é restrito por regras de segurança no banco, de modo que cada pessoa vê apenas o próprio currículo. As conexões usam HTTPS.
      </p>
    </Legal>
  );
}
