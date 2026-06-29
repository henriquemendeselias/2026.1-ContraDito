"use client";

// Seleção da comparação 1×1: Casa + parlamentar A + parlamentar B, busca 100% em
// memória sobre o array completo (~887) que vem do Server Component (mesmos dados do
// /diretorio). Lê ?casa=&id1=&id2= como estado inicial e sincroniza a URL nas ações do
// usuário (contrato compartilhável — porta aberta para deep-link a partir do /diretorio).
// Restrição: os dois são SEMPRE da mesma Casa (a API só aceita um `casa`). Sem score.

import { Suspense, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { CASA, tint, type Casa } from "@/lib/casa";
import type { Parlamentar } from "@/lib/types";

export type Selecao = { casa: Casa; pol1: Parlamentar | null; pol2: Parlamentar | null };

const CASAS: Casa[] = ["camara", "senado"];

// ─── SelectionModal: modal de escolha de parlamentar ──────────────────────────────────
function SelectionModal({
  pool,
  excludeId,
  accent,
  label,
  onClose,
  onSelect,
}: {
  pool: Parlamentar[];
  excludeId?: number;
  accent: string;
  label: string;
  onClose: () => void;
  onSelect: (p: Parlamentar) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedParty, setSelectedParty] = useState("todos");
  const [selectedUF, setSelectedUF] = useState("todos");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const parties = useMemo(() => {
    return ["todos", ...new Set(pool.filter((p) => p.id !== excludeId).map((p) => p.partido))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [pool, excludeId]);

  const ufs = useMemo(() => {
    return ["todos", ...new Set(pool.filter((p) => p.id !== excludeId).map((p) => p.estado))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [pool, excludeId]);

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool
      .filter((p) => p.id !== excludeId)
      .filter((p) => {
        if (selectedParty !== "todos" && p.partido !== selectedParty) return false;
        if (selectedUF !== "todos" && p.estado !== selectedUF) return false;
        if (!q) return true;
        return (
          p.nome_urna.toLowerCase().includes(q) ||
          p.nome_civil.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.nome_urna.localeCompare(b.nome_urna, "pt-BR"));
  }, [pool, excludeId, query, selectedParty, selectedUF]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-card border border-rim/45 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rim/25 flex items-center justify-between">
          <div>
            <h3 className="font-display text-bright text-lg font-bold">Selecionar {label}</h3>
            <p className="text-xs text-dim mt-0.5">Filtre e selecione o parlamentar da listagem</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-card-alt border border-rim/30 flex items-center justify-center text-dim hover:text-bright hover:border-rim/60 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-5 border-b border-rim/15 bg-card-alt/20 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <label className="flex items-center gap-2 h-10 px-3 rounded-lg bg-card border border-rim/40 focus-within:border-coherent/60 transition-colors">
              <Search size={15} className="text-dim shrink-0" />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-bright placeholder:text-dim"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-dim hover:text-bright px-1 py-0.5 rounded"
                >
                  Limpar
                </button>
              )}
            </label>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="h-10 px-3 rounded-lg bg-card border border-rim/40 text-xs text-bright focus:outline-none focus:border-coherent/60 cursor-pointer"
            >
              <option value="todos">Todos os Partidos</option>
              {parties.filter((p) => p !== "todos").map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={selectedUF}
              onChange={(e) => setSelectedUF(e.target.value)}
              className="h-10 px-3 rounded-lg bg-card border border-rim/40 text-xs text-bright focus:outline-none focus:border-coherent/60 cursor-pointer"
            >
              <option value="todos">Todos os Estados</option>
              {ufs.filter((u) => u !== "todos").map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {filteredList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-rim/20 bg-card hover:bg-card-alt/80 hover:border-coherent/40 transition-all text-left group cursor-pointer"
                >
                  <Avatar name={p.nome_urna} url={p.url_foto} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-bright group-hover:text-coherent transition-colors truncate">
                      {p.nome_urna}
                    </p>
                    <p className="text-xs text-dim truncate">
                      {p.nome_civil}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-semibold text-mid bg-card-alt px-1.5 py-0.2 rounded border border-rim/20">
                        {p.partido}
                      </span>
                      <span className="text-[10px] text-dim">{p.estado}</span>
                      <span className="text-[10px] text-dim ml-auto uppercase tracking-wider text-[8px] font-medium">{p.cargo}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-mid text-sm font-medium">Nenhum parlamentar encontrado.</p>
              <p className="text-dim text-xs mt-1">Tente ajustar seus termos ou seletores de filtro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Picker de um lado: busca dentro do escopo da Casa, exclui o id do outro lado ──────
function Picker({
  pool, selected, onSelect, excludeId, accent, label,
}: {
  pool: Parlamentar[];
  selected: Parlamentar | null;
  onSelect: (p: Parlamentar | null) => void;
  excludeId?: number;
  accent: string;
  label: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (selected) {
    return (
      <div className="glass rounded-xl p-6 flex flex-col items-center gap-4 text-center" style={{ borderColor: tint(accent, 28) }}>
        <p className="text-[10px] uppercase tracking-widest" style={{ color: accent }}>{label}</p>
        <Avatar name={selected.nome_urna} url={selected.url_foto} size={72} ringColor={tint(accent, 55)} />
        <div>
          <p className="font-display text-xl font-bold text-bright">{selected.nome_urna}</p>
          <p className="text-xs text-dim mt-1">{selected.partido} · {selected.cargo} · {selected.estado}</p>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="text-xs text-dim hover:text-bright flex items-center gap-1 transition-colors cursor-pointer"
        >
          <X size={11} /> Remover
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="glass rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-rim/80 hover:bg-card-alt/30 transition-all cursor-pointer group min-h-[220px]"
        style={{ borderColor: tint(accent, 20) }}
      >
        <p className="text-[10px] uppercase tracking-widest text-dim group-hover:text-bright transition-colors">{label}</p>
        <div
          className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-all group-hover:scale-[1.03]"
          style={{ borderColor: tint(accent, 35) }}
        >
          <Plus size={20} style={{ color: accent }} />
        </div>
        <span className="text-sm font-semibold text-mid group-hover:text-bright transition-colors">
          Selecionar Parlamentar
        </span>
      </div>

      {modalOpen && (
        <SelectionModal
          pool={pool}
          excludeId={excludeId}
          accent={accent}
          label={label}
          onClose={() => setModalOpen(false)}
          onSelect={(p) => {
            onSelect(p);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function SeletorInner({
  parlamentares, onChange,
}: {
  parlamentares: Parlamentar[];
  onChange: (sel: Selecao) => void;
}) {
  const router = useRouter();
  const params = useSearchParams();

  // índice (casa-id) → Parlamentar, para resolver os ids da URL no estado inicial.
  const byKey = useMemo(() => {
    const m = new Map<string, Parlamentar>();
    for (const p of parlamentares) m.set(`${p.casa}-${p.id}`, p);
    return m;
  }, [parlamentares]);

  const casaInicial: Casa = params.get("casa") === "senado" ? "senado" : "camara";
  const resolve = (idParam: string | null, c: Casa): Parlamentar | null => {
    const id = Number(idParam);
    return idParam && Number.isFinite(id) ? byKey.get(`${c}-${id}`) ?? null : null;
  };

  const [casa, setCasa] = useState<Casa>(casaInicial);
  const [pol1, setPol1] = useState<Parlamentar | null>(() => resolve(params.get("id1"), casaInicial));
  const [pol2, setPol2] = useState<Parlamentar | null>(() => resolve(params.get("id2"), casaInicial));

  // Eleva a seleção ao pai a cada mudança (e no mount, cobrindo a pré-população por URL).
  useEffect(() => { onChange({ casa, pol1, pol2 }); }, [casa, pol1, pol2, onChange]);

  // Sincroniza a URL só nas AÇÕES do usuário (não no mount — lá a gente só lê).
  const syncUrl = useCallback((c: Casa, p1: Parlamentar | null, p2: Parlamentar | null) => {
    const sp = new URLSearchParams();
    sp.set("casa", c);
    if (p1) sp.set("id1", String(p1.id));
    if (p2) sp.set("id2", String(p2.id));
    router.replace(`/comparacao?${sp.toString()}`, { scroll: false });
  }, [router]);

  const pool = useMemo(() => parlamentares.filter((p) => p.casa === casa), [parlamentares, casa]);

  // Trocar de Casa invalida ambas as seleções (eram da casa anterior).
  function changeCasa(c: Casa) {
    if (c === casa) return;
    setCasa(c); setPol1(null); setPol2(null);
    syncUrl(c, null, null);
  }
  function selectPol1(p: Parlamentar | null) { setPol1(p); syncUrl(casa, p, pol2); }
  function selectPol2(p: Parlamentar | null) { setPol2(p); syncUrl(casa, pol1, p); }

  const accent = CASA[casa].hex;

  return (
    <div className="space-y-5">
      {/* seletor de Casa (segmented) — define o escopo de busca dos dois lados */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-card-alt/80 border border-rim/40">
          {CASAS.map((c) => {
            const active = casa === c;
            const hex = CASA[c].hex;
            return (
              <button
                key={c}
                onClick={() => changeCasa(c)}
                className={`px-5 h-9 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${active ? "text-bright" : "text-mid hover:text-bright"}`}
                style={active ? { background: tint(hex, 18), boxShadow: `inset 0 0 0 1px ${tint(hex, 50)}` } : undefined}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: active ? hex : tint(hex, 50) }} />
                {CASA[c].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* dois pickers, ambos no escopo da Casa atual; cada um exclui o id do outro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Picker pool={pool} selected={pol1} onSelect={selectPol1} excludeId={pol2?.id} accent={accent} label="Parlamentar A" />
        <Picker pool={pool} selected={pol2} onSelect={selectPol2} excludeId={pol1?.id} accent={accent} label="Parlamentar B" />
      </div>
    </div>
  );
}

export function SeletorComparacao(props: { parlamentares: Parlamentar[]; onChange: (sel: Selecao) => void }) {
  return (
    <Suspense fallback={<div className="h-48" />}>
      <SeletorInner {...props} />
    </Suspense>
  );
}
