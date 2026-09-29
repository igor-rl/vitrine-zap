import { buildStoreFromTemplate } from "./templates";
import { getFoodPreviews } from "./previews-food";
import type { Store } from "./types";

/**
 * Lojas de demonstração (fictícias). Ficam no código e são usadas quando
 * não existe versão salva no Blob. O botão "Restaurar demo" no /admin
 * apaga a versão salva e volta para esta.
 *
 * O WhatsApp das demos é o SEU (DEMO_WHATSAPP): quando o lojista testar
 * o pedido na demo, a mensagem chega para você.
 */
const demoWhats = () => (process.env.DEMO_WHATSAPP || "5577999999999").replace(/\D/g, "");

export function getSeeds(): Store[] {
  return [
    buildStoreFromTemplate({
      slug: "demo-moveis",
      name: "Móveis Aroeira",
      segment: "moveis",
      whatsapp: demoWhats(),
      isDemo: true,
      deterministicIds: true,
      extra: {
        tagline: "Móveis e eletro com entrega e montagem grátis",
        instagram: "",
        address: "Rua Principal, 100 — Centro",
        hours: "Seg a sex 8h–18h · Sáb 8h–12h",
      },
    }),
    buildStoreFromTemplate({
      slug: "demo-pizzaria",
      name: "Pizzaria Brasa & Forno",
      segment: "restaurante",
      whatsapp: demoWhats(),
      isDemo: true,
      deterministicIds: true,
      extra: {
        tagline: "Pizza no forno a lenha · delivery toda noite",
        address: "Praça da Matriz, 20 — Centro",
        hours: "Todos os dias 18h–23h",
      },
    }),
    buildStoreFromTemplate({
      slug: "demo-moda",
      name: "Ateliê Flor de Lis",
      segment: "roupas",
      whatsapp: demoWhats(),
      isDemo: true,
      deterministicIds: true,
      extra: {
        tagline: "Moda feminina e fitness · enviamos para toda a região",
        address: "Rua do Comércio, 45 — Centro",
        hours: "Seg a sex 8h–18h · Sáb 8h–13h",
      },
    }),
    buildStoreFromTemplate({
      slug: "demo-mercado",
      name: "Mercadinho Bom Preço",
      segment: "mercado",
      whatsapp: demoWhats(),
      isDemo: true,
      deterministicIds: true,
      extra: {
        tagline: "Ofertas toda semana · entrega em casa",
        address: "Av. Central, 300",
        hours: "Seg a sáb 7h–20h · Dom 7h–12h",
      },
    }),
  ];
}

export const DEMO_PIN = "1234";

/**
 * Prévias personalizadas para prospecção (uma por lojista abordado).
 * Não aparecem na página inicial e não são indexadas pelo Google.
 * Preços e produtos são ilustrativos até o lojista aprovar.
 * O WhatsApp é o da própria loja: quando o dono testa, o pedido chega nele.
 */
export function getPreviews(): Store[] {
  const now = "2026-09-29T00:00:00.000Z";
  return [
    {
      ...buildStoreFromTemplate({
        slug: "comercial-jm",
        name: "Comercial JM",
        segment: "moveis",
        whatsapp: "5577991199718",
        isDemo: true,
        deterministicIds: true,
      }),
      tagline: "Móveis e eletros que transformam sua casa!",
      instagram: "comercialjmmoveis",
      address: "R. Teixeira de Freitas, 268 — Centro, Santa Maria da Vitória",
      hours: "Seg a sex 8h–18h · Sáb 8h–13h",
      colors: { primary: "#1d3557", accent: "#f4a261" },
      categories: ["Quarto", "Colchões", "Sala", "Cozinha", "Eletrodomésticos"],
      payment: ["Pix", "Cartão de crédito", "Crediário", "Dinheiro"],
      modules: {
        installments: { enabled: true, maxInstallments: 10, minInstallment: 50, interestFree: true },
        delivery: { enabled: true, fee: 0, pickup: true, estimate: "Entrega e montagem em Santa Maria e região" },
        quoteButton: true,
      },
      products: [
        { id: "jm-1", name: "Guarda-roupa casal 6 portas", category: "Quarto", price: 1399, oldPrice: 1699, available: true, featured: true,
          description: "MDF com 6 portas e 4 gavetas. Montagem inclusa.", variants: [{ label: "Cor", options: ["Branco", "Nogueira", "Freijó"] }] },
        { id: "jm-2", name: "Cama box casal + colchão", category: "Colchões", price: 1190, available: true, featured: true,
          description: "Conjunto box casal com colchão de molas ensacadas." },
        { id: "jm-3", name: "Colchão solteiro D33", category: "Colchões", price: 549, available: true },
        { id: "jm-4", name: "Cômoda 5 gavetas", category: "Quarto", price: 499, available: true, variants: [{ label: "Cor", options: ["Branco", "Nogueira"] }] },
        { id: "jm-5", name: "Sofá retrátil e reclinável 3 lugares", category: "Sala", price: 1790, oldPrice: 2090, available: true, featured: true,
          description: "Tecido suede, retrátil e reclinável.", variants: [{ label: "Cor", options: ["Cinza", "Marrom", "Bege"] }] },
        { id: "jm-6", name: "Rack com painel para TV até 55\"", category: "Sala", price: 649, available: true },
        { id: "jm-7", name: "Cozinha compacta 4 peças", category: "Cozinha", price: 1149, available: true,
          description: "Aéreo, balcão com pia, paneleiro e armário." },
        { id: "jm-8", name: "Mesa de jantar 4 cadeiras", category: "Cozinha", price: 899, available: true },
        { id: "jm-9", name: "Geladeira frost free 375 L", category: "Eletrodomésticos", price: 2799, available: true, featured: true },
        { id: "jm-10", name: "Lavadora de roupas 12 kg", category: "Eletrodomésticos", price: 1749, available: true },
        { id: "jm-11", name: "Fogão 4 bocas", category: "Eletrodomésticos", price: 899, available: true },
        { id: "jm-12", name: "Micro-ondas 20 L", category: "Eletrodomésticos", price: 549, available: true },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const getAllSeeds = (): Store[] => [...getSeeds(), ...getPreviews(), ...getFoodPreviews()];
