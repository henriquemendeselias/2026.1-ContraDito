"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Politico {
  id: number;
  nome_urna?: string;
  nome?: string;
  partido: string;
  uf: string;
  cargo: string;
  score?: number | null;
  score_coerencia?: number;
  foto_url?: string;
}

interface PoliticoNormalizado extends Politico {
  nome_display: string;
  score_normalizado: number;
}

const getInitials = (name: string): string => {
  if (!name) return "";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
};

const normalizeScore = (p: Politico): number => {
  if (typeof p.score === "number") return p.score;
  if (typeof p.score_coerencia === "number") {
    return p.score_coerencia <= 1 ? p.score_coerencia * 100 : p.score_coerencia;
  }
  return 0;
};

const scoreColor = (score: number): string => {
  if (score >= 76) return "text-[#39d98a]";
  if (score >= 26) return "text-yellow-400";
  return "text-red-400";
};

const barColor = (score: number): string => {
  if (score >= 76) return "bg-[#39d98a]";
  if (score >= 26) return "bg-yellow-400";
  return "bg-red-400";
};

export default function Comparacao() {
  const router = useRouter();

  const [politicos, setPoliticos] = useState<PoliticoNormalizado[]>([]);
  const [polA, setPolA] = useState<PoliticoNormalizado | null>(null);
  const [polB, setPolB] = useState<PoliticoNormalizado | null>(null);
  const [erroApi, setErroApi] = useState<boolean>(false);

  useEffect(() => {
    fetch("http://localhost:8001/api/politicos")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const lista: Politico[] = Array.isArray(data)
          ? data
          : data.itens || data.politicos || data.data || [];

        const normalizados: PoliticoNormalizado[] = lista.map((p) => ({
          ...p,
          nome_display: p.nome_urna || p.nome || "Sem nome",
          score_normalizado: normalizeScore(p),
        }));

        setPoliticos(normalizados);
      })
      .catch(() => setErroApi(true));
  }, []);

  // Usa dados já carregados na lista — sem chamada individual à API
  const selecionarPolitico = (id: string, lado: "A" | "B") => {
    if (!id) {
      lado === "A" ? setPolA(null) : setPolB(null);
      return;
    }
    const encontrado = politicos.find((p) => String(p.id) === id) || null;
    lado === "A" ? setPolA(encontrado) : setPolB(encontrado);
  };

  const vencedor: "A" | "B" | "EMPATE" | null =
    polA && polB
      ? polA.score_normalizado > polB.score_normalizado
        ? "A"
        : polB.score_normalizado > polA.score_normalizado
        ? "B"
        : "EMPATE"
      : null;

  const CardPolitico = ({
    pol,
    vence,
  }: {
    pol: PoliticoNormalizado;
    vence: boolean;
  }) => (
    <div className="flex flex-col items-center gap-4">
      {pol.foto_url ? (
        <img
          src={pol.foto_url}
          alt={pol.nome_display}
          className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-[#1c2333] flex items-center justify-center text-2xl font-bold">
          {getInitials(pol.nome_display)}
        </div>
      )}

      <div className="text-center">
        <h2 className="text-xl font-bold">{pol.nome_display}</h2>
        <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">
          {pol.partido} • {pol.uf} • {pol.cargo}
        </p>
      </div>

      <div className="w-full text-center">
        <span className="text-xs uppercase tracking-widest text-[#8b949e] block mb-2">
          Coerência
        </span>
        <span className={`text-5xl font-extrabold ${scoreColor(pol.score_normalizado)}`}>
          {pol.score_normalizado.toFixed(1)}%
        </span>
        <div className="w-full h-[6px] bg-[#0d1117] rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${barColor(pol.score_normalizado)}`}
            style={{ width: `${pol.score_normalizado}%` }}
          />
        </div>
      </div>

      {vence && (
        <span className="mt-2 px-4 py-1 bg-[#39d98a]/10 border border-[#39d98a]/40 text-[#39d98a] text-xs rounded-full uppercase tracking-widest font-bold">
          ✦ Mais coerente
        </span>
      )}
    </div>
  );

  const CardPlaceholder = ({ letra }: { letra: string }) => (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-[#8b949e]">
      <div className="w-16 h-16 rounded-full bg-[#1c2333] flex items-center justify-center text-2xl font-bold">
        {letra}
      </div>
      <p className="text-sm">Selecione um político</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-[60px] bg-[#0d1117]/90 backdrop-blur border-b border-white/10">
        <a href="/" className="text-xl font-bold uppercase tracking-wider">
          Contra<span className="text-[#39d98a]">Dito</span>
        </a>
        <span className="px-4 py-2 border border-[#39d98a]/50 rounded-lg text-white text-sm">
          Ringue
        </span>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 border border-[#39d98a] rounded-lg text-[#39d98a] hover:bg-[#39d98a] hover:text-black transition text-sm"
        >
          Diretório
        </button>
      </nav>

      {/* HERO */}
      <header className="text-center px-6 pt-20 pb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold">
          O <span className="text-[#39d98a]">Ringue</span>
        </h1>
        <p className="mt-4 text-[#8b949e] uppercase tracking-[0.2em] text-sm">
          Confronto de Coerência Parlamentar
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-5 pb-20 space-y-8">

        {erroApi && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-center">
            Erro ao carregar a lista de políticos.
          </div>
        )}

        {/* SELETORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#161b22] border border-white/10 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-[#8b949e] mb-3">Político A</p>
            <select
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none cursor-pointer"
              onChange={(e) => selecionarPolitico(e.target.value, "A")}
            >
              <option value="">Selecionar político...</option>
              {politicos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome_display} ({p.partido})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#161b22] border border-white/10 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-[#8b949e] mb-3">Político B</p>
            <select
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none cursor-pointer"
              onChange={(e) => selecionarPolitico(e.target.value, "B")}
            >
              <option value="">Selecionar político...</option>
              {politicos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome_display} ({p.partido})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`bg-[#161b22] border rounded-2xl p-8 transition ${
            vencedor === "A" ? "border-[#39d98a]/60 shadow-[0_0_24px_#39d98a22]" : "border-white/10"
          }`}>
            {polA ? <CardPolitico pol={polA} vence={vencedor === "A"} /> : <CardPlaceholder letra="A" />}
          </div>

          <div className={`bg-[#161b22] border rounded-2xl p-8 transition ${
            vencedor === "B" ? "border-[#39d98a]/60 shadow-[0_0_24px_#39d98a22]" : "border-white/10"
          }`}>
            {polB ? <CardPolitico pol={polB} vence={vencedor === "B"} /> : <CardPlaceholder letra="B" />}
          </div>
        </div>

        {vencedor === "EMPATE" && (
          <div className="bg-[#161b22] border border-yellow-400/30 rounded-2xl p-6 text-center">
            <span className="text-yellow-400 font-bold uppercase tracking-widest text-sm">
              ⚖ Empate técnico
            </span>
          </div>
        )}

      </main>

      <footer className="text-center py-8 border-t border-white/10 text-xs text-[#8b949e] uppercase tracking-widest">
        Contradito — Transparência e Dados Abertos
      </footer>
    </div>
  );
}