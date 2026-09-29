# Vitrine Zap — V1 (prospecção)

Catálogo online multi-loja com pedido direto no WhatsApp. Cada loja é um JSON.
Feito para rodar **de graça na Vercel** durante a prospecção.

## O que tem

| Rota | O que é |
|---|---|
| `/` | Sua página de apresentação, com as 4 lojas de demonstração |
| `/demo-moveis`, `/demo-pizzaria`, `/demo-moda`, `/demo-mercado` | Demos fictícias (pedidos chegam no **seu** WhatsApp) |
| `/<loja>` | Vitrine da loja: busca, categorias, variações, parcelas, carrinho, entrega/retirada, pedido pronto no WhatsApp |
| `/admin` | Seu painel geral (senha mestra): cria loja a partir de modelo e lista todas |
| `/admin/<loja>` | Painel do lojista (PIN): produtos, fotos, preços, entrega, pagamento, QR code |
| `/api/stores`, `/api/stores/<loja>`, `/api/upload` | API: lê e salva o JSON da loja; envia fotos |

Modelos prontos: móveis, restaurante/pizzaria, roupas, supermercado, material de construção e geral.

## Onde os dados ficam

- **Vercel:** `stores/<loja>.json` no **Vercel Blob** (e fotos em `images/<loja>/`).
  O disco da Vercel é somente leitura, então a API não pode gravar arquivo local lá.
- **Local (`npm run dev`):** sem `BLOB_READ_WRITE_TOKEN`, grava em `.data/stores/*.json` e `public/uploads/`.
- As demos vivem no código (`lib/seeds.ts`). Se alguém editar uma demo, o botão
  **Restaurar** em `/admin` volta ao original.

## Deploy na Vercel (≈10 min, custo zero)

1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel: **Add New → Project →** importe o repositório (Next.js é detectado sozinho).
3. Em **Settings → Environment Variables**, crie (veja `.env.example`):
   - `ADMIN_PASSWORD` — sua senha mestra
   - `ADMIN_SECRET` — texto aleatório longo (protege os PINs)
   - `DEMO_WHATSAPP` — seu número, ex.: `5577999999999`
   - `NEXT_PUBLIC_BRAND_NAME` — nome da sua marca
   - `NEXT_PUBLIC_BRAND_WHATSAPP` — seu número (link “quero uma assim” no rodapé)
4. Em **Storage → Create → Blob**, crie um Blob Store **público** e conecte ao projeto.
   Isso cria o `BLOB_READ_WRITE_TOKEN` sozinho.
5. **Redeploy** (as variáveis `NEXT_PUBLIC_*` entram no build).

Pronto: `https://seu-projeto.vercel.app/demo-moveis`.

## Fluxo de venda

1. Mostre uma demo do segmento do cliente no celular. Peça para ele fazer um pedido:
   a mensagem chega no seu WhatsApp. Abra `/admin/demo-moveis` (PIN **1234**) e troque um preço na frente dele.
2. Fechou? Em `/admin` → **Nova loja**: nome, link, segmento, WhatsApp da loja e um PIN.
   A loja nasce com produtos de exemplo do segmento.
3. Entre no painel da loja, troque os produtos pelos dele (fotos do Instagram dele, com autorização),
   e na aba **Divulgar** baixe o QR code e copie a mensagem para os clientes.
4. Entregue ao lojista: link da loja, link do painel (`/admin/<loja>`) e o PIN.

## Limites conscientes da V1 (resolver na etapa 2)

- Um JSON por loja: ótimo para dezenas de lojas; edição simultânea no mesmo segundo sobrescreve.
- O plano Hobby (grátis) da Vercel é, pelos termos, para uso pessoal e não comercial. Para a fase de
  testes e demos serve, mas ao ter clientes pagantes migre para o plano Pro ou para a VPS da etapa 2
  (Postgres + Docker).
- Sem domínio próprio por loja (subdomínio/domínio fica para a etapa 2).
- Cota gratuita do Blob é limitada: fotos são reduzidas no celular (máx. 1200 px) antes do envio.

## Rodar local

```bash
cp .env.example .env.local   # edite os valores
npm install
npm run dev                  # http://localhost:3000
```
