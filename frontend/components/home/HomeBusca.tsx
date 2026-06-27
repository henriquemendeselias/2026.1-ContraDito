"use client";

// Vitrine de busca da Home (preview). Decisão A2: SEM resultados ao vivo — o submit
// (Enter ou seta) e o CTA "Ver lista completa" NAVEGAM para /diretorio?busca=…&casa=…
// O diretório completo (listagem real) é responsabilidade da rota /diretorio.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { CASA, tint, type Casa } from "@/lib/casa";

type Mode = "todos" | Casa;
const MODES: { key: Mode; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "camara", label: "Câmara" },
  { key: "senado", label: "Senado" },
];

export function HomeBusca() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [mode, setMode] = useState<Mode>("todos");

  function irParaDiretorio(comBusca: boolean) {
    const sp = new URLSearchParams();
    if (comBusca && busca.trim()) sp.set("busca", busca.trim());
    if (mode !== "todos") sp.set("casa", mode);
    const qs = sp.toString();
    router.push(`/diretorio${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* seletor de Casa (segmented) */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex p-1 rounded-xl bg-card-alt/80 border border-rim/40">
          {MODES.map((m) => {
            const active = mode === m.key;
            const hex = m.key === "todos" ? null : CASA[m.key as Casa].hex;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`px-4 h-9 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${active ? "text-bright" : "text-mid hover:text-bright"}`}
                style={active ? { background: hex ? tint(hex, 18) : "var(--color-card)", boxShadow: `inset 0 0 0 1px ${hex ? tint(hex, 50) : "var(--color-rim)"}` } : undefined}
              >
                {hex && <span className="w-2 h-2 rounded-full" style={{ background: active ? hex : tint(hex, 50) }} />}
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* busca (form → /diretorio) */}
      <form onSubmit={(e) => { e.preventDefault(); irParaDiretorio(true); }}>
        <label className="flex items-center gap-3 h-14 px-5 rounded-2xl bg-card/55 border border-rim/40 backdrop-blur-xl focus-within:border-coherent/60 transition-colors">
          <Search size={20} className="text-coherent shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar parlamentar por nome..."
            className="flex-1 bg-transparent outline-none text-base text-bright placeholder:text-dim"
          />
          <button type="submit" aria-label="Buscar parlamentar"
            className="h-9 w-9 grid place-items-center rounded-lg text-mid hover:text-bright hover:bg-white/5 transition-colors">
            <ArrowRight size={18} />
          </button>
        </label>
      </form>

      {/* CTA principal → diretório completo */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => irParaDiretorio(false)}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-medium bg-coherent text-canvas hover:opacity-90 transition-all"
        >
          Ver lista completa <ArrowRight size={17} />
        </button>
        <span className="text-xs text-dim">887 parlamentares mapeados →</span>
      </div>
    </div>
  );
}
