import { NextResponse } from "next/server";
import { canEdit, hashPin, isMaster, keyFrom } from "@/lib/auth";
import { normalizeWhats } from "@/lib/format";
import { deleteSaved, getStore, saveStore, toPublic } from "@/lib/storage";
import type { Store } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

/** Público: dados da vitrine. Com chave válida, confirma acesso ao painel. */
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  const key = keyFrom(req);
  if (key !== null) {
    if (!canEdit(store, key)) return NextResponse.json({ error: "PIN incorreto" }, { status: 401 });
    return NextResponse.json({ store: toPublic(store), hasPin: Boolean(store.pinHash), master: isMaster(key) });
  }
  return NextResponse.json({ store: toPublic(store) });
}

/** Salva a loja inteira (JSON). Dono (PIN) ou senha mestra. */
export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const current = await getStore(slug);
  if (!current) return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  const key = keyFrom(req);
  if (!canEdit(current, key)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as (Partial<Store> & { newPin?: string }) | null;
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const next: Store = {
    ...current,
    name: body.name!.trim(),
    tagline: body.tagline?.trim() || undefined,
    whatsapp: normalizeWhats(body.whatsapp!),
    instagram: body.instagram?.replace(/^@/, "").trim() || undefined,
    address: body.address?.trim() || undefined,
    mapsUrl: body.mapsUrl?.trim() || undefined,
    hours: body.hours?.trim() || undefined,
    logoUrl: body.logoUrl || undefined,
    colors: body.colors!,
    payment: body.payment!.map((p) => p.trim()).filter(Boolean),
    categories: body.categories!.map((c) => c.trim()).filter(Boolean),
    products: body.products!,
    modules: body.modules ?? current.modules,
    // campos protegidos: slug, segment, isDemo, createdAt, pinHash
  };
  if (body.newPin) {
    if (!/^\d{4,8}$/.test(body.newPin)) return NextResponse.json({ error: "PIN: 4 a 8 números." }, { status: 400 });
    if (current.isDemo && !isMaster(key)) return NextResponse.json({ error: "O PIN da demo não pode ser trocado." }, { status: 403 });
    next.pinHash = hashPin(slug, body.newPin);
  }
  const saved = await saveStore(next);
  return NextResponse.json({ ok: true, store: toPublic(saved) });
}

/** Apaga a versão salva (demo volta ao original). Só senha mestra. */
export async function DELETE(req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (!isMaster(keyFrom(req))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  await deleteSaved(slug);
  return NextResponse.json({ ok: true });
}

function validate(b: Partial<Store>): string | null {
  if (!b.name?.trim()) return "Nome da loja é obrigatório.";
  if (normalizeWhats(b.whatsapp || "").length < 12) return "WhatsApp inválido.";
  const hex = /^#[0-9a-fA-F]{6}$/;
  if (!b.colors || !hex.test(b.colors.primary) || !hex.test(b.colors.accent)) return "Cores inválidas.";
  if (!Array.isArray(b.payment) || !Array.isArray(b.categories) || !Array.isArray(b.products)) return "Formato inválido.";
  if (b.products.length > 500) return "Máximo de 500 produtos.";
  for (const p of b.products) {
    if (!p.id || !p.name?.trim()) return "Todo produto precisa de nome.";
    if (typeof p.price !== "number" || !isFinite(p.price) || p.price < 0) return `Preço inválido em "${p.name}".`;
  }
  if (JSON.stringify(b).length > 1_000_000) return "Loja muito grande.";
  return null;
}
