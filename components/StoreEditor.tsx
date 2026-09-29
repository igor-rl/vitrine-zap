"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { brl } from "@/lib/format";
import type { Product, PublicStore, Variant } from "@/lib/types";

type Tab = "produtos" | "loja" | "vendas" | "divulgar";
const rid = () => Math.random().toString(36).slice(2, 10);

function parseBR(s: string): number {
  const t = s.replace(/[^\d.,]/g, "");
  const n = t.includes(",") ? Number(t.replace(/\./g, "").replace(",", ".")) : Number(t);
  return isFinite(n) ? Math.round(n * 100) / 100 : 0;
}
const fmtBR = (n?: number) => (n === undefined || n === null ? "" : n.toFixed(2).replace(".", ","));

function PriceInput({ value, onChange, placeholder }: { value?: number; onChange: (n: number | undefined) => void; placeholder?: string }) {
  const [txt, setTxt] = useState(fmtBR(value));
  useEffect(() => setTxt(fmtBR(value)), [value]);
  return (
    <input className="input" inputMode="decimal" placeholder={placeholder} value={txt}
      onChange={(e) => setTxt(e.target.value)}
      onBlur={() => { const v = txt.trim() ? parseBR(txt) : undefined; onChange(v); setTxt(fmtBR(v)); }} />
  );
}

const variantsToText = (v?: Variant[]) => (v ?? []).map((x) => `${x.label}: ${x.options.join(", ")}`).join("\n");
function textToVariants(t: string): Variant[] | undefined {
  const out = t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, rest] = l.includes(":") ? [l.slice(0, l.indexOf(":")), l.slice(l.indexOf(":") + 1)] : ["Opção", l];
    return { label: label.trim(), options: rest.split(",").map((o) => o.trim()).filter(Boolean) };
  }).filter((v) => v.options.length);
  return out.length ? out : undefined;
}

/** Reduz a foto no próprio celular antes de enviar (máx. 1200 px, JPEG). */
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(b || file), "image/jpeg", 0.82));
}

export default function StoreEditor({ slug }: { slug: string }) {
  const [key, setKey] = useState("");
  const [pin, setPin] = useState("");
  const [store, setStore] = useState<PublicStore | null>(null);
  const [meta, setMeta] = useState({ hasPin: false, master: false });
  const [tab, setTab] = useState<Tab>("produtos");
  const [err, setErr] = useState("");
  const [status, setStatus] = useState<{ t: string; ok?: boolean }>({ t: "" });
  const [dirty, setDirty] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [catText, setCatText] = useState("");
  const [payText, setPayText] = useState("");

  const load = useCallback(async (k: string) => {
    const r = await fetch(`/api/stores/${slug}`, { headers: { "x-admin-key": k }, cache: "no-store" });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Erro");
    setStore(j.store); setMeta({ hasPin: j.hasPin, master: j.master });
    setCatText(j.store.categories.join("\n")); setPayText(j.store.payment.join("\n"));
    setKey(k); setDirty(false);
    try { sessionStorage.setItem(`key:${slug}`, k); } catch {}
  }, [slug]);

  useEffect(() => {
    let k: string | null = null;
    try { k = sessionStorage.getItem(`key:${slug}`) || sessionStorage.getItem("master"); } catch {}
    if (k) load(k).catch(() => {});
  }, [load, slug]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const update = (patch: Partial<PublicStore>) => { setStore((s) => (s ? { ...s, ...patch } : s)); setDirty(true); setStatus({ t: "" }); };
  const updateProduct = (id: string, patch: Partial<Product>) =>
    update({ products: store!.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });

  async function save() {
    if (!store) return;
    setStatus({ t: "Salvando…" });
    const body = {
      ...store,
      categories: catText.split("\n").map((s) => s.trim()).filter(Boolean),
      payment: payText.split("\n").map((s) => s.trim()).filter(Boolean),
      newPin: newPin || undefined,
    };
    const r = await fetch(`/api/stores/${slug}`, {
      method: "PUT", headers: { "content-type": "application/json", "x-admin-key": key }, body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) return setStatus({ t: j.error || "Erro ao salvar" });
    setStore(j.store); setDirty(false);
    if (newPin) {
      const k = meta.master ? key : newPin;
      setKey(k);
      try { sessionStorage.setItem(`key:${slug}`, k); } catch {}
      setNewPin(""); setMeta({ ...meta, hasPin: true });
    }
    setStatus({ t: "Salvo ✓ — já está no ar", ok: true });
  }

  async function upload(file: File): Promise<string | null> {
    setStatus({ t: "Enviando foto…" });
    const blob = await shrink(file);
    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("file", new File([blob], "foto.jpg", { type: blob.type || "image/jpeg" }));
    const r = await fetch("/api/upload", { method: "POST", headers: { "x-admin-key": key }, body: fd });
    const j = await r.json();
    if (!r.ok) { setStatus({ t: j.error || "Erro no envio" }); return null; }
    setStatus({ t: "Foto enviada. Toque em Salvar." });
    return j.url;
  }

  if (!store) {
    return (
      <div className="wrap login">
        <form className="panel" onSubmit={async (e) => { e.preventDefault(); setErr(""); try { await load(pin); } catch (x) { setErr((x as Error).message); } }}>
          <h2>Painel da loja</h2>
          <p className="small" style={{ margin: 0 }}>/{slug}</p>
          <label className="field"><span>PIN</span>
            <input className="input" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
          </label>
          {err && <div className="err">{err}</div>}
          <button className="btn block" style={{ background: "#16161b" }}>Entrar</button>
        </form>
      </div>
    );
  }

  const cats = catText.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="admin">
      <div className="topbar">
        <div className="wrap">
          <strong>{store.name}</strong>
          <div className="row">
            {meta.master && <Link href="/admin">Todas</Link>}
            <a href={`/${slug}`} target="_blank" rel="noreferrer">Ver loja ↗</a>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="tabs">
          {([["produtos", `Produtos (${store.products.length})`], ["loja", "Loja"], ["vendas", "Entrega e pagamento"], ["divulgar", "Divulgar"]] as [Tab, string][]).map(([t, l]) => (
            <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>

        {tab === "produtos" && (
          <div className="panel">
            <div className="row between">
              <h2>Produtos</h2>
              <button className="btn" style={{ background: "#16161b", padding: "9px 14px" }} onClick={() => {
                const p: Product = { id: rid(), name: "Novo produto", price: 0, category: cats[0] || "Produtos", available: true };
                update({ products: [p, ...store.products] });
              }}>+ Novo</button>
            </div>
            {store.products.length === 0 && <p className="small">Nenhum produto ainda.</p>}
            {store.products.map((p, idx) => (
              <ProductEditor key={p.id} p={p} cats={cats} upload={upload}
                onChange={(patch) => updateProduct(p.id, patch)}
                onMove={(d) => {
                  const arr = [...store.products]; const j = idx + d;
                  if (j < 0 || j >= arr.length) return;
                  [arr[idx], arr[j]] = [arr[j], arr[idx]]; update({ products: arr });
                }}
                onDup={() => { const arr = [...store.products]; arr.splice(idx + 1, 0, { ...p, id: rid(), name: `${p.name} (cópia)` }); update({ products: arr }); }}
                onDel={() => { if (confirm(`Excluir "${p.name}"?`)) update({ products: store.products.filter((x) => x.id !== p.id) }); }} />
            ))}
          </div>
        )}

        {tab === "loja" && (
          <div className="panel">
            <h2>Dados da loja</h2>
            <div className="row">
              <div className="prod-img" style={{ width: 72, height: 72 }}>{store.logoUrl ? <img src={store.logoUrl} alt="" /> : "🏪"}</div>
              <label className="mini" style={{ cursor: "pointer" }}>Trocar logo
                <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await upload(f); if (u) update({ logoUrl: u }); } }} />
              </label>
              {store.logoUrl && <button className="mini" onClick={() => update({ logoUrl: undefined })}>Remover</button>}
            </div>
            <div className="two">
              <label className="field"><span>Nome</span><input className="input" value={store.name} onChange={(e) => update({ name: e.target.value })} /></label>
              <label className="field"><span>Frase de destaque</span><input className="input" value={store.tagline || ""} onChange={(e) => update({ tagline: e.target.value })} /></label>
              <label className="field"><span>WhatsApp (recebe os pedidos)</span><input className="input" inputMode="tel" value={store.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} /></label>
              <label className="field"><span>Instagram (sem @)</span><input className="input" value={store.instagram || ""} onChange={(e) => update({ instagram: e.target.value })} /></label>
              <label className="field"><span>Endereço</span><input className="input" value={store.address || ""} onChange={(e) => update({ address: e.target.value })} /></label>
              <label className="field"><span>Horário</span><input className="input" value={store.hours || ""} onChange={(e) => update({ hours: e.target.value })} /></label>
              <label className="field"><span>Cor principal</span><input className="input" type="color" style={{ height: 46, padding: 4 }} value={store.colors.primary} onChange={(e) => update({ colors: { ...store.colors, primary: e.target.value } })} /></label>
              <label className="field"><span>Cor de destaque</span><input className="input" type="color" style={{ height: 46, padding: 4 }} value={store.colors.accent} onChange={(e) => update({ colors: { ...store.colors, accent: e.target.value } })} /></label>
            </div>
            <label className="field"><span>Categorias (uma por linha, nesta ordem)</span>
              <textarea className="textarea" rows={5} value={catText} onChange={(e) => { setCatText(e.target.value); setDirty(true); }} />
            </label>
            {!store.isDemo || meta.master ? (
              <label className="field"><span>{meta.hasPin ? "Trocar PIN do painel" : "Definir PIN do painel"} (4 a 8 números)</span>
                <input className="input" inputMode="numeric" value={newPin} onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8)); setDirty(true); }} placeholder="deixe vazio para manter" />
              </label>
            ) : <p className="small">Loja de demonstração: PIN 1234.</p>}
          </div>
        )}

        {tab === "vendas" && (
          <div className="panel">
            <h2>Entrega</h2>
            <label className="check"><input type="checkbox" checked={!!store.modules.delivery?.enabled}
              onChange={(e) => update({ modules: { ...store.modules, delivery: { fee: 0, pickup: true, ...store.modules.delivery, enabled: e.target.checked } } })} />Faz entrega</label>
            {store.modules.delivery?.enabled && (
              <div className="two">
                <label className="field"><span>Taxa de entrega (R$)</span>
                  <PriceInput value={store.modules.delivery.fee} onChange={(v) => update({ modules: { ...store.modules, delivery: { ...store.modules.delivery!, fee: v ?? 0 } } })} /></label>
                <label className="field"><span>Grátis acima de (R$, opcional)</span>
                  <PriceInput value={store.modules.delivery.freeAbove} onChange={(v) => update({ modules: { ...store.modules, delivery: { ...store.modules.delivery!, freeAbove: v } } })} /></label>
                <label className="field"><span>Prazo / aviso</span>
                  <input className="input" value={store.modules.delivery.estimate || ""} onChange={(e) => update({ modules: { ...store.modules, delivery: { ...store.modules.delivery!, estimate: e.target.value } } })} /></label>
                <label className="check"><input type="checkbox" checked={store.modules.delivery.pickup}
                  onChange={(e) => update({ modules: { ...store.modules, delivery: { ...store.modules.delivery!, pickup: e.target.checked } } })} />Aceita retirada na loja</label>
              </div>
            )}

            <h2>Parcelamento</h2>
            <label className="check"><input type="checkbox" checked={!!store.modules.installments?.enabled}
              onChange={(e) => update({ modules: { ...store.modules, installments: { maxInstallments: 10, minInstallment: 50, interestFree: true, ...store.modules.installments, enabled: e.target.checked } } })} />Mostrar parcelas nos produtos</label>
            {store.modules.installments?.enabled && (
              <div className="two">
                <label className="field"><span>Máximo de parcelas</span>
                  <input className="input" type="number" min={2} max={24} value={store.modules.installments.maxInstallments}
                    onChange={(e) => update({ modules: { ...store.modules, installments: { ...store.modules.installments!, maxInstallments: Number(e.target.value) || 2 } } })} /></label>
                <label className="field"><span>Parcela mínima (R$)</span>
                  <PriceInput value={store.modules.installments.minInstallment} onChange={(v) => update({ modules: { ...store.modules, installments: { ...store.modules.installments!, minInstallment: v ?? 0 } } })} /></label>
                <label className="check"><input type="checkbox" checked={store.modules.installments.interestFree}
                  onChange={(e) => update({ modules: { ...store.modules, installments: { ...store.modules.installments!, interestFree: e.target.checked } } })} />Sem juros</label>
              </div>
            )}

            <h2>Outros</h2>
            <label className="check"><input type="checkbox" checked={!!store.modules.quoteButton}
              onChange={(e) => update({ modules: { ...store.modules, quoteButton: e.target.checked } })} />Botão “Pedir orçamento” nos produtos</label>
            <label className="check"><input type="checkbox" checked={!!store.modules.itemNotes}
              onChange={(e) => update({ modules: { ...store.modules, itemNotes: e.target.checked } })} />Campo de observação por item (ex.: “sem cebola”)</label>

            <label className="field"><span>Formas de pagamento (uma por linha)</span>
              <textarea className="textarea" rows={4} value={payText} onChange={(e) => { setPayText(e.target.value); setDirty(true); }} />
            </label>
          </div>
        )}

        {tab === "divulgar" && <Share slug={slug} name={store.name} />}
      </div>

      <div className="savebar">
        <div className="wrap">
          <span className={`status ${status.ok ? "ok" : ""}`}>{status.t || (dirty ? "Alterações não salvas" : "Tudo salvo")}</span>
          <button className="btn" style={{ background: "#16161b" }} disabled={!dirty} onClick={save}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

function ProductEditor({ p, cats, upload, onChange, onMove, onDup, onDel }: {
  p: Product; cats: string[]; upload: (f: File) => Promise<string | null>;
  onChange: (patch: Partial<Product>) => void; onMove: (d: number) => void; onDup: () => void; onDel: () => void;
}) {
  const [open, setOpen] = useState(p.name === "Novo produto");
  const [vt, setVt] = useState(variantsToText(p.variants));
  return (
    <div className="prod">
      <div className="prod-head">
        <label className="prod-img" style={{ cursor: "pointer" }} title="Trocar foto">
          {p.image ? <img src={p.image} alt="" /> : "📷"}
          <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await upload(f); if (u) onChange({ image: u }); } }} />
        </label>
        <button onClick={() => setOpen(!open)} style={{ border: 0, background: "none", textAlign: "left", padding: 0 }}>
          <div style={{ fontWeight: 700 }}>{p.name}</div>
          <div className="small">{brl(p.price)} · {p.category}{p.available ? "" : " · esgotado"}</div>
        </button>
        <label className="check" title="Disponível"><input type="checkbox" checked={p.available} onChange={(e) => onChange({ available: e.target.checked })} /></label>
      </div>
      {open && (
        <>
          <div className="two">
            <label className="field"><span>Nome</span><input className="input" value={p.name} onChange={(e) => onChange({ name: e.target.value })} /></label>
            <label className="field"><span>Categoria</span>
              <select className="select" value={p.category} onChange={(e) => onChange({ category: e.target.value })}>
                {[...new Set([...cats, p.category])].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="field"><span>Preço (R$)</span><PriceInput value={p.price} onChange={(v) => onChange({ price: v ?? 0 })} /></label>
            <label className="field"><span>Preço “de” (opcional, mostra desconto)</span><PriceInput value={p.oldPrice} onChange={(v) => onChange({ oldPrice: v })} /></label>
          </div>
          <label className="field"><span>Descrição</span><textarea className="textarea" value={p.description || ""} onChange={(e) => onChange({ description: e.target.value })} /></label>
          <label className="field"><span>Opções (uma por linha — ex.: “Tamanho: P, M, G”)</span>
            <textarea className="textarea" rows={2} value={vt} onChange={(e) => { setVt(e.target.value); onChange({ variants: textToVariants(e.target.value) }); }} />
          </label>
          <label className="check"><input type="checkbox" checked={!!p.featured} onChange={(e) => onChange({ featured: e.target.checked })} />Mostrar em Destaques</label>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="mini" onClick={() => onMove(-1)}>↑ Subir</button>
            <button className="mini" onClick={() => onMove(1)}>↓ Descer</button>
            <button className="mini" onClick={onDup}>Duplicar</button>
            {p.image && <button className="mini" onClick={() => onChange({ image: undefined })}>Tirar foto</button>}
            <button className="mini" style={{ color: "var(--danger)" }} onClick={onDel}>Excluir</button>
          </div>
        </>
      )}
    </div>
  );
}

function Share({ slug, name }: { slug: string; name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState("");
  useEffect(() => {
    const u = `${window.location.origin}/${slug}`;
    setUrl(u);
    if (ref.current) QRCode.toCanvas(ref.current, u, { width: 260, margin: 2 });
  }, [slug]);
  const msg = `Agora você pode ver nossos produtos e fazer seu pedido pelo celular! 🛍️\n${url}\nÉ só escolher e o pedido chega aqui no WhatsApp.`;
  const copy = async (t: string, label: string) => { try { await navigator.clipboard.writeText(t); setCopied(label); } catch { setCopied("Não foi possível copiar"); } };
  return (
    <div className="panel">
      <h2>Divulgar a loja</h2>
      <div className="qr">
        <canvas ref={ref} />
        <button className="mini" onClick={() => { const a = document.createElement("a"); a.href = ref.current!.toDataURL("image/png"); a.download = `qrcode-${slug}.png`; a.click(); }}>Baixar QR code (para imprimir no balcão)</button>
      </div>
      <label className="field"><span>Link da loja</span><input className="input" readOnly value={url} onFocus={(e) => e.target.select()} /></label>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <button className="btn" style={{ background: "#16161b" }} onClick={() => copy(url, "Link copiado")}>Copiar link</button>
        <button className="btn soft" onClick={() => copy(msg, "Mensagem copiada")}>Copiar mensagem para clientes</button>
        <a className="btn wa" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">Enviar no WhatsApp</a>
      </div>
      {copied && <div className="status ok">{copied}</div>}
      <p className="small" style={{ margin: 0 }}>Dica: coloque o link na bio do Instagram de {name} e no status do WhatsApp.</p>
    </div>
  );
}
