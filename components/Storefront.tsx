"use client";

import { useEffect, useMemo, useState } from "react";
import { brl, installmentText } from "@/lib/format";
import {
  deliveryFee, orderMessage, quoteMessage, subtotalOf, waLink,
  type CartItem, type Checkout,
} from "@/lib/order";
import type { Product, PublicStore, Segment } from "@/lib/types";

const ICON: Record<Segment, string> = {
  moveis: "🛋️", restaurante: "🍕", roupas: "👗", mercado: "🛒", construcao: "🧱", geral: "🛍️",
};

const initials = (name: string) =>
  name.split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || name[0];

function openWhats(url: string) {
  const w = window.open(url, "_blank");
  if (!w) window.location.href = url;
}

export default function Storefront({ store, brand }: { store: PublicStore; brand: { name: string; whatsapp?: string } }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todos");
  const [open, setOpen] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartKey = `cart:${store.slug}`;

  // carrinho persiste no navegador (se permitido)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartKey);
      if (raw) {
        const ids = new Set(store.products.map((p) => p.id));
        setCart((JSON.parse(raw) as CartItem[]).filter((i) => ids.has(i.productId)));
      }
    } catch {}
  }, [cartKey, store.products]);
  useEffect(() => {
    try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch {}
  }, [cart, cartKey]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return store.products.filter(
      (p) =>
        (cat === "Todos" || p.category === cat) &&
        (!term || `${p.name} ${p.description ?? ""}`.toLowerCase().includes(term)),
    );
  }, [store.products, q, cat]);

  const featured = cat === "Todos" && !q ? store.products.filter((p) => p.featured && p.available) : [];
  const usedCats = store.categories.filter((c) => store.products.some((p) => p.category === c));
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const sub = subtotalOf(cart);

  const style = { "--p": store.colors.primary, "--a": store.colors.accent } as React.CSSProperties;
  const brandWa = brand.whatsapp;

  function add(item: CartItem) {
    setCart((c) => {
      const hit = c.find((i) => i.key === item.key);
      return hit ? c.map((i) => (i.key === item.key ? { ...i, qty: i.qty + item.qty } : i)) : [...c, item];
    });
  }

  return (
    <div style={style}>
      <header className="hero">
        <div className="wrap">
          <div className="hero-row">
            <div className="logo">{store.logoUrl ? <img src={store.logoUrl} alt="" /> : initials(store.name)}</div>
            <div>
              <h1>{store.name}</h1>
              {store.tagline && <p className="tag">{store.tagline}</p>}
            </div>
          </div>
          <div className="hero-info">
            <a className="pill solid" href={waLink(store.whatsapp, `Olá, ${store.name}! Vim pela vitrine online.`)} target="_blank" rel="noreferrer">💬 WhatsApp</a>
            {store.hours && <span className="pill">🕒 {store.hours}</span>}
            {store.address && (
              <a className="pill" href={store.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`} target="_blank" rel="noreferrer">📍 {store.address}</a>
            )}
            {store.instagram && <a className="pill" href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer">📷 @{store.instagram}</a>}
            {store.modules.delivery?.enabled && store.modules.delivery.estimate && <span className="pill">🛵 {store.modules.delivery.estimate}</span>}
          </div>
          {store.isDemo && <span className="demo-badge">Prévia de demonstração · preços ilustrativos</span>}
        </div>
      </header>

      <div className="toolbar">
        <div className="wrap">
          <input className="search" placeholder="Buscar produto…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar produto" />
          <div className="chips" role="tablist">
            {["Todos", ...usedCats].map((c) => (
              <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <main className="wrap">
        {featured.length > 0 && (
          <>
            <h2 className="section-title">Destaques</h2>
            <div className="grid">{featured.map((p) => <Card key={`f-${p.id}`} p={p} store={store} onOpen={setOpen} />)}</div>
            <h2 className="section-title">Todos os produtos</h2>
          </>
        )}
        {featured.length === 0 && <div style={{ height: 16 }} />}
        {visible.length ? (
          <div className="grid">{visible.map((p) => <Card key={p.id} p={p} store={store} onOpen={setOpen} />)}</div>
        ) : (
          <p className="empty">Nenhum produto encontrado.</p>
        )}
      </main>

      <footer className="site">
        <div>{store.name}{store.address ? ` · ${store.address}` : ""}</div>
        <div style={{ marginTop: 6 }}>
          Vitrine feita com {brandWa ? (
            <a href={waLink(brandWa, `Olá! Vi a vitrine da ${store.name} e quero uma para minha loja.`)} target="_blank" rel="noreferrer">{brand.name} — quero uma assim</a>
          ) : brand.name}
        </div>
      </footer>

      {count > 0 && !cartOpen && !open && (
        <div className="cartbar">
          <button onClick={() => setCartOpen(true)}>
            <span><span className="count">{count}</span>Ver pedido</span>
            <span>{brl(sub)}</span>
          </button>
        </div>
      )}

      {open && <ProductSheet p={open} store={store} onClose={() => setOpen(null)} onAdd={(i) => { add(i); setOpen(null); }} />}
      {cartOpen && <CartSheet store={store} cart={cart} setCart={setCart} onClose={() => setCartOpen(false)} />}
    </div>
  );
}

function Thumb({ p, store }: { p: Product; store: PublicStore }) {
  return p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <div className="ph" aria-hidden>{store.icon || ICON[store.segment]}</div>;
}

function Card({ p, store, onOpen }: { p: Product; store: PublicStore; onOpen: (p: Product) => void }) {
  const inst = installmentText(p.price, store.modules.installments);
  const off = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <button className={`card ${p.available ? "" : "off"}`} onClick={() => onOpen(p)}>
      <div className="thumb">
        <Thumb p={p} store={store} />
        {!p.available ? <span className="badge">Esgotado</span> : off > 0 ? <span className="badge">-{off}%</span> : null}
      </div>
      <div className="card-body">
        <div className="card-name">{p.name}</div>
        <div className="price">
          {p.oldPrice && p.oldPrice > p.price && <span className="old">{brl(p.oldPrice)}</span>}
          {brl(p.price)}
        </div>
        {inst && <div className="inst">{inst}</div>}
      </div>
    </button>
  );
}

function ProductSheet({ p, store, onClose, onAdd }: {
  p: Product; store: PublicStore; onClose: () => void; onAdd: (i: CartItem) => void;
}) {
  const [choices, setChoices] = useState<Record<string, string>>(
    () => Object.fromEntries((p.variants ?? []).map((v) => [v.label, v.options[0] ?? ""])),
  );
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const inst = installmentText(p.price, store.modules.installments);

  const item = (): CartItem => ({
    key: `${p.id}|${JSON.stringify(choices)}|${note.trim()}`,
    productId: p.id, name: p.name, price: p.price, qty, choices, note: note.trim() || undefined,
  });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={p.name}>
        <div className="sheet-head"><h2>{p.name}</h2><button className="x" onClick={onClose} aria-label="Fechar">✕</button></div>
        <div className="sheet-body">
          <div className="sheet-img"><Thumb p={p} store={store} /></div>
          <div>
            <div className="price" style={{ fontSize: "1.35rem" }}>
              {p.oldPrice && p.oldPrice > p.price && <span className="old">{brl(p.oldPrice)}</span>}
              {brl(p.price)}
            </div>
            {inst && <div className="inst" style={{ fontSize: ".9rem" }}>{inst}</div>}
          </div>
          {p.description && <p className="desc">{p.description}</p>}

          {(p.variants ?? []).map((v) => (
            <div className="field" key={v.label}>
              <span>{v.label}</span>
              <div className="opts">
                {v.options.map((o) => (
                  <button key={o} className={`opt ${choices[v.label] === o ? "on" : ""}`} onClick={() => setChoices({ ...choices, [v.label]: o })}>{o}</button>
                ))}
              </div>
            </div>
          ))}

          {store.modules.itemNotes && (
            <label className="field"><span>Observação</span>
              <input className="input" placeholder="Ex.: sem cebola, bem passado…" value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} />
            </label>
          )}

          {p.available ? (
            <>
              <div className="row between">
                <div className="qty">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Menos">−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} aria-label="Mais">+</button>
                </div>
                <strong>{brl(p.price * qty)}</strong>
              </div>
              <button className="btn block" onClick={() => onAdd(item())}>Adicionar ao pedido</button>
              {store.modules.quoteButton && (
                <button className="btn ghost block" onClick={() => openWhats(waLink(store.whatsapp, quoteMessage(store, p.name, p.price, choices, qty)))}>
                  Pedir orçamento no WhatsApp
                </button>
              )}
            </>
          ) : (
            <button className="btn wa block" onClick={() => openWhats(waLink(store.whatsapp, `Olá! O produto *${p.name}* vai voltar ao estoque?`))}>
              Esgotado — avisar quando chegar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartSheet({ store, cart, setCart, onClose }: {
  store: PublicStore; cart: CartItem[]; setCart: (f: (c: CartItem[]) => CartItem[]) => void; onClose: () => void;
}) {
  const d = store.modules.delivery;
  const [c, setC] = useState<Checkout>(() => {
    let saved: Partial<Checkout> = {};
    try { saved = JSON.parse(localStorage.getItem("checkout") || "{}"); } catch {}
    return {
      name: saved.name || "", address: saved.address || "",
      mode: d?.enabled ? "entrega" : "retirada",
      payment: store.payment[0] || "Pix", change: "", notes: "",
    };
  });
  const [err, setErr] = useState("");
  const sub = subtotalOf(cart);
  const fee = deliveryFee(store, sub, c.mode);

  const qty = (key: string, delta: number) =>
    setCart((items) => items.map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));

  function send() {
    if (!c.name.trim()) return setErr("Informe seu nome.");
    if (c.mode === "entrega" && !c.address.trim()) return setErr("Informe o endereço de entrega.");
    setErr("");
    try { localStorage.setItem("checkout", JSON.stringify({ name: c.name, address: c.address })); } catch {}
    openWhats(waLink(store.whatsapp, orderMessage(store, cart, c)));
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Seu pedido">
        <div className="sheet-head"><h2>Seu pedido</h2><button className="x" onClick={onClose} aria-label="Fechar">✕</button></div>
        <div className="sheet-body">
          {cart.length === 0 ? <p className="empty">Seu pedido está vazio.</p> : (
            <>
              <div>
                {cart.map((i) => (
                  <div className="line-item" key={i.key}>
                    <div>
                      <div className="li-name">{i.name}</div>
                      {(Object.keys(i.choices).length > 0 || i.note) && (
                        <div className="li-meta">{Object.values(i.choices).join(" · ")}{i.note ? ` · ${i.note}` : ""}</div>
                      )}
                      <div className="li-meta">{brl(i.price)} cada</div>
                    </div>
                    <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                      <strong>{brl(i.price * i.qty)}</strong>
                      <div className="qty">
                        <button onClick={() => qty(i.key, -1)} aria-label="Menos">−</button>
                        <span>{i.qty}</span>
                        <button onClick={() => qty(i.key, 1)} aria-label="Mais">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {d?.enabled && d.pickup && (
                <div className="seg">
                  <button className={`opt ${c.mode === "entrega" ? "on" : ""}`} onClick={() => setC({ ...c, mode: "entrega" })}>🛵 Entrega</button>
                  <button className={`opt ${c.mode === "retirada" ? "on" : ""}`} onClick={() => setC({ ...c, mode: "retirada" })}>🏪 Retirar na loja</button>
                </div>
              )}

              <label className="field"><span>Seu nome</span>
                <input className="input" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} autoComplete="name" />
              </label>
              {c.mode === "entrega" && (
                <label className="field"><span>Endereço de entrega</span>
                  <input className="input" placeholder="Rua, número, bairro, referência" value={c.address} onChange={(e) => setC({ ...c, address: e.target.value })} autoComplete="street-address" />
                </label>
              )}
              <div className="field"><span>Pagamento</span>
                <div className="opts">
                  {store.payment.map((m) => (
                    <button key={m} className={`opt ${c.payment === m ? "on" : ""}`} onClick={() => setC({ ...c, payment: m })}>{m}</button>
                  ))}
                </div>
              </div>
              {/dinheiro/i.test(c.payment) && (
                <label className="field"><span>Troco para quanto? (opcional)</span>
                  <input className="input" inputMode="decimal" value={c.change} onChange={(e) => setC({ ...c, change: e.target.value })} />
                </label>
              )}
              <label className="field"><span>Observações (opcional)</span>
                <textarea className="textarea" value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} maxLength={300} />
              </label>

              <div className="totals">
                <div className="row between"><span>Subtotal</span><span>{brl(sub)}</span></div>
                {d?.enabled && (
                  <div className="row between">
                    <span>{c.mode === "retirada" ? "Retirada" : "Entrega"}</span>
                    <span>{c.mode === "retirada" ? "—" : fee === 0 ? "Grátis" : brl(fee)}</span>
                  </div>
                )}
                {d?.enabled && c.mode === "entrega" && d.freeAbove && fee > 0 && (
                  <div className="note">Entrega grátis acima de {brl(d.freeAbove)}</div>
                )}
                <div className="row between grand"><span>Total</span><span>{brl(sub + fee)}</span></div>
              </div>

              {err && <div className="err">{err}</div>}
              <button className="btn wa block" onClick={send}>Enviar pedido pelo WhatsApp</button>
              <p className="note" style={{ margin: 0, textAlign: "center" }}>O pedido abre no WhatsApp da loja, já escrito. É só enviar.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
