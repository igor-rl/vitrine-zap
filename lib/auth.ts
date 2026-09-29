import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { DEMO_PIN } from "./seeds";
import type { Store } from "./types";

const secret = () => process.env.ADMIN_SECRET || "troque-este-segredo-em-producao";

export function hashPin(slug: string, pin: string): string {
  return createHmac("sha256", secret()).update(`${slug}:${pin}`).digest("hex");
}

function safeEq(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

/** Senha mestra (sua): gerencia todas as lojas. */
export function isMaster(key: string | null): boolean {
  const master = process.env.ADMIN_PASSWORD;
  return Boolean(master && key && safeEq(key, master));
}

/** Dono da loja: PIN da loja. Demos sem PIN aceitam 1234 (para mostrar o painel ao cliente). */
export function canEdit(store: Store, key: string | null): boolean {
  if (!key) return false;
  if (isMaster(key)) return true;
  if (store.pinHash) return safeEq(hashPin(store.slug, key), store.pinHash);
  return Boolean(store.isDemo && key === DEMO_PIN);
}

export const keyFrom = (req: Request) => req.headers.get("x-admin-key");
