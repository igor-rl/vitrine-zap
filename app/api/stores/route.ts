import { NextResponse } from "next/server";
import { hashPin, isMaster, keyFrom } from "@/lib/auth";
import { normalizeWhats } from "@/lib/format";
import { getStore, listSlugs, saveStore, SLUG_RE } from "@/lib/storage";
import { buildStoreFromTemplate, TEMPLATES } from "@/lib/templates";
import type { Segment } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Lista todas as lojas (só senha mestra). */
export async function GET(req: Request) {
  if (!isMaster(keyFrom(req))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const slugs = await listSlugs();
  const stores = await Promise.all(
    slugs.map(async (s) => {
      const st = await getStore(s.slug);
      return { ...s, name: st?.name ?? s.slug, segment: st?.segment, updatedAt: st?.updatedAt, products: st?.products.length ?? 0 };
    }),
  );
  return NextResponse.json({ stores });
}

/** Cria loja nova a partir de um modelo de segmento (só senha mestra). */
export async function POST(req: Request) {
  if (!isMaster(keyFrom(req))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string; name?: string; segment?: Segment; whatsapp?: string; pin?: string;
  };
  const slug = (body.slug || "").trim().toLowerCase();
  if (!SLUG_RE.test(slug)) return NextResponse.json({ error: "Endereço inválido: use letras minúsculas, números e hífen." }, { status: 400 });
  if (["admin", "api", "uploads", "_next"].includes(slug)) return NextResponse.json({ error: "Endereço reservado." }, { status: 400 });
  if (!body.name?.trim()) return NextResponse.json({ error: "Informe o nome da loja." }, { status: 400 });
  if (!body.segment || !(body.segment in TEMPLATES)) return NextResponse.json({ error: "Segmento inválido." }, { status: 400 });
  const whats = normalizeWhats(body.whatsapp || "");
  if (whats.length < 12) return NextResponse.json({ error: "WhatsApp inválido (use DDD + número)." }, { status: 400 });
  if (!/^\d{4,8}$/.test(body.pin || "")) return NextResponse.json({ error: "PIN do lojista: 4 a 8 números." }, { status: 400 });
  if (await getStore(slug)) return NextResponse.json({ error: "Esse endereço já existe." }, { status: 409 });

  const store = buildStoreFromTemplate({ slug, name: body.name.trim(), segment: body.segment, whatsapp: whats });
  store.pinHash = hashPin(slug, body.pin!);
  await saveStore(store);
  return NextResponse.json({ ok: true, slug });
}
