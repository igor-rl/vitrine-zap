import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { del, get, list, put } from "@vercel/blob";
import { getAllSeeds } from "./seeds";
import type { PublicStore, Store } from "./types";

/**
 * Armazenamento em JSON.
 * - Na Vercel: um arquivo JSON por loja no Vercel Blob (stores/<slug>.json).
 * - Em desenvolvimento (sem BLOB_READ_WRITE_TOKEN): arquivos em .data/stores/.
 * O disco da Vercel é somente leitura, por isso o Blob em produção.
 */
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const LOCAL_DIR = path.join(process.cwd(), ".data", "stores");
const blobPath = (slug: string) => `stores/${slug}.json`;

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

async function readSaved(slug: string): Promise<Store | null> {
  if (useBlob()) {
    const res = await get(blobPath(slug), { access: "public", useCache: false });
    if (!res || res.statusCode !== 200) return null;
    return (await new Response(res.stream).json()) as Store;
  }
  try {
    const raw = await fs.readFile(path.join(LOCAL_DIR, `${slug}.json`), "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return null;
  }
}

export async function getStore(slug: string): Promise<Store | null> {
  if (!SLUG_RE.test(slug)) return null;
  const saved = await readSaved(slug);
  if (saved) return saved;
  return getAllSeeds().find((s) => s.slug === slug) ?? null;
}

export async function saveStore(store: Store): Promise<Store> {
  const data: Store = { ...store, updatedAt: new Date().toISOString() };
  const body = JSON.stringify(data, null, 2);
  if (useBlob()) {
    await put(blobPath(store.slug), body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
  } else {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DIR, `${store.slug}.json`), body, "utf8");
  }
  return data;
}

/** Apaga a versão salva. Para demos, isso restaura a versão original. */
export async function deleteSaved(slug: string): Promise<void> {
  if (useBlob()) {
    const { blobs } = await list({ prefix: blobPath(slug) });
    const hit = blobs.find((b) => b.pathname === blobPath(slug));
    if (hit) await del(hit.url);
  } else {
    await fs.rm(path.join(LOCAL_DIR, `${slug}.json`), { force: true });
  }
}

export async function listSlugs(): Promise<{ slug: string; saved: boolean; demo: boolean }[]> {
  const saved = new Set<string>();
  if (useBlob()) {
    let cursor: string | undefined;
    do {
      const r = await list({ prefix: "stores/", cursor });
      r.blobs.forEach((b) => saved.add(b.pathname.replace(/^stores\//, "").replace(/\.json$/, "")));
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
  } else {
    try {
      (await fs.readdir(LOCAL_DIR)).filter((f) => f.endsWith(".json")).forEach((f) => saved.add(f.slice(0, -5)));
    } catch {}
  }
  const demos = new Set(getAllSeeds().map((s) => s.slug));
  const all = new Set([...demos, ...saved]);
  return [...all].sort().map((slug) => ({ slug, saved: saved.has(slug), demo: demos.has(slug) }));
}

export async function uploadImage(slug: string, file: File): Promise<string> {
  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  if (useBlob()) {
    const r = await put(`images/${slug}/${name}`, file, { access: "public", contentType: file.type });
    return r.url;
  }
  const dir = path.join(process.cwd(), "public", "uploads", slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${slug}/${name}`;
}

export function toPublic(store: Store): PublicStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pinHash, ...rest } = store;
  return rest;
}
