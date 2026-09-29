export type Segment = "moveis" | "restaurante" | "roupas" | "mercado" | "construcao" | "geral";

export interface Variant {
  label: string; // ex.: "Tamanho", "Cor", "Sabor"
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  category: string;
  variants?: Variant[];
  available: boolean;
  featured?: boolean;
}

export interface InstallmentsModule {
  enabled: boolean;
  maxInstallments: number; // ex.: 10
  minInstallment: number; // parcela mínima em R$
  interestFree: boolean;
}

export interface DeliveryModule {
  enabled: boolean;
  fee: number;
  freeAbove?: number;
  pickup: boolean; // permite retirar na loja
  estimate?: string; // "40 a 60 min"
}

export interface Store {
  slug: string;
  name: string;
  segment: Segment;
  icon?: string; // emoji usado quando o produto não tem foto
  tagline?: string;
  whatsapp: string; // só dígitos, com DDI: 5577999999999
  instagram?: string; // sem @
  address?: string;
  mapsUrl?: string;
  hours?: string;
  logoUrl?: string;
  colors: { primary: string; accent: string };
  payment: string[];
  categories: string[];
  products: Product[];
  modules: {
    installments?: InstallmentsModule;
    delivery?: DeliveryModule;
    quoteButton?: boolean; // botão "Pedir orçamento" no produto
    itemNotes?: boolean; // observação por item (restaurantes)
  };
  isDemo?: boolean;
  pinHash?: string;
  createdAt: string;
  updatedAt: string;
}

/** Versão enviada ao navegador na vitrine (sem dados de acesso). */
export type PublicStore = Omit<Store, "pinHash">;
