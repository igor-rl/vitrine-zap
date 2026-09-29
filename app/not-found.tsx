import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: "80px 16px", textAlign: "center" }}>
      <h1>Loja não encontrada</h1>
      <p style={{ color: "var(--muted)" }}>Confira o endereço digitado.</p>
      <Link className="btn" href="/">Voltar ao início</Link>
    </main>
  );
}
