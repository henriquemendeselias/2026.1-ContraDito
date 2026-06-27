import type { Casa } from "@/lib/casa";
import type { Discurso, PaginaDiscursos } from "@/lib/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001").replace(/\/$/, "");

export type FetchDiscursosParams = {
  politico_id?: number;
  termo?: string;
  pagina?: number;
  tamanho?: number;
};

/**
 * Busca a listagem paginada dos discursos para uma determinada casa legislativa.
 */
export async function fetchDiscursos(
  casa: Casa,
  params: FetchDiscursosParams = {}
): Promise<PaginaDiscursos> {
  const q = new URLSearchParams();
  if (params.politico_id) q.set("politico_id", String(params.politico_id));
  if (params.termo) q.set("termo", params.termo);
  if (params.pagina) q.set("pagina", String(params.pagina));
  if (params.tamanho) q.set("tamanho", String(params.tamanho));
  
  const qs = q.toString();
  const url = `${API_BASE}/api/${casa}/discursos${qs ? `?${qs}` : ""}`;
  
  // Utiliza cache: "no-store" para garantir dados sempre atualizados
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Falha ao buscar discursos para ${casa}: HTTP ${res.status}`);
  }
  
  return res.json() as Promise<PaginaDiscursos>;
}

/**
 * Busca os detalhes de um discurso específico.
 */
export async function fetchDiscursoDetalhado(casa: Casa, id: string): Promise<Discurso> {
  const url = `${API_BASE}/api/${casa}/discursos/${id}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Falha ao buscar detalhes do discurso ${id}: HTTP ${res.status}`);
  }
  return res.json() as Promise<Discurso>;
}
