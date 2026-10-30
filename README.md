# Chamou

Montador de currículo em Word. Preencher e ver a prévia é grátis; baixar o .docx custa R$ 14,90 (pagamento único, Pix). Extras opcionais: carta de apresentação + 3 usos de IA (R$ 5), análise de LinkedIn (R$ 7) e revisão pessoal por um especialista (R$ 59,90).

O currículo funciona **sem IA**. A IA só é liberada depois do pagamento e é limitada por créditos.

Stack: Next.js 15 (App Router) · Supabase (login por código no e-mail, Postgres, RLS) · Mercado Pago (Pix) · Anthropic API · docx · Vercel.

## O que existe

| Parte | Onde |
|---|---|
| Landing, login por e-mail (código de 6 dígitos) | `app/page.tsx`, `app/entrar`, `components/LoginForm.tsx` |
| Editor com salvamento automático, 4 modelos, frases prontas, conferência | `components/Editor.tsx`, `lib/templates.ts`, `lib/frases.ts`, `lib/checklist.ts` |
| Word (.docx) A4 nos 4 modelos | `lib/docx.ts` |
| Checkout Pix + webhook | `app/checkout`, `app/api/checkout`, `app/api/mp/webhook`, `lib/mp.ts` |
| IA com crédito atômico e estorno em caso de falha | `app/api/ai`, `lib/ai.ts` |
| Revisão pessoal (fila + painel) | `app/pessoal`, `app/admin/pedidos` |
| Termos e privacidade (rascunho) | `app/termos`, `app/privacidade` |
| Banco | `supabase/schema.sql` |

Preços ficam **só no servidor** (`lib/pricing.ts`). O navegador nunca informa valor.

## Deploy, passo a passo

### 1. Supabase
1. Crie um projeto em supabase.com.
2. SQL Editor → cole e rode `supabase/schema.sql`.
3. Authentication → Email Templates → **Magic Link**: troque o corpo para mostrar o código, por exemplo:
   `<h2>Seu código do Chamou</h2><p>{{ .Token }}</p>`
   (sem isso o e-mail só traz um link e o login por código não funciona).
4. Authentication → Providers → Email: deixe ligado; desligue "Confirm email" se aparecer.
5. Authentication → URL Configuration: coloque a URL do site em Site URL.
6. Para vender de verdade, configure um SMTP próprio (Resend, Brevo etc.). O envio padrão do Supabase tem limite baixo de e-mails por hora.
7. Settings → API: copie a URL, a `anon key` e a `service_role key`.

### 2. GitHub e Vercel
1. Crie um repositório e envie esta pasta (`git init && git add . && git commit -m "Chamou" && git remote add origin … && git push -u origin main`).
2. Na Vercel: Add New → Project → importe o repositório.
3. Em Environment Variables, preencha tudo de `.env.example` (veja abaixo).
4. Deploy.

### 3. Mercado Pago
1. Suas integrações → crie uma aplicação → pegue o **Access Token de produção** (`MP_ACCESS_TOKEN`).
2. Webhooks → URL: `https://SEU-DOMINIO/api/mp/webhook`, evento **Pagamentos**. Copie a **chave secreta** para `MP_WEBHOOK_SECRET`.
3. Teste primeiro com as credenciais de teste do Mercado Pago, depois troque para produção.

### 4. Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (públicas) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase, **só servidor**. Nunca coloque no navegador. |
| `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` | Mercado Pago |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | IA (padrão `claude-haiku-5-5`) |
| `NEXT_PUBLIC_SITE_URL` | URL final do site, sem barra no fim |
| `ADMIN_EMAILS` | E-mails (separados por vírgula) que acessam `/admin/pedidos` |
| `NEXT_PUBLIC_WHATSAPP` | Número com DDI e DDD, ex.: `5511912345678` |
| `NEXT_PUBLIC_META_PIXEL_ID` | Pixel da Meta (opcional) |
| `NEXT_PUBLIC_EMPRESA_NOME`, `NEXT_PUBLIC_EMPRESA_CNPJ`, `NEXT_PUBLIC_CONTATO_EMAIL` | Aparecem em Termos e Privacidade |
| `DEV_FAKE_PAYMENTS` | `1` só em teste local: gera pedido sem Pix e mostra "Simular pagamento". Ignorado na Vercel em produção. |

### 5. Testar antes de vender
1. Local: `cp .env.example .env.local`, preencha, `npm install`, `npm run dev`.
2. Com `DEV_FAKE_PAYMENTS=1`: entre, preencha, clique em baixar, "Simular pagamento", baixe o Word. Teste também os extras.
3. Em produção, faça uma compra real de R$ 14,90 com o seu próprio Pix e confira: webhook liberou o download, o pedido aparece como pago no Supabase (tabela `orders`).
4. Abra o .docx baixado no Word e no celular.
5. Para ver os 4 modelos de exemplo sem subir nada: `npx --yes tsx scripts/gerar-exemplo.ts` (gera em `/tmp/chamou-amostras`).

## Segurança, em resumo
- Cada pessoa só lê o próprio currículo (RLS no Supabase). Entitlements e pedidos só são escritos pelo servidor.
- Webhook do Mercado Pago confere a assinatura HMAC, busca o pagamento de novo na API e compara o valor antes de liberar. Liberar é idempotente.
- Crédito de IA é gasto no banco antes da chamada e devolvido se a IA falhar.
- A IA é instruída a não inventar fatos e a usar `___` onde falta informação.
- Limite de tamanho nos textos e freio simples de pedidos repetidos.

## Antes de vender: confirme você mesmo
- **Prazo de devolução (7 dias)**: está nos Termos e na landing. Ajuste ao que você quer oferecer.
- **Termos e Privacidade** são rascunhos. Peça revisão a um advogado (LGPD).
- **Nome "Chamou"**: consulte disponibilidade no INPI e registre o domínio.
- **Promessas sobre IA**: o texto não afirma que os dados "não treinam modelos". Confira os termos do provedor antes de escrever isso.
- **Custo da IA**: o modelo é barato, mas acompanhe o uso no painel da Anthropic nas primeiras semanas.

## Próximas fases (ainda não feitas)
- Importar currículo existente (.docx/PDF) para preencher o editor.
- API de Conversões da Meta (mais precisão nos anúncios).
- Lembrete por e-mail/WhatsApp para quem preencheu e não pagou.
- Envio de arquivo no serviço de revisão pessoal.
- Corretor ortográfico em português.
