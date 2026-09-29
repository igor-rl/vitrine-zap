import type { DeliveryModule, Product, Store } from "./types";

/**
 * Prévias de lanchonetes e pizzarias (prospecção).
 * Cardápios e preços são ILUSTRATIVOS; horários e endereços vêm do Google Maps.
 */

type Item = Omit<Product, "id" | "available"> & { available?: boolean };
const withIds = (prefix: string, items: Item[]): Product[] =>
  items.map((p, i) => ({ available: true, ...p, id: `${prefix}-${i + 1}` }));

const NOW = "2026-09-29T00:00:00.000Z";
const FOOD_PAYMENT = ["Pix", "Cartão na entrega", "Dinheiro"];

function foodStore(s: {
  slug: string; name: string; whatsapp: string; tagline: string; address: string; hours?: string;
  colors: Store["colors"]; icon: string; categories: string[]; products: Product[];
  delivery?: Partial<DeliveryModule>; instagram?: string;
}): Store {
  return {
    slug: s.slug,
    name: s.name,
    segment: "restaurante",
    icon: s.icon,
    tagline: s.tagline,
    whatsapp: s.whatsapp,
    instagram: s.instagram,
    address: s.address,
    hours: s.hours,
    colors: s.colors,
    payment: FOOD_PAYMENT,
    categories: s.categories,
    products: s.products,
    modules: {
      delivery: { enabled: true, fee: 5, pickup: true, estimate: "40 a 60 min", ...s.delivery },
      itemNotes: true,
    },
    isDemo: true,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

// ---------- Cardápios base ----------

const burgerMenu = (extra: Item[] = []): Item[] => [
  { name: "Smash Clássico", category: "Hambúrgueres", price: 22, featured: true,
    description: "Pão brioche, 2 smash 90 g, cheddar e molho da casa." },
  { name: "X-Bacon", category: "Hambúrgueres", price: 27, featured: true,
    description: "Pão, blend 150 g, bacon crocante, queijo e salada.", variants: [{ label: "Ponto da carne", options: ["Ao ponto", "Bem passado"] }] },
  { name: "X-Tudo", category: "Hambúrgueres", price: 32,
    description: "Pão, 2 carnes, ovo, bacon, presunto, queijo, milho e salada." },
  { name: "Frango Crispy", category: "Hambúrgueres", price: 25,
    description: "Filé de frango empanado, queijo, alface e maionese temperada." },
  { name: "Combo: burger + fritas + refri", category: "Combos", price: 36, featured: true,
    description: "Qualquer hambúrguer clássico + batata individual + refrigerante lata.",
    variants: [{ label: "Hambúrguer", options: ["Smash Clássico", "X-Bacon", "Frango Crispy"] }, { label: "Refri", options: ["Coca-Cola", "Guaraná"] }] },
  { name: "Batata frita 400 g", category: "Porções", price: 22, variants: [{ label: "Cobertura", options: ["Tradicional", "Cheddar e bacon (+ na loja)"] }] },
  { name: "Onion rings", category: "Porções", price: 20 },
  ...extra,
  { name: "Refrigerante lata", category: "Bebidas", price: 6, variants: [{ label: "Sabor", options: ["Coca-Cola", "Coca Zero", "Guaraná"] }] },
  { name: "Refrigerante 2 L", category: "Bebidas", price: 13 },
  { name: "Suco natural 500 ml", category: "Bebidas", price: 9, variants: [{ label: "Sabor", options: ["Laranja", "Maracujá", "Acerola"] }] },
];

const PIZZA_FLAVORS = ["Calabresa", "Mussarela", "Frango c/ Catupiry", "Portuguesa", "Carne de Sol", "Quatro Queijos"];
const pizza = (name: string, price: number, description: string, featured = false, flavors = PIZZA_FLAVORS): Item => ({
  name: `Pizza ${name}`, category: "Pizzas", price, description, featured,
  variants: [
    { label: "Tamanho", options: ["Média (6 fatias)", "Grande (8 fatias)"] },
    { label: "Meio a meio", options: ["Inteira", ...flavors.filter((f) => f !== name).map((f) => `½ ${f}`)] },
  ],
});
const pizzaMenu = (flavors = PIZZA_FLAVORS, extra: Item[] = []): Item[] => [
  pizza("Calabresa", 45, "Molho, mussarela, calabresa e cebola.", true, flavors),
  pizza("Mussarela", 42, "Molho, mussarela, tomate e orégano.", false, flavors),
  pizza("Frango c/ Catupiry", 50, "Frango desfiado temperado e catupiry.", true, flavors),
  pizza("Portuguesa", 52, "Presunto, ovo, cebola, azeitona e mussarela.", false, flavors),
  pizza("Carne de Sol", 58, "Carne de sol desfiada, cebola roxa e requeijão.", true, flavors),
  pizza("Quatro Queijos", 55, "Mussarela, provolone, parmesão e catupiry.", false, flavors),
  { name: "Pizza Chocolate", category: "Pizzas doces", price: 45, description: "Chocolate ao leite com granulado.",
    variants: [{ label: "Tamanho", options: ["Média (6 fatias)", "Grande (8 fatias)"] }] },
  ...extra,
  { name: "Refrigerante 2 L", category: "Bebidas", price: 13, variants: [{ label: "Sabor", options: ["Coca-Cola", "Guaraná", "Fanta"] }] },
  { name: "Refrigerante lata", category: "Bebidas", price: 6 },
  { name: "Cerveja long neck", category: "Bebidas", price: 9 },
];

// ---------- Lojas ----------

export function getFoodPreviews(): Store[] {
  return [
    // ===== Santa Maria da Vitória =====
    foodStore({
      slug: "premium-burguer-samavi",
      name: "Premium Burguer Samavi",
      whatsapp: "5577998488014",
      icon: "🍔",
      tagline: "Hambúrguer artesanal e chopp gelado à beira-rio",
      address: "R. Dr. Cotias Lebre — Centro, Santa Maria da Vitória",
      hours: "Todos os dias 18h–23h",
      colors: { primary: "#111827", accent: "#f59e0b" },
      categories: ["Combos", "Hambúrgueres", "Porções", "Bebidas"],
      delivery: { fee: 5, estimate: "30 a 45 min" },
      products: withIds("pbs", burgerMenu([
        { name: "Chopp Heineken 300 ml", category: "Bebidas", price: 12, description: "Só para consumo no local ou retirada." },
      ])),
    }),
    foodStore({
      slug: "poppys-samavi",
      name: "Poppys Santa Maria da Vitória",
      whatsapp: "5577998201230",
      icon: "🍔",
      tagline: "Lanches, combos e chopp Heineken",
      address: "R. Nilo Peçanha, 78 — Santa Maria da Vitória",
      hours: "Ter a dom 17h–23h",
      colors: { primary: "#c1121f", accent: "#ffd166" },
      categories: ["Combos", "Hambúrgueres", "Porções", "Bebidas"],
      delivery: { fee: 5, estimate: "30 a 45 min" },
      products: withIds("pop", burgerMenu()),
    }),

    foodStore({
      slug: "sabor-goiano",
      name: "Sabor Goiano",
      whatsapp: "5577988810680",
      icon: "🍛",
      tagline: "Comida caseira goiana no almoço · hambúrguer à noite",
      address: "Av. Roberto Santos, 501 — Sambaíba, Santa Maria da Vitória",
      hours: "Almoço seg–sáb 11h–14h · Noite sáb e dom 18h–23h30",
      colors: { primary: "#2d6a4f", accent: "#e9c46a" },
      categories: ["Almoço", "Hambúrgueres", "Combos", "Porções", "Bebidas"],
      delivery: { fee: 5, estimate: "40 a 50 min" },
      products: withIds("sg", [
        { name: "Prato feito do dia", category: "Almoço", price: 22, featured: true,
          description: "Arroz, feijão, salada, farofa e a mistura do dia.", variants: [{ label: "Mistura", options: ["Frango", "Carne", "Linguiça"] }] },
        { name: "Galinhada goiana", category: "Almoço", price: 28, featured: true, description: "Arroz com frango, açafrão e pequi (opcional)." },
        { name: "Marmitex grande", category: "Almoço", price: 25, variants: [{ label: "Mistura", options: ["Frango", "Carne", "Linguiça"] }] },
        ...burgerMenu(),
      ]),
    }),

    // ===== Correntina =====
    foodStore({
      slug: "pizzaria-da-cici",
      name: "Pizzaria e Restaurante da Cici",
      whatsapp: "5577988062051",
      icon: "🍕",
      tagline: "Pizzas e a famosa picanha na chapa",
      address: "Praça Vital Soares, 130 — Centro, Correntina",
      hours: "Todos os dias 18h–0h",
      colors: { primary: "#9b2226", accent: "#ee9b00" },
      categories: ["Pizzas", "Pratos na chapa", "Pizzas doces", "Bebidas"],
      delivery: { fee: 5, estimate: "40 a 60 min" },
      products: withIds("cici", pizzaMenu(["Correntina", ...PIZZA_FLAVORS], [
        pizza("Correntina", 52, "Especial da casa: carne de sol, queijo coalho, cebola e requeijão.", true, ["Correntina", ...PIZZA_FLAVORS]),
        { name: "Picanha na chapa com queijo e cebola", category: "Pratos na chapa", price: 89, featured: true,
          description: "Acompanha arroz, feijão tropeiro, farofa e vinagrete.", variants: [{ label: "Tamanho", options: ["M (2 pessoas)", "G (3 a 4 pessoas)"] }] },
        { name: "Carne de sol na chapa", category: "Pratos na chapa", price: 79,
          description: "Acompanha arroz, feijão tropeiro e mandioca.", variants: [{ label: "Tamanho", options: ["M (2 pessoas)", "G (3 a 4 pessoas)"] }] },
      ])),
    }),
    foodStore({
      slug: "pizzaria-garoto",
      name: "Pizzaria Garoto",
      whatsapp: "5577988882542",
      icon: "🍕",
      tagline: "Pizza bem recheada com preço justo",
      address: "Av. Tancredo Neves, 198 — Correntina",
      colors: { primary: "#1d4ed8", accent: "#fbbf24" },
      categories: ["Pizzas", "Pizzas doces", "Bebidas"],
      delivery: { fee: 5, estimate: "40 a 60 min" },
      products: withIds("gar", pizzaMenu()),
    }),
    foodStore({
      slug: "pizzaria-farias",
      name: "Pizzaria Farias",
      whatsapp: "5577988585771",
      icon: "🍕",
      tagline: "Massa macia, bem temperada e recheada · delivery",
      address: "R. da Chácara — Correntina",
      hours: "Todos os dias 18h–23h30",
      colors: { primary: "#7c2d12", accent: "#facc15" },
      categories: ["Pizzas", "Pizzas doces", "Bebidas"],
      delivery: { fee: 5, estimate: "40 a 60 min" },
      products: withIds("far", pizzaMenu()),
    }),
    foodStore({
      slug: "pizzaria-chaves",
      name: "Pizzaria Chaves",
      whatsapp: "5577988585653",
      icon: "🍕",
      tagline: "Ingredientes de qualidade e ótimo custo-benefício",
      address: "R. Clériston Andrade, 102 — Correntina",
      hours: "Todos os dias 18h30–23h",
      colors: { primary: "#14532d", accent: "#f97316" },
      categories: ["Pizzas", "Pizzas doces", "Bebidas"],
      delivery: { fee: 5, estimate: "40 a 60 min" },
      products: withIds("cha", pizzaMenu()),
    }),
  ];
}
