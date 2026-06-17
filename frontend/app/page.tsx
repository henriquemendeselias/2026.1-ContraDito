"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getParlamentares } from "@/lib/api";
import type { Filters } from "@/components/FilterBar";
import { FilterBar } from "@/components/FilterBar";
import { ParlamentarCard } from "@/components/ParlamentarCard";
import { RowSkeleton } from "@/components/ui/Skeleton";
import type { PaginaParlamentares } from "@/lib/types";

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>({
    busca: "", partido: "", estado: "", cargo: "", ordem: "mais_coerentes", incluirSemDados: false,
  });
  const [pagina, setPagina] = useState(1);
  const [data, setData] = useState<PaginaParlamentares | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getParlamentares({
        busca: f.busca || undefined,
        partido: f.partido || undefined,
        estado: f.estado || undefined,
        cargo: f.cargo || undefined,
        ordem: f.ordem || undefined,
        pagina: p,
        tamanho: 20,
      });
      setData(result);
    } catch {
      setError("Não foi possível carregar os parlamentares. Verifique se a API está disponível.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filters, pagina); }, [filters, pagina, load]);

  const handleFilters = useCallback((f: Filters) => {
    setFilters(f);
    setPagina(1);
  }, []);

  return (
    <div className="pt-14 min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center">
        <div className="inline-flex flex-col items-center gap-2 mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-dim">
            Câmara · Senado · Brasil
          </p>
          <div className="font-display font-black text-[3.5rem] sm:text-[5rem] md:text-[7rem] leading-none tracking-tight">
            <span className="text-bright">CONTRA</span><span className="text-coherent italic font-normal">dito</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-rim" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-dim">
              transparência parlamentar via IA
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-rim" />
          </div>
        </div>

        <h1 className="font-display font-bold text-bright leading-[1.05] text-4xl sm:text-5xl md:text-[4.5rem]">
          O que foi{" "}
          <span className="italic font-normal text-mid">dito</span>{" "}
          <span className="text-coherent">vs.</span>{" "}
          realidade
        </h1>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-6 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-pulse">01</p>
            <h3 className="font-display text-lg font-bold text-bright leading-snug">
              Discurso<br />
              <span className="italic font-normal text-mid">encontra</span> voto
            </h3>
            <p className="text-sm text-mid leading-relaxed">
              A IA compara o que cada parlamentar declarou em plenário com o voto
              que registrou nas mesmas proposições — cruzando texto e dado oficial.
            </p>
          </div>

          <div className="glass rounded-xl p-6 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-coherent">02</p>
            <h3 className="font-display text-lg font-bold text-bright leading-snug">
              Score de<br />
              <span className="italic font-normal text-mid">Coerência</span>
            </h3>
            <p className="text-sm text-mid leading-relaxed">
              Calculado sobre os votos válidos — ausências e abstenções ficam de
              fora. Cada votação analisada conta: votos alinhados ao discurso
              sobem o score, contradições o reduzem.
            </p>
          </div>

          <div className="glass rounded-xl p-6 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-aurum">03</p>
            <h3 className="font-display text-lg font-bold text-bright leading-snug">
              Transparência,<br />
              <span className="italic font-normal text-mid">não veredicto</span>
            </h3>
            <p className="text-sm text-mid leading-relaxed">
              O ContraDito organiza informação pública num só lugar. O julgamento
              é seu — a plataforma apenas torna o contraste visível.
            </p>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <FilterBar onChange={handleFilters} />

        {data && !loading && (() => {
          const semDados = data.itens.filter((p) => p.score_coerencia === null).length;
          const ocultos = !filters.incluirSemDados ? semDados : 0;
          return (
            <p className="mt-3 text-xs text-dim">
              {data.total_registros.toLocaleString("pt-BR")} parlamentares
              {filters.busca ? ` para "${filters.busca}"` : ""}
              {ocultos > 0 && (
                <span className="ml-2 text-dim/60">
                  · {ocultos} sem dados suficientes ocultos
                </span>
              )}
            </p>
          );
        })()}

        {/* Table */}
        <div className="mt-4 rounded-xl border border-white/[0.07] overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-4 px-6 py-2.5 bg-card-alt border-b border-white/[0.07]">
            <div className="hidden sm:block w-0.5 flex-shrink-0" />
            <div className="w-11 flex-shrink-0" />
            <span className="flex-1 text-[10px] uppercase tracking-widest text-dim font-medium">
              PARLAMENTAR
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-widest text-dim font-medium w-14">
              PARTIDO
            </span>
            <span className="hidden md:block text-[10px] uppercase tracking-widest text-dim font-medium w-36">
              CARGO
            </span>
            <span className="text-[10px] uppercase tracking-widest text-dim font-medium text-right" style={{ minWidth: "7.5rem" }}>
              COERÊNCIA
            </span>
          </div>

          {/* Content */}
          {error ? (
            <div className="py-16 text-center space-y-3 bg-card">
              <p className="text-mid text-sm">{error}</p>
              <button onClick={() => load(filters, pagina)} className="text-xs text-pulse hover:underline">
                Tentar novamente
              </button>
            </div>
          ) : loading ? (
            Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} />)
          ) : data?.itens.length === 0 ? (
            <div className="py-16 text-center text-mid text-sm bg-card">
              Nenhum parlamentar encontrado para os filtros selecionados.
            </div>
          ) : (
            data?.itens
              .filter((p) => filters.incluirSemDados || p.score_coerencia !== null)
              .map((p) => <ParlamentarCard key={p.id} parlamentar={p} />)
          )}
        </div>

        {/* Pagination */}
        {data && data.total_paginas > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-mid border border-white/10 rounded-lg hover:bg-card-alt disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span className="text-sm text-dim tabular-nums">
              {pagina} / {data.total_paginas}
            </span>
            <button
              onClick={() => setPagina((p) => Math.min(data.total_paginas, p + 1))}
              disabled={pagina === data.total_paginas || loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-mid border border-white/10 rounded-lg hover:bg-card-alt disabled:opacity-30 transition-colors"
            >
              Próxima <ChevronRight size={14} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
