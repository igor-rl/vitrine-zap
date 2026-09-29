import type { Product, Segment, Store } from "./types";

const rid = () => Math.random().toString(36).slice(2, 10);

interface Template {
  label: string;
  categories: string[];
  modules: Store["modules"];
  payment: string[];
  colors: Store["colors"];
  sample: Omit<Product, "id">[];
}

export const TEMPLATES: Record<Segment, Template> = {
  moveis: {
    label: "Loja de móveis e eletro",
    categories: ["Quarto", "Sala", "Cozinha", "Eletro"],
    modules: {
      installments: { enabled: true, maxInstallments: 10, minInstallment: 50, interestFree: true },
      delivery: { enabled: true, fee: 0, pickup: true, estimate: "Entrega e montagem grátis na cidade" },
      quoteButton: true,
    },
    payment: ["Pix", "Cartão de crédito", "Crediário", "Dinheiro"],
    colors: { primary: "#7a4b2a", accent: "#e8a33d" },
    sample: [
      { name: "Guarda-roupa 6 portas", price: 1499, oldPrice: 1799, category: "Quarto", available: true, featured: true,
        description: "MDF, 6 portas e 4 gavetas. Montagem inclusa.", variants: [{ label: "Cor", options: ["Branco", "Nogueira"] }] },
      { name: "Cama box casal + colchão", price: 1290, category: "Quarto", available: true,
        description: "Conjunto box casal com colchão de molas ensacadas." },
      { name: "Sofá retrátil 3 lugares", price: 1890, oldPrice: 2190, category: "Sala", available: true, featured: true,
        description: "Retrátil e reclinável, tecido suede.", variants: [{ label: "Cor", options: ["Cinza", "Marrom"] }] },
      { name: "Rack com painel para TV até 55\"", price: 699, category: "Sala", available: true },
      { name: "Cozinha compacta 4 peças", price: 1199, category: "Cozinha", available: true,
        description: "Aéreo, balcão com pia, paneleiro e armário." },
      { name: "Geladeira frost free 375 L", price: 2899, category: "Eletro", available: true },
      { name: "Lavadora 12 kg", price: 1799, category: "Eletro", available: true },
    ],
  },
  restaurante: {
    label: "Pizzaria / restaurante / lanchonete",
    categories: ["Pizzas", "Lanches", "Porções", "Bebidas"],
    modules: {
      delivery: { enabled: true, fee: 5, freeAbove: 100, pickup: true, estimate: "40 a 60 min" },
      itemNotes: true,
    },
    payment: ["Pix", "Cartão na entrega", "Dinheiro"],
    colors: { primary: "#b3261e", accent: "#f4b400" },
    sample: [
      { name: "Pizza Calabresa", price: 49.9, category: "Pizzas", available: true, featured: true,
        description: "Molho, mussarela, calabresa e cebola.", variants: [{ label: "Tamanho", options: ["Média", "Grande"] }] },
      { name: "Pizza Frango com Catupiry", price: 54.9, category: "Pizzas", available: true,
        variants: [{ label: "Tamanho", options: ["Média", "Grande"] }] },
      { name: "Pizza Carne de Sol", price: 59.9, category: "Pizzas", available: true, featured: true,
        description: "Carne de sol desfiada, cebola roxa e requeijão.", variants: [{ label: "Tamanho", options: ["Média", "Grande"] }] },
      { name: "X-Tudo", price: 27, category: "Lanches", available: true, description: "Pão, 2 carnes, ovo, bacon, queijo, presunto e salada." },
      { name: "Batata frita 400 g", price: 22, category: "Porções", available: true },
      { name: "Refrigerante 2 L", price: 12, category: "Bebidas", available: true },
      { name: "Suco natural 500 ml", price: 9, category: "Bebidas", available: true, variants: [{ label: "Sabor", options: ["Laranja", "Maracujá", "Acerola"] }] },
    ],
  },
  roupas: {
    label: "Loja de roupas e acessórios",
    categories: ["Feminino", "Masculino", "Fitness", "Acessórios"],
    modules: {
      installments: { enabled: true, maxInstallments: 3, minInstallment: 30, interestFree: true },
      delivery: { enabled: true, fee: 5, pickup: true, estimate: "Entrega no mesmo dia" },
    },
    payment: ["Pix", "Cartão de crédito", "Dinheiro"],
    colors: { primary: "#6b2d5c", accent: "#f06292" },
    sample: [
      { name: "Vestido midi", price: 139.9, category: "Feminino", available: true, featured: true, variants: [{ label: "Tamanho", options: ["P", "M", "G"] }] },
      { name: "Calça jeans wide leg", price: 159.9, category: "Feminino", available: true, variants: [{ label: "Tamanho", options: ["36", "38", "40", "42"] }] },
      { name: "Camisa polo", price: 89.9, category: "Masculino", available: true, variants: [{ label: "Tamanho", options: ["P", "M", "G", "GG"] }] },
      { name: "Conjunto fitness", price: 119.9, category: "Fitness", available: true, featured: true, variants: [{ label: "Tamanho", options: ["P", "M", "G"] }] },
      { name: "Bolsa transversal", price: 99.9, category: "Acessórios", available: true },
    ],
  },
  mercado: {
    label: "Supermercado / mercearia",
    categories: ["Ofertas da semana", "Mercearia", "Açougue", "Hortifruti", "Bebidas"],
    modules: {
      delivery: { enabled: true, fee: 7, freeAbove: 150, pickup: true, estimate: "Entrega em até 2 h" },
      itemNotes: true,
    },
    payment: ["Pix", "Cartão na entrega", "Dinheiro"],
    colors: { primary: "#1b7f3b", accent: "#ffc107" },
    sample: [
      { name: "Arroz tipo 1 — 5 kg", price: 27.9, oldPrice: 31.9, category: "Ofertas da semana", available: true, featured: true },
      { name: "Feijão carioca — 1 kg", price: 7.49, category: "Mercearia", available: true },
      { name: "Óleo de soja 900 ml", price: 6.99, category: "Mercearia", available: true },
      { name: "Picanha (kg)", price: 69.9, category: "Açougue", available: true, description: "Peso aproximado; valor final conforme pesagem." },
      { name: "Banana prata (kg)", price: 5.99, category: "Hortifruti", available: true },
      { name: "Cerveja lata 350 ml — fardo 12", price: 39.9, oldPrice: 44.9, category: "Ofertas da semana", available: true },
    ],
  },
  construcao: {
    label: "Material de construção",
    categories: ["Básico", "Hidráulica", "Elétrica", "Acabamento"],
    modules: {
      installments: { enabled: true, maxInstallments: 6, minInstallment: 100, interestFree: true },
      delivery: { enabled: true, fee: 0, pickup: true, estimate: "Frete a combinar" },
      quoteButton: true,
    },
    payment: ["Pix", "Cartão de crédito", "Boleto", "Dinheiro"],
    colors: { primary: "#c75b12", accent: "#37474f" },
    sample: [
      { name: "Cimento CP II — 50 kg", price: 36.9, category: "Básico", available: true, featured: true },
      { name: "Areia média (m³)", price: 140, category: "Básico", available: true },
      { name: "Tubo PVC 50 mm — 6 m", price: 42, category: "Hidráulica", available: true },
      { name: "Fio flexível 2,5 mm — 100 m", price: 239, category: "Elétrica", available: true },
      { name: "Porcelanato 60×60 (m²)", price: 59.9, category: "Acabamento", available: true, variants: [{ label: "Acabamento", options: ["Polido", "Acetinado"] }] },
    ],
  },
  geral: {
    label: "Comércio em geral",
    categories: ["Destaques", "Produtos"],
    modules: { delivery: { enabled: true, fee: 5, pickup: true } },
    payment: ["Pix", "Cartão", "Dinheiro"],
    colors: { primary: "#1f3864", accent: "#4fc3f7" },
    sample: [
      { name: "Produto exemplo", price: 49.9, category: "Destaques", available: true, featured: true, description: "Troque por um produto real no painel." },
    ],
  },
};

export function buildStoreFromTemplate(input: {
  slug: string;
  name: string;
  segment: Segment;
  whatsapp: string;
  isDemo?: boolean;
  deterministicIds?: boolean; // usado nas demos (ids estáveis entre requisições)
  extra?: Partial<Store>;
}): Store {
  const t = TEMPLATES[input.segment];
  const now = new Date().toISOString();
  return {
    slug: input.slug,
    name: input.name,
    segment: input.segment,
    whatsapp: input.whatsapp,
    colors: { ...t.colors },
    payment: [...t.payment],
    categories: [...t.categories],
    modules: JSON.parse(JSON.stringify(t.modules)),
    products: t.sample.map((p, i) => ({ ...p, id: input.deterministicIds ? `${input.slug}-${i + 1}` : rid() })),
    isDemo: input.isDemo,
    createdAt: now,
    updatedAt: now,
    ...input.extra,
  };
}
