"use client";

// Diretório completo de parlamentares (Câmara + Senado).
// VERSÃO INICIAL (placeholder funcional): carrega de verdade, lê ?busca=&casa=,
// pré-preenche os controles e ecoa o escopo. A listagem real (887 parlamentares,
// fetch-all-once client-side — ADR 003) entra em tarefa seguinte. Sem dado mock.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Construction, ArrowLeft } from "lucide-react";
import { CASA, tint, type Casa } from "@/lib/casa";

type Mode = "todos" | Casa;
const MODES: { key: Mode; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "camara", label: "Câmara" },
  { key: "senado", label: "Senado" },
];

function DiretorioInner() {
  const router = useRouter();
  const params = useSearchParams();
  const casaParam = params.get("casa");
  const modeInicial: Mode = casaParam === "camara" || casaParam === "senado" ? casaParam : "todos";

  const [busca, setBusca] = useState(params.get("busca") ?? "");
  const [mode, setMode] = useState<Mode>(modeInicial);

  function sync(nextBusca: string, nextMode: Mode) {
    const sp = new URLSearchParams();
    if (nextBusca.trim()) sp.set("busca", nextBusca.trim());
    if (nextMode !== "todos") sp.set("casa", nextMode);
    const qs = sp.toString();
    router.replace(`/diretorio${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="pt-14 min-h-screen">
      <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-5">
        <h1 className="font-display text-bright font-black text-4xl sm:text-5xl">Diretório de parlamentares</h1>
        <p className="text-mid mt-2">Listagem completa — Câmara dos Deputados e Senado Federal.</p>
      </header>

      {/* barra de controles sticky */}
      <div className="sticky top-14 z-30 bg-canvas/90 backdrop-blur-md border-y border-rim/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex flex-wrap items-center gap-3">
          {/* seletor de Casa */}
          <div className="inline-flex p-1 rounded-xl bg-card-alt/80 border border-rim/40">
            {MODES.map((m) => {
              const active = mode === m.key;
              const hex = m.key === "todos" ? null : CASA[m.key as Casa].hex;
              return (
                <button key={m.key} onClick={() => { setMode(m.key); sync(busca, m.key); }}
                  className={`px-4 h-9 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${active ? "text-bright" : "text-mid hover:text-bright"}`}
                  style={active ? { background: hex ? tint(hex, 18) : "var(--color-card)", boxShadow: `inset 0 0 0 1px ${hex ? tint(hex, 50) : "var(--color-rim)"}` } : undefined}>
                  {hex && <span className="w-2 h-2 rounded-full" style={{ background: active ? hex : tint(hex, 50) }} />}
                  {m.label}
                </button>
              );
            })}
          </div>
          {/* busca */}
          <form onSubmit={(e) => { e.preventDefault(); sync(busca, mode); }} className="flex-1 min-w-[200px]">
            <label className="flex items-center gap-2 h-10 px-3 rounded-lg bg-card border border-rim/40 focus-within:border-coherent/60">
              <Search size={16} className="text-dim shrink-0" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar parlamentar..."
                className="flex-1 bg-transparent outline-none text-sm text-bright placeholder:text-dim" />
            </label>
          </form>
          {/* filtros UF/Partido — em breve (desabilitados no placeholder) */}
          <select disabled aria-label="Filtro UF (em breve)" className="h-10 px-3 rounded-lg bg-card border border-rim/40 text-sm text-dim/60 cursor-not-allowed">
            <option>UF (em breve)</option>
          </select>
          <select disabled aria-label="Filtro Partido (em breve)" className="h-10 px-3 rounded-lg bg-card border border-rim/40 text-sm text-dim/60 cursor-not-allowed">
            <option>Partido (em breve)</option>
          </select>
        </div>
      </div>

      {/* painel honesto de construção */}
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
        <div className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-card border border-rim/40 mb-5">
          <Construction size={24} className="text-coherent" />
        </div>
        <h2 className="font-display text-bright text-2xl">Listagem completa em construção</h2>
        <p className="text-mid mt-3 leading-relaxed">
          A tabela com os <strong className="text-bright">887 parlamentares</strong> (642 da Câmara e 245 do
          Senado), com busca, filtros e seletor de Casa, está sendo implementada — carregada de uma só vez
          no cliente e ordenada globalmente (ver decisão arquitetural ADR 003).
        </p>

        {/* escopo ativo ecoado dos query params */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-dim">Escopo selecionado:</span>
          <span className="px-3 py-1 rounded-full border border-rim/50 text-mid">
            Casa: <span className="text-bright">{mode === "todos" ? "Todas" : CASA[mode as Casa].label}</span>
          </span>
          {busca.trim() && (
            <span className="px-3 py-1 rounded-full border border-rim/50 text-mid">
              Busca: <span className="text-bright">“{busca.trim()}”</span>
            </span>
          )}
        </div>

        <div className="mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-coherent hover:underline">
            <ArrowLeft size={15} /> Voltar à Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function DiretorioPage() {
  return (
    <Suspense fallback={<div className="pt-14" />}>
      <DiretorioInner />
    </Suspense>
  );
}
