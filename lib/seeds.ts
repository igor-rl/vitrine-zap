import { buildStoreFromTemplate } from "./templates";
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
