import { buildStoreFromTemplate } from "./templates";
import type { Product, Segment, Store } from "./types";

/**
 * Prévias do varejo (prospecção). Produtos e preços ILUSTRATIVOS;
 * horários e endereços vêm do Google Maps. WhatsApp = o da própria loja.
 */

type Item = Omit<Product, "id" | "available"> & { available?: boolean };
const withIds = (prefix: string, items: Item[]): Product[] =>
  items.map((p, i) => ({ available: true, ...p, id: `${prefix}-${i + 1}` }));

const NOW = "2026-09-29T00:00:00.000Z";

function retail(s: {
  slug: string; name: string; segment: Segment; whatsapp: string; tagline: string; address: string; hours: string;
  colors: Store["colors"]; instagram?: string; categories?: string[]; products?: Product[];
  modules?: Partial<Store["modules"]>; payment?: string[];
}): Store {
  const base = buildStoreFromTemplate({ slug: s.slug, name: s.name, segment: s.segment, whatsapp: s.whatsapp, isDemo: true, deterministicIds: true });
  return {
    ...base,
    tagline: s.tagline,
    address: s.address,
    hours: s.hours,
    instagram: s.instagram,
    colors: s.colors,
    categories: s.categories ?? base.categories,
    products: s.products ?? base.products,
    payment: s.payment ?? base.payment,
    modules: { ...base.modules, ...s.modules },
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const SIZES = { label: "Tamanho", options: ["P", "M", "G", "GG"] };
const PLUS = { label: "Tamanho", options: ["G1 (46)", "G2 (48)", "G3 (50)", "G4 (52)"] };

export function getRetailPreviews(): Store[] {
  return [
    // ===================== ROUPAS =====================
    retail({
      slug: "tassia-moda-plus",
      name: "Tássia Moda Plus",
      segment: "roupas",
      whatsapp: "5577999597065",
      tagline: "Moda plus size com estilo · enviamos para todo o Brasil",
      address: "R. Teixeira de Freitas — Centro, Santa Maria da Vitória",
      hours: "Seg a sex 8h–12h e 14h–18h30 · Sáb 8h–13h",
      colors: { primary: "#9d174d", accent: "#f9a8d4" },
      categories: ["Vestidos", "Blusas", "Calças e saias", "Conjuntos", "Acessórios"],
      modules: { delivery: { enabled: true, fee: 5, pickup: true, estimate: "Entrega na cidade · envio para todo o Brasil" } },
      products: withIds("tas", [
        { name: "Vestido midi estampado", category: "Vestidos", price: 169.9, oldPrice: 199.9, featured: true, variants: [PLUS] },
        { name: "Vestido longo liso", category: "Vestidos", price: 189.9, variants: [PLUS, { label: "Cor", options: ["Preto", "Verde", "Terracota"] }] },
        { name: "Blusa de viscose", category: "Blusas", price: 79.9, featured: true, variants: [PLUS] },
        { name: "Camisa de linho", category: "Blusas", price: 119.9, variants: [PLUS] },
        { name: "Calça pantalona", category: "Calças e saias", price: 139.9, variants: [PLUS] },
        { name: "Saia midi plissada", category: "Calças e saias", price: 109.9, variants: [PLUS] },
        { name: "Conjunto alfaiataria", category: "Conjuntos", price: 249.9, featured: true, variants: [PLUS] },
        { name: "Bolsa transversal", category: "Acessórios", price: 89.9 },
      ]),
    }),
    retail({
      slug: "sweet-girl",
      name: "Sweet Girl",
      segment: "roupas",
      whatsapp: "5577991200094",
      tagline: "Moda feminina das marcas que você ama",
      address: "R. Teixeira de Freitas, 354 — Centro, Santa Maria da Vitória",
      hours: "Seg a sex 8h–18h · Sáb 8h–13h",
      colors: { primary: "#be185d", accent: "#fbcfe8" },
      categories: ["Novidades", "Vestidos", "Blusas", "Jeans", "Acessórios"],
      products: withIds("swg", [
        { name: "Vestido curto canelado", category: "Novidades", price: 129.9, featured: true, variants: [SIZES] },
        { name: "Cropped de tricô", category: "Novidades", price: 89.9, featured: true, variants: [SIZES] },
        { name: "Vestido midi floral", category: "Vestidos", price: 159.9, variants: [SIZES] },
        { name: "Blusa ombro a ombro", category: "Blusas", price: 79.9, variants: [SIZES] },
        { name: "Body de alcinha", category: "Blusas", price: 69.9, variants: [SIZES] },
        { name: "Calça jeans wide leg", category: "Jeans", price: 179.9, featured: true, variants: [{ label: "Tamanho", options: ["36", "38", "40", "42", "44"] }] },
        { name: "Short jeans", category: "Jeans", price: 99.9, variants: [{ label: "Tamanho", options: ["36", "38", "40", "42"] }] },
        { name: "Bolsa baguete", category: "Acessórios", price: 99.9 },
      ]),
    }),
    retail({
      slug: "natienne-concept",
      name: "Natienne Concept",
      segment: "roupas",
      whatsapp: "5577991352585",
      tagline: "Moda e estilo com entrega na sua casa",
      address: "R. Nilo Peçanha — Santa Maria da Vitória",
      hours: "Seg a sáb 8h–18h",
      colors: { primary: "#1f2937", accent: "#d4a373" },
      modules: { delivery: { enabled: true, fee: 0, pickup: true, estimate: "Entregamos na cidade" } },
    }),
    retail({
      slug: "donna-ativa",
      name: "Donna Ativa",
      segment: "roupas",
      whatsapp: "5577988149446",
      tagline: "Moda fitness para treinar com conforto e estilo",
      address: "R. da Chácara, loja 01 — Centro, Correntina",
      hours: "Seg a sex 8h–18h · Sáb 8h–12h",
      colors: { primary: "#0f766e", accent: "#5eead4" },
      categories: ["Conjuntos", "Leggings", "Tops", "Shorts", "Masculino"],
      products: withIds("dna", [
        { name: "Conjunto legging + top", category: "Conjuntos", price: 149.9, oldPrice: 179.9, featured: true, variants: [SIZES, { label: "Cor", options: ["Preto", "Verde", "Rosa"] }] },
        { name: "Conjunto short + top", category: "Conjuntos", price: 119.9, featured: true, variants: [SIZES] },
        { name: "Legging cintura alta", category: "Leggings", price: 89.9, variants: [SIZES, { label: "Cor", options: ["Preto", "Marinho", "Vinho"] }] },
        { name: "Legging com bolso", category: "Leggings", price: 99.9, variants: [SIZES] },
        { name: "Top nadador", category: "Tops", price: 59.9, variants: [SIZES] },
        { name: "Short saia", category: "Shorts", price: 69.9, variants: [SIZES] },
        { name: "Camiseta dry fit masculina", category: "Masculino", price: 59.9, featured: true, variants: [SIZES] },
        { name: "Bermuda masculina de treino", category: "Masculino", price: 69.9, variants: [SIZES] },
      ]),
    }),
    retail({
      slug: "amanda-opcoes",
      name: "Amanda Opções",
      segment: "roupas",
      whatsapp: "5577988140912",
      tagline: "Opções pra todos os estilos com preço bom",
      address: "Ao lado do Mercado Municipal — Correntina",
      hours: "Seg a sex 7h30–18h · Sáb 7h30–14h",
      colors: { primary: "#6d28d9", accent: "#c4b5fd" },
      categories: ["Feminino", "Masculino", "Fitness", "Acessórios"],
    }),

    // ===================== MÓVEIS =====================
    retail({
      slug: "cerejeira-moveis",
      name: "Cerejeira Móveis",
      segment: "moveis",
      whatsapp: "5577988015516",
      instagram: "cerejeiramoveis",
      tagline: "Há mais de 30 anos realizando sonhos",
      address: "Tv. Liberdade, 7 — Centro, Correntina",
      hours: "Seg a sex 8h–18h · Sáb 8h–12h30",
      colors: { primary: "#8b1e3f", accent: "#f7b2c4" },
      categories: ["Sofás", "Quarto", "Colchões", "Eletro", "Celulares"],
      modules: { delivery: { enabled: true, fee: 0, pickup: true, estimate: "Entrega rápida e montagem cuidadosa" } },
      products: withIds("cer", [
        { name: "Sofá retrátil e reclinável 3 lugares", category: "Sofás", price: 1690, oldPrice: 1990, featured: true, variants: [{ label: "Cor", options: ["Cinza", "Marrom"] }] },
        { name: "Sofá de canto 5 lugares", category: "Sofás", price: 2290 },
        { name: "Roupeiro 6 portas", category: "Quarto", price: 1290, featured: true, variants: [{ label: "Cor", options: ["Branco", "Nogueira"] }] },
        { name: "Cama casal de madeira maciça", category: "Quarto", price: 1490 },
        { name: "Colchão casal molas ensacadas", category: "Colchões", price: 1190, featured: true },
        { name: "Colchão solteiro D33", category: "Colchões", price: 529 },
        { name: "Geladeira frost free 375 L", category: "Eletro", price: 2790 },
        { name: "Smart TV 50\" 4K", category: "Eletro", price: 2290 },
        { name: "Smartphone 128 GB", category: "Celulares", price: 1299, featured: true },
      ]),
    }),
    retail({
      slug: "comercial-ls",
      name: "Comercial LS Móveis e Elétricos",
      segment: "moveis",
      whatsapp: "5577998362183",
      tagline: "Móveis de qualidade e preço bom em Correntina",
      address: "R. da Chácara, 812 — Centro, Correntina",
      hours: "Seg a sex 8h–18h · Sáb 8h–12h",
      colors: { primary: "#1e3a8a", accent: "#fcd34d" },
    }),
    retail({
      slug: "moveis-e-cia-samavi",
      name: "Móveis & Cia SAMAVI",
      segment: "moveis",
      whatsapp: "5577991810090",
      tagline: "Produtos de qualidade para a sua casa",
      address: "R. Teixeira de Freitas, 312 — Santa Maria da Vitória",
      hours: "Seg a sex 8h–18h · Sáb 8h–12h",
      colors: { primary: "#3f3f46", accent: "#f59e0b" },
    }),

    // ===================== CONSTRUÇÃO =====================
    retail({
      slug: "construramos",
      name: "ConstruRamos",
      segment: "construcao",
      whatsapp: "5577991621000",
      tagline: "Preço, variedade e qualidade para a sua obra",
      address: "Av. Perimetral, 1450 — Centro, Santa Maria da Vitória",
      hours: "Seg a sex 7h–18h · Sáb 7h30–12h30",
      colors: { primary: "#c2410c", accent: "#fdba74" },
    }),
    retail({
      slug: "rv-materiais",
      name: "RV Materiais de Construção",
      segment: "construcao",
      whatsapp: "5577991991694",
      tagline: "Tudo para a sua obra com orçamento rápido",
      address: "R. Teixeira de Freitas, 989 — Santa Maria da Vitória",
      hours: "Seg a sex 7h–18h · Sáb 7h–13h",
      colors: { primary: "#1d4ed8", accent: "#facc15" },
    }),

    // ===================== MERCADOS =====================
    retail({
      slug: "supermercado-beda",
      name: "Supermercado Beda",
      segment: "mercado",
      whatsapp: "5577920008959",
      tagline: "Mercado completo, organizado e com bom preço",
      address: "Av. Perimetral, 66A — Santa Maria da Vitória",
      hours: "Seg a sáb 7h–19h · Dom 7h–12h",
      colors: { primary: "#15803d", accent: "#fde047" },
    }),
    retail({
      slug: "supermercado-opcao",
      name: "Supermercado Opção",
      segment: "mercado",
      whatsapp: "5577991312055",
      tagline: "Tem de tudo, perto de você",
      address: "R. Sebastião Laranjeira, 15 — Centro, Santa Maria da Vitória",
      hours: "Seg a sáb 7h–18h30 · Dom 7h–12h",
      colors: { primary: "#b91c1c", accent: "#fcd34d" },
    }),
    retail({
      slug: "supercenter-supermercado",
      name: "Supercenter Supermercado",
      segment: "mercado",
      whatsapp: "5577991296565",
      tagline: "Promoção toda sexta · preço acessível",
      address: "R. Cap. Odorico Marquês, 281 — Malvão, Santa Maria da Vitória",
      hours: "Seg a sáb 7h–19h · Dom 7h30–12h",
      colors: { primary: "#0369a1", accent: "#fbbf24" },
    }),
  ];
}
