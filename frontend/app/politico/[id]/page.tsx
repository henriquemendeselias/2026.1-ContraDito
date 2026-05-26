"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// FLAG: mude para false quando o backend estiver funcionando
// ============================================================
const USAR_MOCK = true;

interface Prova {
  informacao_extraida?: {
    tipo_documento?: string;
    data_evento?: string;
    texto_extraido?: string;
  };
  resultado?: {
    topico_identificado?: string;
    justificativa?: string;
    postura_extraida_do_texto?: string;
    coerente?: boolean;
  };
}

interface Politico {
  nome_urna?: string;
  nome?: string;
  cargo?: string;
  partido?: string;
  uf?: string;
  score_coerencia?: number;
  foto_url?: string;
}

interface DadosPolitico {
  politico?: Politico;
  provas?: Prova[];
}

// ============================================================
// DADOS MOCKADOS — edite conforme necessário
// ============================================================
const MOCK_COM_DADOS: DadosPolitico = {
  politico: {
    nome_urna: "Nome do Político",
    cargo: "Deputado Federal",
    partido: "PARTIDO",
    uf: "UF",
    score_coerencia: 42,
    foto_url: undefined,
  },
  provas: [
    {
      informacao_extraida: {
        tipo_documento: "Discurso",
        data_evento: "2024-03-15",
        texto_extraido:
          "Sou totalmente contra o aumento de impostos para a classe média trabalhadora.",
      },
      resultado: {
        topico_identificado: "Tributação e Impostos",
        justificativa:
          "O parlamentar votou a favor do projeto de lei que aumentou a alíquota de IR para rendas acima de R$5.000, contrariando declaração pública anterior.",
        postura_extraida_do_texto: "Contra aumento de impostos",
        coerente: false,
      },
    },
    {
      informacao_extraida: {
        tipo_documento: "Votação",
        data_evento: "2024-01-22",
        texto_extraido:
          "Defendo integralmente a transparência nos gastos públicos e a fiscalização rigorosa.",
      },
      resultado: {
        topico_identificado: "Transparência Pública",
        justificativa:
          "O parlamentar votou a favor do projeto de transparência nos contratos públicos, alinhado com suas declarações anteriores.",
        postura_extraida_do_texto: "Favorável à transparência",
        coerente: true,
      },
    },
  ],
};

// Mock para político SEM raio-x ainda
const MOCK_SEM_DADOS: DadosPolitico = {
  politico: {
    nome_urna: "Adail Filho",
    cargo: "Deputado Federal",
    partido: "MDB",
    uf: "UF",
    score_coerencia: 63,
    foto_url: "https://www.camara.leg.br/internet/deputado/bandep/220714.jpg",
  },
  provas: [],
};

// ============================================================

const getInitials = (name: string): string => {
  if (!name) return "";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
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

const tagColor = (score: number): string => {
  if (score >= 76) return "bg-[#39d98a]/10 border-[#39d98a]/30 text-[#39d98a]";
  if (score >= 26) return "bg-yellow-400/10 border-yellow-400/30 text-yellow-400";
  return "bg-red-400/10 border-red-400/30 text-red-400";
};

const tagLabel = (score: number): string => {
  if (score >= 76) return "Alta Coerência";
  if (score >= 26) return "Coerência Moderada";
  return "Baixa Coerência";
};

const fetchPolitico = async (id: string): Promise<DadosPolitico> => {
  const endpoints = [
    `http://localhost:8001/api/politicos/${id}`,
    `http://localhost:8000/api/politicos/${id}`,
    `http://localhost:8000/politicos/${id}`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      continue;
    }
  }
  throw new Error("Nenhum endpoint disponível");
};

export default function DossiePolitico({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: idDoPolitico } = use(params);

  const [dados, setDados] = useState<DadosPolitico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (USAR_MOCK) {
      // Alterne entre MOCK_COM_DADOS e MOCK_SEM_DADOS para testar os dois estados
      setTimeout(() => {
        setDados(MOCK_SEM_DADOS);
        setCarregando(false);
      }, 800); // simula delay de rede
      return;
    }

    fetchPolitico(idDoPolitico)
      .then((data) => {
        setDados(data);
        setCarregando(false);
      })
      .catch(() => {
        setErro(true);
        setCarregando(false);
      });
  }, [idDoPolitico]);

  const politico: Politico | undefined = dados?.politico;
  const provas: Prova[] = dados?.provas || [];
  const nome = politico?.nome_urna || politico?.nome || "Político";
  const score = politico?.score_coerencia ?? 0;
  const provasCoerentes = provas.filter((p) => p.resultado?.coerente === true).length;
  const provasIncoerentes = provas.filter((p) => p.resultado?.coerente === false).length;
  const semRaioX = provas.length === 0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-[60px] bg-[#0d1117]/90 backdrop-blur border-b border-white/10">
        <a href="/" className="text-xl font-bold uppercase tracking-wider">
          Contra<span className="text-[#39d98a]">Dito</span>
        </a>
        <button
          onClick={() => router.push("/comparacao")}
          className="px-4 py-2 border border-[#39d98a]/50 rounded-lg text-white hover:bg-[#39d98a]/10 transition text-sm"
        >
          Ringue
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 border border-[#39d98a] rounded-lg text-[#39d98a] hover:bg-[#39d98a] hover:text-black transition text-sm"
        >
          Diretório
        </button>
      </nav>

      {/* CARREGANDO */}
      {carregando && (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-10 h-10 border-2 border-[#39d98a]/30 border-t-[#39d98a] rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm uppercase tracking-widest">
            Montando dossiê...
          </p>
        </div>
      )}

      {/* ERRO */}
      {erro && !carregando && (
        <div className="max-w-5xl mx-auto px-5 pt-20">
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-6 text-center">
            <p className="font-bold mb-2">Não foi possível carregar o dossiê.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-2 px-4 py-2 border border-red-400/30 rounded-lg hover:bg-red-500/10 transition text-sm"
            >
              Voltar ao Diretório
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO */}
      {!carregando && !erro && dados && (
        <main className="max-w-5xl mx-auto px-5 pb-20">

          {/* BANNER mock — só aparece quando USAR_MOCK está ativo */}
          {USAR_MOCK && (
            <div className="mt-6 bg-yellow-400/5 border border-yellow-400/20 text-yellow-400 rounded-xl px-4 py-2 text-xs text-center uppercase tracking-widest">
              Modo demonstração — dados fictícios
            </div>
          )}

          {/* HERO */}
          <header className="text-center px-6 pt-12 pb-10">
            <div className="flex justify-center mb-6">
              {politico?.foto_url ? (
                <img
                  src={politico.foto_url}
                  alt={nome}
                  className="w-28 h-28 rounded-full object-cover border-2 border-white/10"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#161b22] border border-white/10 flex items-center justify-center text-3xl font-bold">
                  {getInitials(nome)}
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">{nome}</h1>

            <p className="text-[#8b949e] uppercase tracking-[0.2em] text-sm mb-6">
              {[politico?.cargo, politico?.partido, politico?.uf]
                .filter(Boolean)
                .join(" • ")}
            </p>

            {semRaioX ? (
              <span className="inline-block px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-widest bg-[#8b949e]/10 border-[#8b949e]/30 text-[#8b949e]">
                Aguardando análise
              </span>
            ) : (
              <span className={`inline-block px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-widest ${tagColor(score)}`}>
                {tagLabel(score)}
              </span>
            )}
          </header>

          {/* MÉTRICAS */}
          {!semRaioX && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-xs uppercase tracking-widest text-[#8b949e] mb-3">Score de Coerência</p>
                <span className={`text-5xl font-extrabold ${scoreColor(score)}`}>
                  {score.toFixed(1)}%
                </span>
                <div className="w-full h-[6px] bg-[#0d1117] rounded-full mt-4 overflow-hidden">
                  <div
                    className={`h-full ${barColor(score)} transition-all duration-700`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-xs uppercase tracking-widest text-[#8b949e] mb-3">Evidências Coerentes</p>
                <span className="text-5xl font-extrabold text-[#39d98a]">{provasCoerentes}</span>
                <p className="text-xs text-[#8b949e] mt-3">de {provas.length} analisadas</p>
              </div>

              <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-xs uppercase tracking-widest text-[#8b949e] mb-3">Contradições</p>
                <span className="text-5xl font-extrabold text-red-400">{provasIncoerentes}</span>
                <p className="text-xs text-[#8b949e] mt-3">registradas pela IA</p>
              </div>
            </div>
          )}

          {/* RAIO-X */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-widest text-[#8b949e]">
                Raio-X Parlamentar
              </h2>
              {!semRaioX && (
                <span className="text-xs text-[#8b949e]">
                  {provas.length} registro{provas.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">

              {semRaioX ? (
                /* MENSAGEM SEM RAIO-X */
                <div className="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0d1117] border border-white/10 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="#8b949e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                      <path d="M12 8v4M12 16h.01"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#e6edf3] font-bold text-lg mb-2">
                      Ainda estamos analisando o raio-x...
                    </p>
                    <p className="text-[#8b949e] text-sm max-w-sm leading-relaxed">
                      Nossa IA está coletando os discursos e votações deste parlamentar.
                      Em breve as evidências estarão disponíveis aqui.
                    </p>
                  </div>
                  <span className="px-4 py-1 bg-[#8b949e]/10 border border-[#8b949e]/20 text-[#8b949e] text-xs rounded-full uppercase tracking-widest font-bold">
                    Análise em andamento
                  </span>
                </div>

              ) : (
                /* LISTA DE PROVAS */
                <div className="divide-y divide-white/5">
                  {provas.map((prova, index) => {
                    const coerente = prova.resultado?.coerente;
                    return (
                      <div key={index} className="p-6 hover:bg-[#1c2333] transition">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#0d1117] border border-white/10 rounded text-xs uppercase tracking-widest text-[#8b949e]">
                              {prova.informacao_extraida?.tipo_documento || "Documento"}
                            </span>
                            {coerente !== undefined && (
                              <span className={`px-2 py-0.5 rounded border text-xs font-bold uppercase tracking-widest ${
                                coerente
                                  ? "bg-[#39d98a]/10 border-[#39d98a]/30 text-[#39d98a]"
                                  : "bg-red-400/10 border-red-400/30 text-red-400"
                              }`}>
                                {coerente ? "Coerente" : "Contradição"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#8b949e]">
                            {prova.informacao_extraida?.data_evento || "—"}
                          </span>
                        </div>

                        {prova.resultado?.topico_identificado && (
                          <h3 className="font-bold text-[#e6edf3] mb-2">
                            {prova.resultado.topico_identificado}
                          </h3>
                        )}

                        {prova.informacao_extraida?.texto_extraido && (
                          <p className="text-[#8b949e] text-sm italic mb-4 pl-3 border-l-2 border-white/10">
                            {prova.informacao_extraida.texto_extraido}
                          </p>
                        )}

                        <div className="bg-[#0d1117] rounded-xl p-4 space-y-2">
                          {prova.resultado?.justificativa && (
                            <p className="text-sm text-[#8b949e]">
                              <span className="text-[#e6edf3] font-medium">Análise da IA: </span>
                              {prova.resultado.justificativa}
                            </p>
                          )}
                          {prova.resultado?.postura_extraida_do_texto && (
                            <p className="text-sm text-[#8b949e]">
                              <span className="text-[#e6edf3] font-medium">Postura: </span>
                              {prova.resultado.postura_extraida_do_texto}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </section>

        </main>
      )}

      <footer className="text-center py-8 border-t border-white/10 text-xs text-[#8b949e] uppercase tracking-widest">
        Contradito — Transparência e Dados Abertos
      </footer>
    </div>
  );
}