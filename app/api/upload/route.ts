import { NextResponse } from "next/server";
import { canEdit, keyFrom } from "@/lib/auth";
import { getStore, uploadImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX = 4 * 1024 * 1024; // limite de corpo da Vercel é ~4,5 MB
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const slug = String(form?.get("slug") || "");
  const file = form?.get("file");
  const store = slug ? await getStore(slug) : null;
  if (!store) return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  if (!canEdit(store, keyFrom(req))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Envie uma imagem." }, { status: 400 });
  if (!TYPES.includes(file.type)) return NextResponse.json({ error: "Use JPG, PNG ou WebP." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Imagem acima de 4 MB." }, { status: 400 });
  const url = await uploadImage(slug, file);
  return NextResponse.json({ url });
}
