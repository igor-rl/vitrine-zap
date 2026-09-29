import { ImageResponse } from "next/og";
import { getStore } from "@/lib/storage";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vitrine online com pedido pelo WhatsApp";

const LABEL: Record<string, string> = {
  restaurante: "Cardápio online",
  mercado: "Ofertas e pedidos online",
  moveis: "Catálogo online",
  roupas: "Vitrine online",
  construcao: "Orçamento online",
  geral: "Catálogo online",
};

function darken(hex: string, f = 0.62) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v * f).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStore(slug);
  const name = store?.name ?? "Vitrine online";
  const primary = store?.colors.primary ?? "#1f3864";
  const accent = store?.colors.accent ?? "#f59e0b";
  const label = LABEL[store?.segment ?? "geral"];
  const count = store?.products.filter((p) => p.available).length ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, color: "#fff",
          backgroundImage: `radial-gradient(circle at 0% 0%, ${accent}88 0%, transparent 45%), linear-gradient(135deg, ${primary} 0%, ${darken(primary)} 100%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: "rgba(255,255,255,0.16)", fontSize: 30, fontWeight: 600 }}>
            {label}
          </div>
          {count > 0 && (
            <div style={{ display: "flex", fontSize: 28, opacity: 0.85 }}>{`${count} itens`}</div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: name.length > 26 ? 78 : 96, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>{name}</div>
          {store?.tagline && <div style={{ display: "flex", fontSize: 36, opacity: 0.88, lineHeight: 1.25 }}>{store.tagline}</div>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", padding: "18px 30px", borderRadius: 22, background: "#fff", color: "#128c4a", fontSize: 34, fontWeight: 700 }}>
            Faça seu pedido pelo WhatsApp
          </div>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.8 }}>Toque para abrir</div>
        </div>
      </div>
    ),
    size,
  );
}
