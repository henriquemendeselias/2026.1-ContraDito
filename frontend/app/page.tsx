"use client";

import React, { useState, useEffect, useMemo } from "react";
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

const PER_PAGE = 10;

const fuzzyMatch = (str: string, query: string) => {
  if (!str) return false;

  const s = str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const q = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return s.includes(q);
};

const getInitials = (name: string) => {
  if (!name) return "";

  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

export default function Home() {
  const router = useRouter();

  const [politicosApi, setPoliticosApi] = useState<Politico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroApi, setErroApi] = useState(false);

  const [query, setQuery] = useState("");
  const [partido, setPartido] = useState("");
  const [estado, setEstado] = useState("");
  const [ordem, setOrdem] = useState("score_desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const buscarPoliticos = async () => {
      try {
        setLoading(true);
        setErroApi(false);

        const response = await fetch(
          "http://localhost:8001/api/politicos"
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar API");
        }

        const data = await response.json();

        let lista: Politico[] = [];

        if (Array.isArray(data)) {
          lista = data;
        } else if (Array.isArray(data.itens)) {
          lista = data.itens;
        } else if (Array.isArray(data.politicos)) {
          lista = data.politicos;
        } else if (Array.isArray(data.data)) {
          lista = data.data;
        }

        setPoliticosApi(lista);

        console.log("DADOS API:", lista);
      } catch (error) {
        console.error("Erro API:", error);
        setErroApi(true);
      } finally {
        setLoading(false);
      }
    };

    buscarPoliticos();
  }, []);

  const normalizedData = useMemo(() => {
    return politicosApi.map((p) => {
      const nome = p.nome_urna || p.nome || "Sem nome";

      let score = 0;

      if (typeof p.score === "number") {
        score = p.score;
      } else if (typeof p.score_coerencia === "number") {
        score =
          p.score_coerencia <= 1
            ? p.score_coerencia * 100
            : p.score_coerencia;
      }

      return {
        ...p,
        nome,
        score,
      };
    });
  }, [politicosApi]);

  const filteredData = useMemo(() => {
    let result = normalizedData.filter((p: any) => {
      if (query && !fuzzyMatch(p.nome, query)) return false;

      if (partido && p.partido !== partido) return false;

      if (estado && p.uf !== estado) return false;

      return true;
    });

    result.sort((a: any, b: any) => {
      if (ordem === "score_desc") return b.score - a.score;

      if (ordem === "score_asc") return a.score - b.score;

      if (ordem === "nome_asc")
        return a.nome.localeCompare(b.nome);

      if (ordem === "nome_desc")
        return b.nome.localeCompare(a.nome);

      return 0;
    });

    return result;
  }, [normalizedData, query, partido, estado, ordem]);

  const maxPage =
    Math.ceil(filteredData.length / PER_PAGE) || 1;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, partido, estado, ordem]);

  const handleReset = () => {
    setQuery("");
    setPartido("");
    setEstado("");
    setOrdem("score_desc");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-[60px] bg-[#0d1117]/90 backdrop-blur border-b border-white/10">
        <a
          href="/"
          className="text-xl font-bold uppercase tracking-wider"
        >
          Contra
          <span className="text-[#39d98a]">Dito</span>
        </a>

          {/* NOVO BOTÃO FUNCIONAL */}
          <button
           onClick={() => router.push("/comparacao")}
            className="px-4 py-2 border border-[#39d98a]/50 rounded-lg text-white hover:bg-[#39d98a]/10 transition">
            Ringue
            </button>

        <a
          href="#diretorio"
          className="px-4 py-2 border border-[#39d98a] rounded-lg text-[#39d98a] hover:bg-[#39d98a] hover:text-black transition"
        >
          Diretório
        </a>
      </nav>

      {/* HERO */}
      <header className="text-center px-6 pt-20 pb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold">
          O que foi dito{" "}
          <span className="text-[#39d98a]">
            vs.
          </span>{" "}
          realidade
        </h1>

        <p className="mt-4 text-[#8b949e] uppercase tracking-[0.2em] text-sm">
          Transparência com Inteligência Artificial
        </p>
      </header>

      {/* MAIN */}
      <main
        id="diretorio"
        className="max-w-5xl mx-auto px-5 pb-20"
      >
        {/* ERRO */}
        {erroApi && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6 text-center">
            Erro ao carregar API.
          </div>
        )}

        {/* FILTROS */}
        <div className="flex flex-wrap gap-3 bg-[#161b22] border border-white/10 rounded-2xl p-4 mb-6">
          <input
            type="search"
            placeholder="Buscar político..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className="flex-1 min-w-[180px] bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2 outline-none"
          />

          <select
            value={partido}
            onChange={(e) =>
              setPartido(e.target.value)
            }
            className="bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2"
          >
            <option value="">Partido</option>
            <option value="PL">PL</option>
            <option value="PT">PT</option>
            <option value="MDB">MDB</option>
            <option value="PP">PP</option>
            <option value="PSOL">PSOL</option>
          </select>

          <select
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value)
            }
            className="bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2"
          >
            <option value="">UF</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="DF">DF</option>
          </select>

          <select
            value={ordem}
            onChange={(e) =>
              setOrdem(e.target.value)
            }
            className="bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2"
          >
            <option value="score_desc">
              Maior score
            </option>

            <option value="score_asc">
              Menor score
            </option>

            <option value="nome_asc">
              Nome A-Z
            </option>

            <option value="nome_desc">
              Nome Z-A
            </option>
          </select>
        </div>

        {/* TABELA */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th className="p-4 text-left text-xs uppercase text-[#8b949e]">
                  Político
                </th>

                <th className="p-4 text-left text-xs uppercase text-[#8b949e]">
                  Partido
                </th>

                <th className="hidden sm:table-cell p-4 text-left text-xs uppercase text-[#8b949e]">
                  Cargo
                </th>

                <th className="p-4 text-right text-xs uppercase text-[#8b949e]">
                  Coerência
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map(
                  (_, i) => (
                    <tr
                      key={i}
                      className="border-t border-white/10"
                    >
                      <td className="p-4">
                        Carregando...
                      </td>
                    </tr>
                  )
                )
              ) : paginatedData.length > 0 ? (
                paginatedData.map((p: any) => {
                  const scoreColor =
                    p.score >= 70
                      ? "text-[#39d98a]"
                      : p.score >= 50
                      ? "text-yellow-400"
                      : "text-red-400";

                  return (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/politico/${p.id}`)} // 3. ADICIONAMOS A AÇÃO DE CLIQUE E ROTEAMENTO AQUI
                      className="border-t border-white/10 hover:bg-[#1c2333] transition cursor-pointer" // E O CURSOR-POINTER AQUI
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.foto_url ? (
                            <img
                              src={p.foto_url}
                              alt={p.nome}
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#1c2333] flex items-center justify-center text-xs">
                              {getInitials(p.nome)}
                            </div>
                          )}

                          <span className="font-medium">
                            {p.nome}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-[#8b949e]">
                        {p.partido}
                      </td>

                      <td className="hidden sm:table-cell p-4 text-[#8b949e]">
                        {p.cargo}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-[80px] h-[6px] bg-[#0d1117] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                p.score >= 70
                                  ? "bg-[#39d98a]"
                                  : p.score >= 50
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                              style={{
                                width: `${p.score}%`,
                              }}
                            />
                          </div>

                          <span
                            className={`font-bold min-w-[55px] text-right ${scoreColor}`}
                          >
                            {p.score.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-16"
                  >
                    <p className="text-[#8b949e] mb-4">
                      Nenhum político encontrado.
                    </p>

                    <button
                      onClick={handleReset}
                      className="px-4 py-2 border border-white/10 rounded-lg hover:bg-[#1c2333]"
                    >
                      Limpar filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINAÇÃO */}
          {!loading &&
            filteredData.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <span className="text-sm text-[#8b949e]">
                  Página {currentPage} de {maxPage}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (prev) => prev - 1
                      )
                    }
                    className="px-3 py-1 border border-white/10 rounded disabled:opacity-40"
                  >
                    ←
                  </button>

                  <button
                    disabled={
                      currentPage === maxPage
                    }
                    onClick={() =>
                      setCurrentPage(
                        (prev) => prev + 1
                      )
                    }
                    className="px-3 py-1 border border-white/10 rounded disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-8 border-t border-white/10 text-xs text-[#8b949e] uppercase tracking-widest">
        Contradito — Transparência e Dados Abertos
      </footer>
    </div>
  );
}