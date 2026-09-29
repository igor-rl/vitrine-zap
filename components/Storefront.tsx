"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { brl, installmentText } from "@/lib/format";
import {
  deliveryFee, orderMessage, quoteMessage, subtotalOf, waLink,
  type CartItem, type Checkout,
} from "@/lib/order";
import type { Product, PublicStore, Segment } from "@/lib/types";
import * as I from "./icons";

const ICON: Record<Segment, string> = {
  moveis: "🛋️", restaurante: "🍽️", roupas: "👗", mercado: "🛒", construcao: "🧱", geral: "🛍️",
};

const GENERIC = new Set(["pizzaria", "restaurante", "lanchonete", "hamburgueria", "supermercado", "mercado", "mercadinho", "loja", "comercial", "casa", "santa", "maria", "vitória", "samavi", "correntina", "e", "da", "do", "de", "&"]);
const initials = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  const acr = words.find((w) => /^[A-Z0-9]{2,3}$/.test(w));
  if (acr) return acr;
  const keep = words.filter((w) => !GENERIC.has(w.toLowerCase()));
  const pick = (keep.length ? keep : words).slice(0, 2);
  return pick.map((w) => w[0]).join("").toUpperCase();
};

function openWhats(url: string) {
  const w = window.open(url, "_blank");
  if (!w) window.location.href = url;
}

/** Trava a rolagem da página enquanto um sheet está aberto. */
function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}

export default function Storefront({ store, brand }: { store: PublicStore; brand: { name: string; whatsapp?: string } }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Product | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [active, setActive] = useState(0);
  const [stuck, setStuck] = useState(false);
  const cartKey = `cart:${store.slug}`;
  const barRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const icon = store.icon || ICON[store.segment];
  const listMode = store.segment === "restaurante" || store.segment === "mercado";
  useLockScroll(Boolean(open || bagOpen));

  // sacola salva no aparelho
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

  const sections = useMemo(
    () => store.categories
      .map((c) => ({ cat: c, items: store.products.filter((p) => p.category === c) }))
      .filter((s) => s.items.length),
    [store.categories, store.products],
  );
  const featured = store.products.filter((p) => p.featured && p.available);
  const term = q.trim().toLowerCase();
  const results = term
    ? store.products.filter((p) => `${p.name} ${p.description ?? ""} ${p.category}`.toLowerCase().includes(term))
    : [];

  // barra compacta + aba ativa conforme a rolagem
  useEffect(() => {
    const onScroll = () => {
      const bar = barRef.current;
      if (bar) setStuck(bar.getBoundingClientRect().top <= 0.5);
      if (term) return;
      const offset = (bar?.offsetHeight ?? 120) + 24;
      let idx = 0;
      sections.forEach((_, i) => {
        const el = document.getElementById(`sec-${i}`);
        if (el && el.getBoundingClientRect().top - offset <= 0) idx = i;
      });
      setActive(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections, term]);

  // mantém a aba ativa visível na faixa de abas
  useEffect(() => {
    const box = tabsRef.current;
    const btn = box?.children[active] as HTMLElement | undefined;
    if (box && btn) box.scrollTo({ left: btn.offsetLeft - box.clientWidth / 2 + btn.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const goTo = useCallback((i: number) => {
    setQ("");
    requestAnimationFrame(() => {
      const el = document.getElementById(`sec-${i}`);
      const h = barRef.current?.offsetHeight ?? 120;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - h - 8, behavior: "smooth" });
    });
  }, []);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const sub = subtotalOf(cart);
  const d = store.modules.delivery;
  const style = { "--p": store.colors.primary, "--a": store.colors.accent } as React.CSSProperties;
  const mapsUrl = store.mapsUrl || (store.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}` : "");

  function add(item: CartItem) {
    setCart((c) => {
      const hit = c.find((i) => i.key === item.key);
      return hit ? c.map((i) => (i.key === item.key ? { ...i, qty: i.qty + item.qty } : i)) : [...c, item];
    });
    try { navigator.vibrate?.(12); } catch {}
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: store.name, url });
      else { await navigator.clipboard.writeText(url); alert("Link copiado!"); }
    } catch {}
  }

  const renderList = (items: Product[]) =>
    listMode ? (
      <div className="group">{items.map((p) => <Row key={p.id} p={p} store={store} icon={icon} onOpen={setOpen} />)}</div>
    ) : (
      <div className="grid">{items.map((p) => <GridCard key={p.id} p={p} store={store} icon={icon} onOpen={setOpen} />)}</div>
    );

  return (
    <div className="app" style={style}>
      {store.isDemo && <div className="preview-bar">Prévia de demonstração · preços ilustrativos</div>}
      <div className="cover" />

      <section className="store-card">
        <div className="store-logo">
          {store.logoUrl ? <img src={store.logoUrl} alt="" /> : <div className="mono">{initials(store.name)}</div>}
        </div>
        <h1>{store.name}</h1>
        {store.tagline && <p className="tagline">{store.tagline}</p>}
        <div className="meta">
          {store.hours && <span><I.Clock />{store.hours}</span>}
          {d?.enabled && d.estimate && <span><I.Bike />{d.estimate}</span>}
          {d?.enabled && (
            <span className={d.fee === 0 ? "free" : ""}>
              {d.fee === 0 ? "Entrega grátis" : `Entrega ${brl(d.fee)}`}
              {d.fee > 0 && d.freeAbove ? ` · grátis acima de ${brl(d.freeAbove)}` : ""}
            </span>
          )}
        </div>
        <div className="quick">
          <a href={waLink(store.whatsapp, `Olá, ${store.name}! Vim pela vitrine online.`)} target="_blank" rel="noreferrer">
            <span className="qbtn wa"><I.WhatsApp /></span>WhatsApp
          </a>
          {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer"><span className="qbtn"><I.Pin /></span>Como chegar</a>}
          {store.instagram && (
            <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer"><span className="qbtn"><I.Insta /></span>Instagram</a>
          )}
          <a href="#" onClick={(e) => { e.preventDefault(); share(); }}><span className="qbtn"><I.Share /></span>Compartilhar</a>
        </div>
      </section>

      <div className={`appbar ${stuck ? "stuck" : ""}`} ref={barRef}>
        <div className="wrap">
          <div className="mini-title">{store.name}</div>
          <label className="search">
            <I.Search />
            <input placeholder={`Buscar em ${store.name}`} value={q} onChange={(e) => setQ(e.target.value)} enterKeyHint="search" />
            {q && <button className="clear" onClick={() => setQ("")} aria-label="Limpar busca"><I.X /></button>}
          </label>
          {!term && sections.length > 1 && (
            <div className="tabs-scroll" ref={tabsRef} role="tablist">
              {sections.map((s, i) => (
                <button key={s.cat} className={i === active ? "on" : ""} onClick={() => goTo(i)} role="tab" aria-selected={i === active}>{s.cat}</button>
              ))}
            </div>
          )}
          {(term || sections.length <= 1) && <div style={{ height: 10 }} />}
        </div>
      </div>

      <main className="wrap">
        {term ? (
          results.length ? (
            <>
              <h2 className="sec-title">Resultados</h2>
              <p className="sec-sub">{results.length} {results.length === 1 ? "item" : "itens"} para “{q.trim()}”</p>
              {renderList(results)}
            </>
          ) : (
            <div className="empty"><I.Search />Nada encontrado para “{q.trim()}”.</div>
          )
        ) : (
          <>
            {featured.length > 0 && (
              <>
                <h2 className="sec-title">Destaques</h2>
                <div className="carousel">
                  {featured.map((p) => (
                    <button key={`f-${p.id}`} className="fcard" onClick={() => setOpen(p)}>
                      <Img p={p} icon={icon} />
                      <div className="fbody">
                        <div className="pname">{p.name}</div>
                        <Price p={p} />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {sections.map((s, i) => (
              <section key={s.cat} id={`sec-${i}`} className="sec">
                <h2 className="sec-title">{s.cat}</h2>
                {renderList(s.items)}
              </section>
            ))}
            {sections.length === 0 && <div className="empty">Nenhum produto cadastrado ainda.</div>}
          </>
        )}
      </main>

      <footer className="site">
        <div>{store.name}{store.address ? ` · ${store.address}` : ""}</div>
        <div>
          Feito com {brand.whatsapp ? (
            <a href={waLink(brand.whatsapp, `Olá! Vi a vitrine da ${store.name} e quero uma para minha loja.`)} target="_blank" rel="noreferrer">{brand.name}</a>
          ) : brand.name}
        </div>
      </footer>

      {count > 0 && !bagOpen && !open && (
        <div className="bagbar">
          <button onClick={() => setBagOpen(true)}>
            <span className="bcount">{count}</span>
            <span className="grow">Ver sacola</span>
            <span>{brl(sub)}</span>
          </button>
        </div>
      )}

      {open && <ProductSheet p={open} store={store} icon={icon} onClose={() => setOpen(null)} onAdd={(i) => { add(i); setOpen(null); }} />}
      {bagOpen && <BagSheet store={store} cart={cart} setCart={setCart} onClose={() => setBagOpen(false)} />}
    </div>
  );
}

/* ---------- peças ---------- */

function Img({ p, icon, badge = true }: { p: Product; icon: string; badge?: boolean }) {
  const off = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <div className="pimg">
      {p.image ? <img src={p.image} alt="" loading="lazy" /> : <div className="ph" aria-hidden>{icon}</div>}
      {badge && off > 0 && p.available && <span className="badge">-{off}%</span>}
    </div>
  );
}

function Price({ p, store }: { p: Product; store?: PublicStore }) {
  const sale = Boolean(p.oldPrice && p.oldPrice > p.price);
  const inst = store ? installmentText(p.price, store.modules.installments) : null;
  return (
    <>
      <div className="pprice">
        <span className={`now ${sale ? "sale" : ""}`}>{brl(p.price)}</span>
        {sale && <span className="was">{brl(p.oldPrice!)}</span>}
      </div>
      {inst && <div className="pinst">{inst}</div>}
    </>
  );
}

function Row({ p, store, icon, onOpen }: { p: Product; store: PublicStore; icon: string; onOpen: (p: Product) => void }) {
  return (
    <button className={`row ${p.available ? "" : "off"}`} onClick={() => onOpen(p)}>
      <div className="rbody">
        <div className="pname">{p.name}</div>
        {p.description && <div className="pdesc">{p.description}</div>}
        {p.available ? <Price p={p} store={store} /> : <span className="tag out">Esgotado</span>}
      </div>
      <Img p={p} icon={icon} />
    </button>
  );
}

function GridCard({ p, store, icon, onOpen }: { p: Product; store: PublicStore; icon: string; onOpen: (p: Product) => void }) {
  return (
    <button className={`gcard ${p.available ? "" : "off"}`} onClick={() => onOpen(p)}>
      <Img p={p} icon={icon} />
      <div className="gbody">
        <div className="pname">{p.name}</div>
        {p.available ? <Price p={p} store={store} /> : <span className="tag out">Esgotado</span>}
      </div>
    </button>
  );
}

function Sheet({ onClose, children, label }: { onClose: () => void; children: React.ReactNode; label: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal aria-label={label} onClick={(e) => e.stopPropagation()}>
        <span className="handle" />
        {children}
      </div>
    </div>
  );
}

function ProductSheet({ p, store, icon, onClose, onAdd }: {
  p: Product; store: PublicStore; icon: string; onClose: () => void; onAdd: (i: CartItem) => void;
}) {
  const [choices, setChoices] = useState<Record<string, string>>(
    () => Object.fromEntries((p.variants ?? []).map((v) => [v.label, v.options[0] ?? ""])),
  );
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const item = (): CartItem => ({
    key: `${p.id}|${JSON.stringify(choices)}|${note.trim()}`,
    productId: p.id, name: p.name, price: p.price, qty, choices, note: note.trim() || undefined,
  });

  return (
    <Sheet onClose={onClose} label={p.name}>
      <button className="close float-close" onClick={onClose} aria-label="Fechar"><I.X /></button>
      <div className="sheet-scroll">
        <div className="ps-hero"><Img p={p} icon={icon} /></div>
        <div className="ps-body">
          <h2>{p.name}</h2>
          {p.description && <p className="pdesc" style={{ margin: 0 }}>{p.description}</p>}
          <Price p={p} store={store} />
        </div>

        {(p.variants ?? []).map((v) => (
          <div className="sect" key={v.label}>
            <div className="sect-head"><span>{v.label}</span><span className="pill-req">Escolha 1</span></div>
            <div className="group" role="radiogroup" aria-label={v.label}>
              {v.options.map((o) => (
                <button key={o} role="radio" aria-checked={choices[v.label] === o}
                  className={`opt-row ${choices[v.label] === o ? "on" : ""}`}
                  onClick={() => setChoices({ ...choices, [v.label]: o })}>
                  <span>{o}</span><span className="radio" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {store.modules.itemNotes && p.available && (
          <div className="sect">
            <div className="sect-head"><span>Alguma observação?</span></div>
            <div className="group">
              <div className="field-row">
                <textarea rows={2} placeholder="Ex.: tirar a cebola, maionese à parte…" value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} />
              </div>
            </div>
          </div>
        )}
        <div style={{ height: 18 }} />
      </div>

      <div className="sheet-foot">
        {p.available ? (
          <>
            <div className="stepper">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Diminuir"><I.Minus /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="Aumentar"><I.Plus /></button>
            </div>
            <button className="btn grow" onClick={() => onAdd(item())}>
              Adicionar <span className="price-chip">{brl(p.price * qty)}</span>
            </button>
            {store.modules.quoteButton && (
              <button className="btn ghost" aria-label="Pedir orçamento no WhatsApp"
                onClick={() => openWhats(waLink(store.whatsapp, quoteMessage(store, p.name, p.price, choices, qty)))}>
                <I.WhatsApp />
              </button>
            )}
          </>
        ) : (
          <button className="btn wa grow" onClick={() => openWhats(waLink(store.whatsapp, `Olá! O produto *${p.name}* vai voltar ao estoque?`))}>
            <I.WhatsApp /> Avisar quando chegar
          </button>
        )}
      </div>
    </Sheet>
  );
}

function BagSheet({ store, cart, setCart, onClose }: {
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
  const missing = d?.enabled && c.mode === "entrega" && d.freeAbove && fee > 0 ? d.freeAbove - sub : 0;

  const qty = (key: string, delta: number) =>
    setCart((items) => items.map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));

  useEffect(() => { if (cart.length === 0) onClose(); }, [cart.length, onClose]);

  function send() {
    if (!c.name.trim()) return setErr("Informe seu nome para a loja saber quem pediu.");
    if (c.mode === "entrega" && !c.address.trim()) return setErr("Informe o endereço de entrega.");
    setErr("");
    try { localStorage.setItem("checkout", JSON.stringify({ name: c.name, address: c.address })); } catch {}
    openWhats(waLink(store.whatsapp, orderMessage(store, cart, c)));
  }

  return (
    <Sheet onClose={onClose} label="Sua sacola">
      <div className="sheet-scroll">
        <div className="sheet-head">
          <div>
            <h2>Sua sacola</h2>
            <div className="sub">{store.name}</div>
          </div>
          <button className="close" onClick={onClose} aria-label="Fechar"><I.X /></button>
        </div>

        <div className="sect" style={{ marginTop: 4 }}>
          <div className="sect-head">
            <span>Itens</span>
            <button className="link-btn" onClick={() => setCart(() => [])}>Limpar</button>
          </div>
          <div className="group">
            {cart.map((i) => (
              <div className="bag-item" key={i.key}>
                <div className="bi">
                  <div className="bn">{i.name}</div>
                  {(Object.keys(i.choices).length > 0 || i.note) && (
                    <div className="bm">{[...Object.values(i.choices), i.note].filter(Boolean).join(" · ")}</div>
                  )}
                  <div className="bp">{brl(i.price * i.qty)}</div>
                </div>
                <div className="stepper sm">
                  <button onClick={() => qty(i.key, -1)} aria-label="Diminuir">{i.qty === 1 ? <I.Trash /> : <I.Minus />}</button>
                  <span>{i.qty}</span>
                  <button onClick={() => qty(i.key, 1)} aria-label="Aumentar"><I.Plus /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {d?.enabled && d.pickup && (
          <div className="sect">
            <div className="segmented">
              <button className={c.mode === "entrega" ? "on" : ""} onClick={() => setC({ ...c, mode: "entrega" })}><I.Bike /> Entrega</button>
              <button className={c.mode === "retirada" ? "on" : ""} onClick={() => setC({ ...c, mode: "retirada" })}><I.Store /> Retirar</button>
            </div>
          </div>
        )}

        <div className="sect">
          <div className="sect-head"><span>Seus dados</span></div>
          <div className="group">
            <div className="field-row">
              <label htmlFor="ck-name">Nome</label>
              <input id="ck-name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} autoComplete="name" placeholder="Como devemos te chamar" />
            </div>
            {c.mode === "entrega" && (
              <div className="field-row">
                <label htmlFor="ck-addr">Endereço de entrega</label>
                <input id="ck-addr" value={c.address} onChange={(e) => setC({ ...c, address: e.target.value })} autoComplete="street-address" placeholder="Rua, número, bairro e referência" />
              </div>
            )}
          </div>
        </div>

        <div className="sect">
          <div className="sect-head"><span>Pagamento</span></div>
          <div className="group" role="radiogroup" aria-label="Pagamento">
            {store.payment.map((m) => (
              <button key={m} role="radio" aria-checked={c.payment === m} className={`opt-row ${c.payment === m ? "on" : ""}`} onClick={() => setC({ ...c, payment: m })}>
                <span>{m}</span><span className="radio" />
              </button>
            ))}
          </div>
          {/dinheiro/i.test(c.payment) && (
            <div className="group" style={{ marginTop: 10 }}>
              <div className="field-row">
                <label htmlFor="ck-change">Troco para quanto? (opcional)</label>
                <input id="ck-change" inputMode="decimal" value={c.change} onChange={(e) => setC({ ...c, change: e.target.value })} placeholder="Ex.: 100" />
              </div>
            </div>
          )}
        </div>

        <div className="sect">
          <div className="group">
            <div className="field-row">
              <label htmlFor="ck-notes">Observações do pedido (opcional)</label>
              <textarea id="ck-notes" rows={2} value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} maxLength={300} placeholder="Algo que a loja precisa saber?" />
            </div>
          </div>
        </div>

        <div className="sect">
          <div className="group">
            <div className="sum-row"><span>Subtotal</span><span>{brl(sub)}</span></div>
            {d?.enabled && (
              <div className="sum-row">
                <span>{c.mode === "retirada" ? "Retirada na loja" : "Entrega"}</span>
                <span style={fee === 0 ? { color: "var(--ok)", fontWeight: 600 } : undefined}>{c.mode === "retirada" ? "—" : fee === 0 ? "Grátis" : brl(fee)}</span>
              </div>
            )}
            <div className="sum-row total"><span>Total</span><span>{brl(sub + fee)}</span></div>
          </div>
          {missing > 0 && <div className="hint">Faltam {brl(missing)} para a entrega grátis.</div>}
          <div className="hint">O pedido abre no WhatsApp da loja já escrito. É só tocar em enviar.</div>
        </div>
        {err && <div className="err">{err}</div>}
        <div style={{ height: 18 }} />
      </div>

      <div className="sheet-foot">
        <button className="btn wa grow" onClick={send}>
          <I.WhatsApp /> Enviar pedido · {brl(sub + fee)}
        </button>
      </div>
    </Sheet>
  );
}
