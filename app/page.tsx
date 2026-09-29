import Link from "next/link";
import { getSeeds } from "@/lib/seeds";

const EMOJI: Record<string, string> = { moveis: "🛋️", restaurante: "🍕", roupas: "👗", mercado: "🛒", construcao: "🧱", geral: "🛍️" };

export default function Home() {
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Vitrine Zap";
  const wa = process.env.NEXT_PUBLIC_BRAND_WHATSAPP;
  const demos = getSeeds();
  return (
    <div className="landing">
      <header className="l-hero">
        <div className="wrap">
          <h1>{brand}</h1>
          <p>Sua loja com cardápio ou catálogo online e pedido direto no WhatsApp. Pronta hoje, sem taxa por venda.</p>
          <div className="cta">
            {wa && (
              <a className="btn" href={`https://wa.me/${wa}?text=${encodeURIComponent(`Olá! Quero uma vitrine ${brand} para minha loja.`)}`}>
                Quero a minha
              </a>
            )}
            <Link className="btn soft" href="/admin">Painel</Link>
          </div>
        </div>
      </header>

      <main className="wrap">
        <div className="demo-grid">
          {demos.map((d) => (
            <Link key={d.slug} href={`/${d.slug}`} className="demo-card">
              <div className="dc-top" style={{ background: `linear-gradient(135deg, ${d.colors.primary}, ${d.colors.accent})` }}>
                {EMOJI[d.segment]}
              </div>
              <div className="dc-body">
                <div className="dc-name">{d.name}</div>
                <div className="dc-sub">Ver demonstração</div>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="sec-title">Como funciona</h2>
        <div className="group steps">
          <div className="step"><span className="num">1</span><div><b>O cliente escolhe</b><span>Vê fotos, preços e opções e monta o pedido pelo celular.</span></div></div>
          <div className="step"><span className="num">2</span><div><b>O pedido chega pronto</b><span>No WhatsApp da loja, com endereço, pagamento e troco.</span></div></div>
          <div className="step"><span className="num">3</span><div><b>O lojista atualiza</b><span>Troca preço, foto e disponibilidade no painel, em segundos.</span></div></div>
        </div>
      </main>
    </div>
  );
}
