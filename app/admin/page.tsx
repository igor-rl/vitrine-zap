"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { slugify } from "@/lib/format";

type Row = { slug: string; name: string; segment?: string; demo: boolean; saved: boolean; products: number; updatedAt?: string };

const SEGMENTS = [
  ["moveis", "Móveis e eletro"],
  ["restaurante", "Pizzaria / restaurante"],
  ["roupas", "Roupas e acessórios"],
  ["mercado", "Supermercado"],
  ["construcao", "Material de construção"],
  ["geral", "Comércio em geral"],
] as const;

export default function MasterAdmin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", slug: "", segment: "moveis", whatsapp: "", pin: "" });
  const [slugTouched, setSlugTouched] = useState(false);

  const load = useCallback(async (k: string) => {
    const r = await fetch("/api/stores", { headers: { "x-admin-key": k } });
    if (!r.ok) throw new Error("Senha incorreta.");
    const j = await r.json();
    setRows(j.stores);
  }, []);

  useEffect(() => {
    try {
      const k = sessionStorage.getItem("master");
      if (k) load(k).then(() => { setKey(k); setAuthed(true); }).catch(() => {});
    } catch {}
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await load(key);
      setAuthed(true);
      try { sessionStorage.setItem("master", key); } catch {}
    } catch (e) { setErr((e as Error).message); }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const r = await fetch("/api/stores", {
      method: "POST", headers: { "content-type": "application/json", "x-admin-key": key }, body: JSON.stringify(f),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(j.error || "Erro ao criar.");
    window.location.href = `/admin/${j.slug}`;
  }

  async function reset(slug: string) {
    if (!confirm(`Restaurar /${slug} para a versão original? As edições salvas serão apagadas.`)) return;
    await fetch(`/api/stores/${slug}`, { method: "DELETE", headers: { "x-admin-key": key } });
    await load(key);
  }

  if (!authed) {
    return (
      <div className="wrap login">
        <form className="panel" onSubmit={login}>
          <h2>Painel geral</h2>
          <p className="small" style={{ margin: 0 }}>Acesso do administrador (senha mestra). Lojista? Use o link do painel da sua loja.</p>
          <label className="field"><span>Senha mestra</span>
            <input className="input" type="password" value={key} onChange={(e) => setKey(e.target.value)} autoFocus />
          </label>
          {err && <div className="err">{err}</div>}
          <button className="btn block" style={{ background: "#16161b" }}>Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="topbar"><div className="wrap"><strong>Painel geral</strong><Link href="/">Início</Link></div></div>
      <div className="wrap">
        <form className="panel" onSubmit={create}>
          <h2>Nova loja</h2>
          <div className="two">
            <label className="field"><span>Nome da loja</span>
              <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) })} required />
            </label>
            <label className="field"><span>Endereço (link)</span>
              <input className="input" value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} required />
              <span className="small">seusite.com/<b>{f.slug || "nome-da-loja"}</b></span>
            </label>
            <label className="field"><span>Segmento (modelo inicial)</span>
              <select className="select" value={f.segment} onChange={(e) => setF({ ...f, segment: e.target.value })}>
                {SEGMENTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="field"><span>WhatsApp da loja</span>
              <input className="input" inputMode="tel" placeholder="(77) 99999-9999" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} required />
            </label>
            <label className="field"><span>PIN do lojista (4 a 8 números)</span>
              <input className="input" inputMode="numeric" value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 8) })} required />
            </label>
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn" style={{ background: "#16161b" }} disabled={busy}>{busy ? "Criando…" : "Criar loja com produtos de exemplo"}</button>
        </form>

        <div className="panel">
          <h2>Lojas ({rows.length})</h2>
          <div>
            {rows.map((r) => (
              <div className="list-row" key={r.slug}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.name} {r.demo && <span className="small">· demo</span>}</div>
                  <div className="small">/{r.slug} · {r.products} produtos{r.updatedAt ? ` · atualizada ${new Date(r.updatedAt).toLocaleDateString("pt-BR")}` : ""}</div>
                </div>
                <div className="row" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <a className="mini" href={`/${r.slug}`} target="_blank" rel="noreferrer">Ver</a>
                  <Link className="mini" href={`/admin/${r.slug}`}>Editar</Link>
                  {r.demo && r.saved && <button className="mini" onClick={() => reset(r.slug)}>Restaurar</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
