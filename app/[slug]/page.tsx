import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Storefront from "@/components/Storefront";
import { getStore, toPublic } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) return { title: "Loja não encontrada" };
  const description = store.tagline || `Veja os produtos de ${store.name} e peça pelo WhatsApp.`;
  return {
    title: store.name,
    description,
    openGraph: { title: store.name, description, images: store.logoUrl ? [store.logoUrl] : undefined },
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) notFound();
  const brand = { name: process.env.NEXT_PUBLIC_BRAND_NAME || "Vitrine Zap", whatsapp: process.env.NEXT_PUBLIC_BRAND_WHATSAPP };
  return <Storefront store={toPublic(store)} brand={brand} />;
}
