import type { InstallmentsModule } from "./types";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Melhor parcelamento respeitando a parcela mínima. */
export function installmentText(price: number, m?: InstallmentsModule): string | null {
  if (!m?.enabled || price <= 0) return null;
  const max = Math.max(1, Math.min(m.maxInstallments, Math.floor(price / Math.max(1, m.minInstallment))));
  if (max < 2) return null;
  return `ou ${max}x de ${brl(price / max)}${m.interestFree ? " sem juros" : ""}`;
}

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Normaliza telefone BR para o formato do wa.me (55 + DDD + número). */
export function normalizeWhats(s: string) {
  const d = onlyDigits(s);
  if (d.startsWith("55") && d.length >= 12) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}
