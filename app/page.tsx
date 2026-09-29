import Link from "next/link";
import { getSeeds } from "@/lib/seeds";

export default function Home() {
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Vitrine Zap";
  const wa = process.env.NEXT_PUBLIC_BRAND_WHATSAPP;
  const demos = getSeeds();
  return (
    <div>
      <header className="hero" style={{ padding: "44px 0 36px" }}>
        <div className="wrap">
          <h1 style={{ fontSize: "1.9rem" }}>{brand}</h1>
          <p className="tag" style={{ fontSize: "1.05rem", maxWidth: 560 }}>
            Sua loja com catálogo online e pedido direto no WhatsApp. Pronta hoje, sem taxa por venda.
          </p>
          <div className="hero-info">
            {wa && (
              <a className="pill solid" href={`https://wa.me/${wa}?text=${encodeURIComponent(`Olá! Quero uma vitrine ${brand} para minha loja.`)}`}>
                💬 Quero a minha
              </a>
            )}
            <Link className="pill" href="/admin">🔒 Painel</Link>
          </div>
        </div>
      </header>
      <main className="wrap">
        <h2 className="section-title">Veja funcionando</h2>
        <div className="grid">
          {demos.map((d) => (
            <Link key={d.slug} href={`/${d.slug}`} className="card" style={{ textDecoration: "none", "--p": d.colors.primary, "--a": d.colors.accent } as React.CSSProperties}>
              <div className="thumb" style={{ aspectRatio: "16 / 10" }}>
                <div className="ph" style={{ background: `linear-gradient(135deg, ${d.colors.primary}, ${d.colors.accent})`, color: "#fff", fontWeight: 800, fontSize: "1.1rem", padding: 12, textAlign: "center" }}>
                  {d.name}
                </div>
              </div>
              <div className="card-body">
                <div className="card-name">{d.tagline}</div>
                <div className="inst">/{d.slug}</div>
              </div>
            </Link>
          ))}
        </div>
        <h2 className="section-title">Como funciona</h2>
        <ol style={{ paddingLeft: 20, color: "var(--muted)", maxWidth: 640 }}>
          <li>O cliente vê os produtos, escolhe e monta o pedido.</li>
          <li>O pedido chega pronto no WhatsApp da loja, com endereço e pagamento.</li>
          <li>O lojista troca preço e foto pelo celular, no painel.</li>
        </ol>
      </main>
      <footer className="site" style={{ paddingBottom: 40 }}>{brand}</footer>
    </div>
  );
}
