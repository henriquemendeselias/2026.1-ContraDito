// Tipos canônicos do portal de consulta (SEM score — produto não exibe coerência).
// Parlamentar é identificado por (casa, id). Para os tipos legados com score, usados
// só pela página antiga em rework (/politico/[id]), ver `@/lib/types-legacy`.

import type { Casa } from "@/lib/casa";

export type Parlamentar = {
  id: number;
  casa: Casa;
  nome_civil: string;
  nome_urna: string;
  partido: string;
  cargo: string;
  estado: string;
  status_mandato: string;
  url_foto: string | null;
  data_ultima_atualizacao: string;
};

export type PaginaParlamentares = {
  total_registros: number;
  pagina_atual: number;
  tamanho_pagina: number;
  total_paginas: number;
  itens: Parlamentar[];
};

export type Proposicao = {
  id: string; // UUID
  proposicao_id: string; // ex: "PL 2630/2020"
  casa: Casa;
  tipo: string;
  numero: number;
  ano: number;
  ementa: string;
  data_votacao: string | null;
  url_texto_inteiro: string | null;
  resumo_executivo: string | null;
};

export type PaginaProposicoes = {
  total_registros: number;
  pagina_atual: number;
  tamanho_pagina: number;
  total_paginas: number;
  itens: Proposicao[];
};

export type PolarizacaoProposicao = {
  proposicao_id: string;
  qtd_sim: number;
  qtd_nao: number;
  pct_sim: number;
  pct_nao: number;
  polarizacao: number;
  classificacao: "Consensual" | "Dividida" | "Altamente Polarizada";
};
