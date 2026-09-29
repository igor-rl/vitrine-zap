import { brl } from "./format";
import type { PublicStore } from "./types";

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  choices: Record<string, string>;
  note?: string;
}

export interface Checkout {
  name: string;
  mode: "entrega" | "retirada";
  address: string;
  payment: string;
  change?: string;
  notes?: string;
}

export const subtotalOf = (items: CartItem[]) => items.reduce((s, i) => s + i.price * i.qty, 0);

export function deliveryFee(store: PublicStore, subtotal: number, mode: Checkout["mode"]): number {
  const d = store.modules.delivery;
  if (!d?.enabled || mode === "retirada") return 0;
  if (d.freeAbove && subtotal >= d.freeAbove) return 0;
  return d.fee || 0;
}

const choicesText = (c: Record<string, string>) => {
  const parts = Object.entries(c).map(([k, v]) => `${k}: ${v}`);
  return parts.length ? ` (${parts.join(", ")})` : "";
};

export function orderMessage(store: PublicStore, items: CartItem[], c: Checkout): string {
  const sub = subtotalOf(items);
  const fee = deliveryFee(store, sub, c.mode);
  const lines: string[] = [];
  lines.push(`*Novo pedido — ${store.name}*`);
  lines.push("_(feito pela vitrine online)_");
  lines.push("");
  for (const i of items) {
    lines.push(`${i.qty}x ${i.name}${choicesText(i.choices)} — ${brl(i.price * i.qty)}`);
    if (i.note) lines.push(`   Obs: ${i.note}`);
  }
  lines.push("");
  lines.push(`Subtotal: ${brl(sub)}`);
  if (store.modules.delivery?.enabled) {
    lines.push(c.mode === "retirada" ? "Retirada na loja" : `Entrega: ${fee === 0 ? "grátis" : brl(fee)}`);
  }
  lines.push(`*Total: ${brl(sub + fee)}*`);
  lines.push("");
  lines.push(`Nome: ${c.name}`);
  if (c.mode === "entrega" && c.address) lines.push(`Endereço: ${c.address}`);
  lines.push(`Pagamento: ${c.payment}`);
  if (c.change) lines.push(`Troco para: ${c.change}`);
  if (c.notes) lines.push(`Observações: ${c.notes}`);
  return lines.join("\n");
}

export function quoteMessage(store: PublicStore, name: string, price: number, choices: Record<string, string>, qty: number): string {
  return [
    `Olá, ${store.name}! Vi na vitrine online e gostaria de um orçamento:`,
    "",
    `${qty}x *${name}*${choicesText(choices)} — ${brl(price)} cada`,
    "",
    "Quais as condições de pagamento e o prazo de entrega?",
  ].join("\n");
}

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
